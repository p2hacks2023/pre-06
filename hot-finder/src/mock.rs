use wasm_bindgen::prelude::*;

/// Mock of "evaluate_hotness()"
/// Output is test_value. In other words, you can decide the exact return value for your debugging.
/// For negative input, bigger input than 100.0, and other input that couldn't be parsed to f64, this function returns 0.0
#[wasm_bindgen]
pub fn evaluate_hotness_mock(test_value: String) -> f64 {
    match test_value.parse::<f64>() {
        Ok(v) => {
            if 0.0 <= v && v <= 100.0 {
                v
            }
            else {
                0.0f64
            }
        },
        Err(_) => {
            0.0f64
        }
    }
}

/// Mock of "extract_hot_buffer()"
/// Output the input as is.
#[wasm_bindgen]
pub fn extract_hot_buffer_mock(img: String) -> String {
    img
}
