//! Native regression: an exposed window must accept a drop without stealing focus.
use super::*;
use std::io::{BufRead, Write};
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};
use windows::core::w;
use windows::Win32::Foundation::{HWND, LPARAM, RECT, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{CreateWindowExW, DispatchMessageW,
    GetForegroundWindow, GetWindowRect, PeekMessageW, PostMessageW, SetWindowPos,
    ShowWindow, TranslateMessage, HWND_TOP, MSG, PM_REMOVE, SW_HIDE, SW_MINIMIZE,
    SW_SHOWNOACTIVATE, SWP_NOACTIVATE, SWP_SHOWWINDOW, WM_CLOSE, WS_EX_NOACTIVATE,
    WS_OVERLAPPEDWINDOW, WS_VISIBLE};

struct Fixture(Child);
impl Drop for Fixture {
    fn drop(&mut self) { let _ = self.0.kill(); let _ = self.0.wait(); }
}

fn wait_for(check: impl Fn() -> bool) {
    let deadline = Instant::now() + Duration::from_secs(3);
    while !check() {
        assert!(Instant::now() < deadline, "native fixture did not reach the expected window state");
        std::thread::sleep(Duration::from_millis(20));
    }
}

#[test]
fn exposed_background_window_accepts_drop_and_tracks_visibility() {
    let mut fixture = Fixture(Command::new(std::env::current_exe().unwrap())
        .args(["--exact", "window_perch::native_tests::fixture_window_process", "--ignored", "--nocapture"])
        .env("COUCOU_PERCH_TEST_FIXTURE", "1")
        .stdout(Stdio::piped()).stderr(Stdio::inherit()).spawn().unwrap());
    let output = fixture.0.stdout.take().unwrap();
    let (send, receive) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        for line in std::io::BufReader::new(output).lines().map_while(Result::ok) {
            if let Some(ids) = line.strip_prefix("COUCOU_PERCH_WINDOWS=") {
                let _ = send.send(ids.to_string()); break;
            }
        }
    });
    let ids = receive.recv_timeout(Duration::from_secs(10)).expect("fixture windows were not created");
    let ids: Vec<isize> = ids.split(',').map(|id| id.parse().unwrap()).collect();
    let target = Target { id: ids[0], pid: fixture.0.id(), fraction: 0.5 };
    let handle = HWND(target.id as *mut _);
    let cover = HWND(ids[1] as *mut _);
    // This is precisely the scenario the old foreground-only check rejected.
    assert_ne!(unsafe { GetForegroundWindow() }, handle);
    wait_for(|| matches!(probe(target), Probe::Visible(_)));
    let Probe::Visible(frame) = probe(target) else { panic!("exposed inactive window is hidden") };
    let found = capture((frame.x + frame.w * 0.5, frame.y + 4.0), 1.0)
        .expect("Alt-drop could not select the exposed inactive window");
    assert_eq!(found.id, target.id);

    // Use GetWindowRect coordinates for SetWindowPos: these two APIs share the
    // caller's DPI space, while the production DWM bounds stay physical.
    let mut rect = RECT::default();
    unsafe {
        GetWindowRect(handle, &mut rect).unwrap();
        SetWindowPos(cover, Some(HWND_TOP), (rect.left + rect.right) / 2 - 80,
            rect.top - 30, 200, 180, SWP_NOACTIVATE | SWP_SHOWWINDOW).unwrap();
    }
    wait_for(|| matches!(probe(target), Probe::Hidden));
    unsafe { let _ = ShowWindow(cover, SW_HIDE); }
    wait_for(|| matches!(probe(target), Probe::Visible(_)));
    unsafe { let _ = ShowWindow(handle, SW_MINIMIZE); }
    wait_for(|| matches!(probe(target), Probe::Hidden));
    unsafe { let _ = ShowWindow(handle, SW_SHOWNOACTIVATE); }
    wait_for(|| matches!(probe(target), Probe::Visible(_)));
    unsafe { PostMessageW(Some(handle), WM_CLOSE, WPARAM(0), LPARAM(0)).unwrap(); }
    wait_for(|| matches!(probe(target), Probe::Gone));
}

/// A helper process, not a disabled assertion. Parent test owns its lifetime.
#[test]
#[ignore = "spawned by the native regression test with its own process ID"]
fn fixture_window_process() {
    if std::env::var("COUCOU_PERCH_TEST_FIXTURE").as_deref() != Ok("1") { return; }
    unsafe {
        let target = CreateWindowExW(WS_EX_NOACTIVATE, w!("STATIC"), w!("Coucou perch test target"),
            WS_OVERLAPPEDWINDOW | WS_VISIBLE, 260, 300, 620, 350,
            None, None, None, None).unwrap();
        let cover = CreateWindowExW(WS_EX_NOACTIVATE, w!("STATIC"), w!("Coucou perch test cover"),
            WS_OVERLAPPEDWINDOW | WS_VISIBLE, 20, 20, 400, 180,
            None, None, None, None).unwrap();
        println!("COUCOU_PERCH_WINDOWS={},{}", target.0 as isize, cover.0 as isize);
        std::io::stdout().flush().unwrap();
        let mut message = MSG::default();
        loop {
            while PeekMessageW(&mut message, None, 0, 0, PM_REMOVE).as_bool() {
                let _ = TranslateMessage(&message);
                DispatchMessageW(&message);
            }
            std::thread::sleep(Duration::from_millis(10));
        }
    }
}
