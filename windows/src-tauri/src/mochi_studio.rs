//! The room editor can also live in its own normally focused, resizable window.
use std::sync::Mutex;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
static OPEN: Mutex<()> = Mutex::new(());
fn open(app: AppHandle) -> Result<(),String> {
    let _gate=OPEN.lock().map_err(|_|"Studio lock is unavailable")?;
    if let Some(window)=app.get_webview_window("mochi-studio") {
        let _=window.unminimize();window.show().map_err(|e|e.to_string())?;
        return window.set_focus().map_err(|e|e.to_string());
    }
    #[allow(unused_mut)]
    let mut url=WebviewUrl::App("studio.html".into());
    #[cfg(dev)]
    if let Some(mut address)=app.config().build.dev_url.clone(){address.set_path("/studio.html");address.set_query(None);url=WebviewUrl::External(address);}
    // Leave room for the native frame and taskbar, including scaled 720p displays.
    let (width,height)=app.primary_monitor().ok().flatten().map(|monitor|{
        let work=monitor.work_area();let scale=monitor.scale_factor();
        ((work.size.width as f64/scale-40.0).clamp(480.0,1120.0),(work.size.height as f64/scale-100.0).clamp(360.0,780.0))
    }).unwrap_or((1120.0,780.0));
    WebviewWindowBuilder::new(&app,"mochi-studio",url)
        .title("Mochi Studio — Coucou").inner_size(width,height).min_inner_size(width.min(760.0),height.min(560.0))
        .center().resizable(true).decorations(true).focused(true).visible(true)
        .additional_browser_args(crate::BROWSER_ARGS).build().map_err(|e|e.to_string())?;
    Ok(())
}
#[tauri::command]
pub async fn open_mochi_studio(app: AppHandle) -> Result<(),String> {
    // Creating WebView2 windows in a synchronous command can deadlock.
    tauri::async_runtime::spawn_blocking(move||open(app)).await.map_err(|e|e.to_string())?
}
