mod utils;

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

/// Mock of "evaluate_hotness()"
/// Output is test_value. In other words, you can decide the exact return value for your debugging.
/// For negative input, bigger input than 100.0, and other input that couldn't be parsed to f64, this function returns 0.0
#[wasm_bindgen]
pub fn evaluate_hotness_mock(test_value: String) -> f64 {
    0.0
}

/// Mock of "extract_hot_buffer()"
/// Output is a static PNG image that has transparent pixels.
#[wasm_bindgen]
pub fn extract_hot_buffer_mock(img: String) -> String {
    img
}
