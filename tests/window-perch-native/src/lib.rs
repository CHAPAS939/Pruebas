#![allow(dead_code)]
// Only the geometry carrier type is supplied here. Selection, occlusion, Alt
// sampling and the native-window fixture are the production source files.
mod desktop { pub mod logic {
    #[derive(Clone, Copy, Debug)]
    pub struct Rect { pub x: f64, pub y: f64, pub w: f64, pub h: f64 }
    impl Rect {
        pub fn contains(&self, p: (f64, f64)) -> bool {
            p.0 >= self.x && p.0 < self.x + self.w && p.1 >= self.y && p.1 < self.y + self.h
        }
    }
} }
#[path = "../../../windows/src-tauri/src/window_perch.rs"]
mod window_perch;
