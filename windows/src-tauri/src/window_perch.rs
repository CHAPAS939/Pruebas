//! Window geometry only: never titles, content, screenshots or process credentials.
use crate::desktop::logic::Rect;

#[derive(Clone, Copy, Debug)]
pub struct Target {
    pub id: isize,
    pub pid: u32,
    pub fraction: f64,
}

pub enum Probe { Gone, Hidden, Visible(Rect) }

/// Both hosts use a 120pt panel: the top edge meets it 76% below the top.
pub fn origin(frame: Rect, fraction: f64, scale: f64, work: Rect) -> Option<(f64, f64)> {
    if !scale.is_finite() || scale <= 0.0 || !fraction.is_finite() ||
        frame.w < 100.0 * scale || frame.h < 60.0 * scale { return None; }
    let size = 120.0 * scale;
    let y = frame.y - size * 0.76;
    if y < work.y || y + size > work.y + work.h || work.w < size { return None; }
    let x = frame.x + fraction.clamp(0.12, 0.88) * frame.w - size / 2.0;
    Some((x.clamp(work.x, work.x + work.w - size), y))
}

pub fn accepts(point: (f64, f64), frame: Rect, scale: f64) -> bool {
    frame.w >= 100.0 * scale && frame.h >= 60.0 * scale &&
    point.0 >= frame.x && point.0 <= frame.x + frame.w &&
    (point.1 - frame.y).abs() <= 34.0 * scale
}

#[cfg(windows)]
mod win {
    use super::*;
    use windows::core::BOOL;
    use windows::Win32::Foundation::{HWND, LPARAM, RECT};
    use windows::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_CLOAKED, DWMWA_EXTENDED_FRAME_BOUNDS};
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_MENU};
    use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetForegroundWindow, GetWindowLongPtrW,
        GetWindowRect, GetWindowThreadProcessId, IsIconic, IsWindow, IsWindowVisible,
        GWL_EXSTYLE, WS_EX_TOOLWINDOW};

    fn hwnd(id: isize) -> HWND { HWND(id as *mut _) }

    fn owner(window: HWND) -> u32 {
        let mut pid = 0;
        unsafe { GetWindowThreadProcessId(window, Some(&mut pid)); }
        pid
    }

    fn cloaked(window: HWND) -> bool {
        let mut value = 0u32;
        unsafe {
            DwmGetWindowAttribute(window, DWMWA_CLOAKED,
                &mut value as *mut _ as *mut std::ffi::c_void, std::mem::size_of::<u32>() as u32).is_ok() && value != 0
        }
    }

    /// DWM reports physical visible bounds, without the invisible resize border or DPI virtualization.
    fn bounds(window: HWND) -> Option<Rect> {
        let mut r = RECT::default();
        unsafe {
            if DwmGetWindowAttribute(window, DWMWA_EXTENDED_FRAME_BOUNDS,
                &mut r as *mut _ as *mut std::ffi::c_void, std::mem::size_of::<RECT>() as u32).is_err() {
                GetWindowRect(window, &mut r).ok()?;
            }
        }
        Some(Rect { x: r.left as f64, y: r.top as f64, w: (r.right - r.left) as f64, h: (r.bottom - r.top) as f64 })
    }

    pub fn modifier_down() -> bool {
        unsafe { (GetAsyncKeyState(VK_MENU.0 as i32) as u16 & 0x8000) != 0 }
    }

    pub fn capture(point: (f64, f64), scale: f64) -> Option<Target> {
        struct Search { point: (f64, f64), scale: f64, found: Option<Target> }
        unsafe extern "system" fn visit(window: HWND, param: LPARAM) -> BOOL {
            let search = &mut *(param.0 as *mut Search);
            let pid = owner(window);
            if pid == std::process::id() || !IsWindowVisible(window).as_bool() || IsIconic(window).as_bool()
                || cloaked(window) || (GetWindowLongPtrW(window, GWL_EXSTYLE) & WS_EX_TOOLWINDOW.0 as isize) != 0 {
                return BOOL(1);
            }
            let Some(frame) = bounds(window) else { return BOOL(1) };
            let band = Rect { x: frame.x, y: frame.y - 34.0 * search.scale, w: frame.w, h: frame.h + 68.0 * search.scale };
            if !band.contains(search.point) { return BOOL(1); }
            // The frontmost normal window wins. A covered window never steals the drop.
            if accepts(search.point, frame, search.scale) {
                search.found = Some(Target { id: window.0 as isize, pid,
                    fraction: ((search.point.0 - frame.x) / frame.w).clamp(0.12, 0.88) });
            }
            BOOL(0)
        }
        let mut search = Search { point, scale, found: None };
        // Stopping enumeration after the first hit deliberately returns a false status.
        unsafe { let _ = EnumWindows(Some(visit), LPARAM(&mut search as *mut _ as isize)); }
        search.found
    }

    pub fn probe(target: Target) -> Probe {
        let window = hwnd(target.id);
        if unsafe { !IsWindow(Some(window)).as_bool() } || owner(window) != target.pid { return Probe::Gone; }
        if unsafe { !IsWindowVisible(window).as_bool() || IsIconic(window).as_bool() }
            || cloaked(window) || unsafe { GetForegroundWindow() } != window { return Probe::Hidden; }
        bounds(window).map(Probe::Visible).unwrap_or(Probe::Gone)
    }
}

#[cfg(windows)] pub use win::{capture, modifier_down, probe};
#[cfg(not(windows))] pub fn modifier_down() -> bool { false }
#[cfg(not(windows))] pub fn capture(_: (f64, f64), _: f64) -> Option<Target> { None }
#[cfg(not(windows))] pub fn probe(_: Target) -> Probe { Probe::Gone }

#[cfg(test)]
mod tests {
    use super::*;
    const WORK: Rect = Rect { x: 0.0, y: 30.0, w: 1920.0, h: 1050.0 };
    const WINDOW: Rect = Rect { x: 200.0, y: 300.0, w: 900.0, h: 600.0 };

    #[test] fn edge_requires_explicit_top_band() {
        assert!(accepts((600.0, 301.0), WINDOW, 1.0));
        assert!(!accepts((600.0, 450.0), WINDOW, 1.0));
        assert!(!accepts((1200.0, 301.0), WINDOW, 1.0));
    }
    #[test] fn movement_and_resize_preserve_relative_seat() {
        let a = origin(WINDOW, 0.6, 1.0, WORK).unwrap();
        let b = origin(Rect { x: 280.0, y: 330.0, ..WINDOW }, 0.6, 1.0, WORK).unwrap();
        assert!((b.0-a.0-80.0).abs()<0.001 && (b.1-a.1-30.0).abs()<0.001);
        assert!((origin(Rect { w: 1000.0, ..WINDOW }, 0.6, 1.0, WORK).unwrap().0-a.0-60.0).abs()<0.001);
    }
    #[test] fn negative_monitor_and_dpi_are_physical() {
        let work = Rect { x: -2560.0, y: -400.0, w: 2560.0, h: 1440.0 };
        let frame = Rect { x: -2300.0, y: -100.0, w: 1500.0, h: 900.0 };
        let p = origin(frame, 0.5, 2.0, work).unwrap();
        assert!((p.1-(-282.4)).abs()<0.001);
        assert!(p.0>=work.x && p.0+240.0<=0.0);
    }
    #[test] fn no_clearance_or_invalid_geometry_hides() {
        assert!(origin(Rect { y: 30.0, ..WINDOW }, 0.5, 1.0, WORK).is_none());
        assert!(origin(WINDOW, 0.5, f64::NAN, WORK).is_none());
        assert!(origin(WINDOW, f64::NAN, 1.0, WORK).is_none());
        assert!(origin(Rect { w: 70.0, ..WINDOW }, 0.5, 1.0, WORK).is_none());
    }
}
