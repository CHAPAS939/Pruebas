//! A photo leaves the app only after the user chooses a PNG destination.
use crate::mochi_photo_logic::decode;
use std::path::PathBuf;

#[cfg(windows)]
fn destination() -> Result<Option<PathBuf>, String> {
    use windows::core::{w, PCWSTR, PWSTR};
    use windows::Win32::UI::Controls::Dialogs::{CommDlgExtendedError, GetSaveFileNameW, OPENFILENAMEW, OFN_NOCHANGEDIR, OFN_OVERWRITEPROMPT, OFN_PATHMUSTEXIST};
    let mut name = vec![0u16; 32768];
    for (index, value) in "Mochi.png".encode_utf16().enumerate() { name[index] = value; }
    let filter: Vec<u16> = "PNG image\0*.png\0\0".encode_utf16().collect();
    let mut dialog = OPENFILENAMEW { lStructSize: std::mem::size_of::<OPENFILENAMEW>() as u32,
        lpstrFile: PWSTR(name.as_mut_ptr()), nMaxFile: name.len() as u32, lpstrFilter: PCWSTR(filter.as_ptr()),
        lpstrDefExt: w!("png"), Flags: OFN_OVERWRITEPROMPT | OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR, ..Default::default() };
    if !unsafe { GetSaveFileNameW(&mut dialog) }.as_bool() {
        let error = unsafe { CommDlgExtendedError() }.0;
        return if error == 0 { Ok(None) } else { Err(format!("Photo dialog failed ({error})")) };
    }
    let end = name.iter().position(|v| *v == 0).unwrap_or(name.len());
    let mut path = PathBuf::from(String::from_utf16_lossy(&name[..end]));
    if !path.extension().is_some_and(|ext| ext.to_string_lossy().eq_ignore_ascii_case("png")) { path.set_extension("png"); }
    Ok(Some(path))
}

#[cfg(not(windows))]
fn destination() -> Result<Option<PathBuf>, String> {
    let output = std::process::Command::new("zenity").args(["--file-selection", "--save", "--confirm-overwrite", "--filename=Mochi.png", "--file-filter=PNG | *.png"]).output().map_err(|_| "PNG save dialog is unavailable")?;
    if !output.status.success() { return Ok(None); }
    let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok((!path.is_empty()).then(|| PathBuf::from(path)))
}

fn save(image: &str) -> Result<bool, String> {
    let bytes = decode(image)?;
    let Some(path) = destination()? else { return Ok(false); };
    std::fs::write(path, bytes).map_err(|e| format!("Could not save the photo: {e}"))?;
    Ok(true)
}

#[tauri::command]
pub async fn save_mochi_photo(image: String) -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(move || save(&image)).await.map_err(|e| e.to_string())?
}
