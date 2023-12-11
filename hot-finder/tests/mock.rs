//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

use hot_finder::mock::evaluate_hotness_mock;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn mock_hotness_ok1() {
    let s = "3.141592".to_string();
    assert_eq!(evaluate_hotness_mock(s), 3.141592f64);
}

#[wasm_bindgen_test]
fn mock_hotness_edge1() {
    let s = "0.0".to_string();
    assert_eq!(evaluate_hotness_mock(s), 0.0f64);
}

#[wasm_bindgen_test]
fn mock_hotness_edge2() {
    let s = "100.0".to_string();
    assert_eq!(evaluate_hotness_mock(s), 100.0f64);
}

#[wasm_bindgen_test]
fn mock_hotness_ng1() {
    let s = "-0.5".to_string();
    assert_eq!(evaluate_hotness_mock(s), 0f64);
}

#[wasm_bindgen_test]
fn mock_hotness_ng2() {
    let s = "101".to_string();
    assert_eq!(evaluate_hotness_mock(s), 0f64);
}

#[wasm_bindgen_test]
fn mock_hotness_ng3() {
    let s = "hoge".to_string();
    assert_eq!(evaluate_hotness_mock(s), 0f64);
}
