//! The room editor can also live in its own normally focused, resizable window.
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};
static OPEN: Mutex<()> = Mutex::new(());
fn shown(window: &WebviewWindow, visible: bool) {
    crate::webview_memory::set_low(window,!visible);
    let _=window.emit("mochi-studio-visible",visible);
}
fn create(app: &AppHandle) -> Result<WebviewWindow,String> {
    if let Some(window)=app.get_webview_window("mochi-studio") { return Ok(window) }
    #[allow(unused_mut)]
    let mut url=WebviewUrl::App("studio.html".into());
    #[cfg(dev)]
    if let Some(mut address)=app.config().build.dev_url.clone(){address.set_path("/studio.html");address.set_query(None);url=WebviewUrl::External(address);}
    // Leave room for the native frame and taskbar, including scaled 720p displays.
    let (width,height)=app.primary_monitor().ok().flatten().map(|monitor|{
        let work=monitor.work_area();let scale=monitor.scale_factor();
        ((work.size.width as f64/scale-40.0).clamp(480.0,1120.0),(work.size.height as f64/scale-100.0).clamp(360.0,780.0))
    }).unwrap_or((1120.0,780.0));
    let window=WebviewWindowBuilder::new(app,"mochi-studio",url)
        .title("Mochi Studio — Coucou · beta 1").inner_size(width,height).min_inner_size(width.min(760.0),height.min(560.0))
        .center().resizable(true).decorations(true).focused(false).visible(false)
        .additional_browser_args(crate::BROWSER_ARGS).build().map_err(|e|e.to_string())?;
    let this=window.clone();
    window.on_window_event(move |event| match event {
        tauri::WindowEvent::CloseRequested {api,..} => {
            api.prevent_close();let _=this.hide();shown(&this,false);
        }
        tauri::WindowEvent::Resized(_) | tauri::WindowEvent::Focused(true) => {
            shown(&this,this.is_visible().unwrap_or(false)&&!this.is_minimized().unwrap_or(false));
        }
        _=>{}
    });
    shown(&window,false);
    Ok(window)
}
// Like the official settings window, create Studio before the island webview.
// Keep it hidden between uses: recreating WebView2 later can give a blank page.
pub fn setup(app: &AppHandle) {
    if let Err(error)=create(app) { crate::log::line(format!("Mochi Studio: {error}")); }
}
fn open(app: AppHandle) -> Result<(),String> {
    let _gate=OPEN.lock().map_err(|_|"Studio lock is unavailable")?;
    let window=create(&app)?;
    let _=window.unminimize();window.show().map_err(|e|e.to_string())?;
    shown(&window,true);
    window.set_focus().map_err(|e|e.to_string())
}
#[tauri::command]
pub async fn open_mochi_studio(app: AppHandle) -> Result<(),String> {
    // Creating WebView2 windows in a synchronous command can deadlock.
    tauri::async_runtime::spawn_blocking(move||open(app)).await.map_err(|e|e.to_string())?
}
