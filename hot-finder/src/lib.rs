mod utils;
mod hsv;
pub mod img_util;
pub mod mock;

use wasm_bindgen::prelude::*;

/// Evaluate the "hotness" of the image.
/// For more details about the "Hotness", see https://github.com/p2hacks2023/pre-06/issues/7
#[wasm_bindgen]
pub fn evaluate_hotness(img: String) -> f64 {
    0.0
}

/// Extract "hot" object from the input.
/// The output of this function is base64 encoded PNG image.
#[wasm_bindgen]
pub fn extract_hot_buffer(img: String) -> String {
    img
}
