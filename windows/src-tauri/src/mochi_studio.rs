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
    WebviewWindowBuilder::new(&app,"mochi-studio",url)
        .title("Mochi Studio — Coucou").inner_size(1120.0,780.0).min_inner_size(760.0,560.0)
        .center().resizable(true).decorations(true).focused(true).visible(true)
        .additional_browser_args(crate::BROWSER_ARGS).build().map_err(|e|e.to_string())?;
    Ok(())
}
#[tauri::command]
pub async fn open_mochi_studio(app: AppHandle) -> Result<(),String> {
    // Creating WebView2 windows in a synchronous command can deadlock.
    tauri::async_runtime::spawn_blocking(move||open(app)).await.map_err(|e|e.to_string())?
}
