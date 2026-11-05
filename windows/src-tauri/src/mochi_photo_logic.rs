use base64::Engine;

pub fn decode(image: &str) -> Result<Vec<u8>, String> {
    if image.len() > 10_000_000 { return Err("Photo is too large".into()); }
    let encoded = image.strip_prefix("data:image/png;base64,").ok_or("Expected a PNG photo")?;
    let bytes = base64::engine::general_purpose::STANDARD.decode(encoded).map_err(|_| "Invalid photo encoding")?;
    if bytes.len() < 33 || &bytes[..8] != b"\x89PNG\r\n\x1a\n" || &bytes[12..16] != b"IHDR" { return Err("Invalid PNG photo".into()); }
    let width = u32::from_be_bytes(bytes[16..20].try_into().unwrap());
    let height = u32::from_be_bytes(bytes[20..24].try_into().unwrap());
    if width == 0 || height == 0 || width > 4096 || height > 4096 { return Err("Invalid photo dimensions".into()); }
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    fn png(width: u32, height: u32) -> String {
        let mut data = b"\x89PNG\r\n\x1a\n\0\0\0\rIHDR".to_vec();
        data.extend(width.to_be_bytes());data.extend(height.to_be_bytes());data.extend([0; 9]);
        format!("data:image/png;base64,{}", base64::engine::general_purpose::STANDARD.encode(data))
    }
    #[test]
    fn only_bounded_png_photos_reach_the_save_dialog() {
        assert!(decode(&png(1600,1600)).is_ok());
        for bad in [png(0,1600),png(1600,5000),"data:text/html;base64,PGgxPg==".into(),"data:image/png;base64,invalid".into()] { assert!(decode(&bad).is_err()); }
        assert!(decode(&"x".repeat(10_000_001)).is_err());
    }
}
