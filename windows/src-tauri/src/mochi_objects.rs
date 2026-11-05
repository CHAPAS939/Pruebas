//! Three tiny, draggable desktop objects and a click-through magnetic-edge marker.
use std::collections::{BTreeMap, BTreeSet};
use std::sync::{Arc, Mutex, atomic::{AtomicU64, Ordering}};
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

const IDS: [&str; 3] = ["cup", "cushion", "plant"];
const SIDE: f64 = 92.0;
const PARK: (i32,i32) = (-32000,-32000);
#[derive(Default)]
struct Objects { syncing: Mutex<()>, listening: Mutex<BTreeSet<String>>, spots: Mutex<BTreeMap<String,[i32;2]>>, revision: AtomicU64 }
fn spots_path() -> std::path::PathBuf { crate::platform::config_dir().join("mochi-object-positions.json") }
fn label(id: &str) -> String { format!("mochi-prop-{id}") }
fn wanted(app: &AppHandle) -> Vec<String> {
    let Some(shared) = app.try_state::<crate::Shared>() else { return vec![] };
    let text = shared.settings.lock().unwrap().mochi_studio.clone();
    if text.len()>32768 {return vec![]}
    let value: serde_json::Value = serde_json::from_str(&text).unwrap_or_default();
    IDS.into_iter().filter(|id| value.get("desktopProps").and_then(|v| v.as_array()).is_some_and(|list| list.iter().any(|v| v.as_str() == Some(*id)))).map(|v| v.to_string()).collect()
}
fn page(app: &AppHandle, query: &str) -> WebviewUrl {
    #[cfg(dev)]
    if let Some(mut url) = app.config().build.dev_url.clone() { url.set_path("/utility.html");url.set_query(Some(query));return WebviewUrl::External(url); }
    let _ = app;
    WebviewUrl::App(format!("utility.html?{query}").into())
}
fn build(app: &AppHandle, id: &str, query: &str, size: (f64,f64)) -> Option<WebviewWindow> {
    if let Some(window) = app.get_webview_window(id) { return Some(window) }
    WebviewWindowBuilder::new(app,id,page(app,query)).additional_browser_args(crate::BROWSER_ARGS)
        .title("Mochi").inner_size(size.0,size.1).position(PARK.0 as f64,PARK.1 as f64).resizable(false)
        .decorations(false).transparent(true).shadow(false).always_on_top(true).skip_taskbar(true)
        .visible_on_all_workspaces(true).focused(false).focusable(false).maximizable(false).minimizable(false)
        .closable(false).disable_drag_drop_handler().visible(true).build().map_err(|e| crate::log::line(format!("Mochi object: {e}"))).ok()
}
pub fn setup(app: &AppHandle) {
    let state = Arc::new(Objects::default());
    if let Ok(text) = std::fs::read_to_string(spots_path()) { if text.len() < 2048 { if let Ok(mut spots) = serde_json::from_str::<BTreeMap<String,[i32;2]>>(&text) { spots.retain(|id,_| IDS.contains(&id.as_str()));*state.spots.lock().unwrap() = spots; } } }
    app.manage(state);
    if let Some(window)=build(app,"mochi-snap","kind=snap",(96.0,8.0)) { let _=window.set_ignore_cursor_events(true); }
    sync(app);
}
pub fn sync(app: &AppHandle) {
    // WebView2 creation can deadlock inside a synchronous Tauri command.
    // Serialize on a worker so rapid cosmetic updates never create duplicates.
    let app=app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let state=app.state::<Arc<Objects>>();
        let _gate=state.syncing.lock().unwrap();
        sync_now(&app);
    });
}
fn sync_now(app: &AppHandle) {
    let list=wanted(app);
    for (index,id) in IDS.into_iter().enumerate() {
        let name=label(id);
        if !list.iter().any(|s| s.as_str()==id) { if let Some(window)=app.get_webview_window(&name) { let _=window.set_position(PhysicalPosition::new(PARK.0,PARK.1)); } continue; }
        if let Some(window)=app.get_webview_window(&name) { if window.outer_position().is_ok_and(|p|p.x!=PARK.0) { continue; } }
        let Some(window)=build(app,&name,&format!("kind=prop&id={id}"),(SIDE,SIDE)) else { continue };
        let Some(monitor)=crate::island::window(app).and_then(|w|w.current_monitor().ok().flatten()).or_else(||app.primary_monitor().ok().flatten()) else { continue };
        let work=monitor.work_area();let scale=monitor.scale_factor();let side=(SIDE*scale).round() as i32;
        let fallback=[work.position.x+work.size.width as i32-side*(index as i32+2)-24,work.position.y+work.size.height as i32-side-30];
        let state=app.state::<Arc<Objects>>();let saved=state.spots.lock().unwrap().get(id).copied().unwrap_or(fallback);
        let monitors=app.available_monitors().unwrap_or_default();
        let chosen=monitors.iter().find(|m|{let w=m.work_area();saved[0]>=w.position.x&&saved[1]>=w.position.y&&saved[0]<w.position.x+w.size.width as i32&&saved[1]<w.position.y+w.size.height as i32});
        let (position,target_scale)=if let Some(m)=chosen { let w=m.work_area();let size=(SIDE*m.scale_factor()).round() as i32;([saved[0].clamp(w.position.x,w.position.x+(w.size.width as i32-size).max(0)),saved[1].clamp(w.position.y,w.position.y+(w.size.height as i32-size).max(0))],m.scale_factor()) } else { (fallback,scale) };
        let _=window.set_size(PhysicalSize::new((SIDE*target_scale).round() as u32,(SIDE*target_scale).round() as u32));
        let _=window.set_position(PhysicalPosition::new(position[0],position[1]));
        let app2=app.clone();let object_id=id.to_string();
        // Only install one listener, when the native object window is first used.
        let marker=format!("mochi-object-listener-{id}");
        let first=state.listening.lock().unwrap().insert(marker);
        if first {
            window.on_window_event(move |event|{if let tauri::WindowEvent::Moved(position)=event {
                if position.x==PARK.0 {return}
                let shared=app2.state::<Arc<Objects>>().inner().clone();shared.spots.lock().unwrap().insert(object_id.clone(),[position.x,position.y]);
                let version=shared.revision.fetch_add(1,Ordering::Relaxed)+1;
                tauri::async_runtime::spawn(async move { tokio::time::sleep(std::time::Duration::from_millis(350)).await;if shared.revision.load(Ordering::Relaxed)!=version{return}let mut spots=shared.spots.lock().unwrap().clone();spots.retain(|id,_|IDS.contains(&id.as_str()));if let Ok(data)=serde_json::to_vec(&spots){let path=spots_path();if let Some(parent)=path.parent(){let _=std::fs::create_dir_all(parent);}let _=std::fs::write(path,data);} });
            }});
        }
    }
}
pub fn snap(app: &AppHandle, point: Option<((f64,f64),f64)>) {
    let Some(window)=app.get_webview_window("mochi-snap") else {return};
    if let Some(((x,y),scale))=point {let _=window.set_size(PhysicalSize::new((96.0*scale) as u32,(8.0*scale) as u32));let _=window.set_position(PhysicalPosition::new((x-48.0*scale) as i32,(y-4.0*scale) as i32));}
    else {let _=window.set_position(PhysicalPosition::new(PARK.0,PARK.1));}
}
#[tauri::command]
pub fn put_away_mochi_prop(app: AppHandle, id: String) {
    if !IDS.contains(&id.as_str()) {return}
    let settings={let shared=app.state::<crate::Shared>();let mut settings=shared.settings.lock().unwrap();let mut doc:serde_json::Value=serde_json::from_str(&settings.mochi_studio).unwrap_or(serde_json::json!({}));if let Some(list)=doc.get_mut("desktopProps").and_then(|v|v.as_array_mut()){list.retain(|v|v.as_str()!=Some(id.as_str()));}settings.mochi_studio=doc.to_string();settings.clone()};
    let _=crate::settings::save(&settings);sync(&app);
    use tauri::Emitter;let _=app.emit("settings-changed",settings);
}
