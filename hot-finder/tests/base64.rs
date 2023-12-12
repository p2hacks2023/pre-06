#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;
use base64::{Engine as _, engine::general_purpose};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn is_base64_works_correctly_question() {
    // Copied from https://docs.rs/base64/0.21.5/base64/

    let orig = b"data";
    let encoded: String = general_purpose::STANDARD_NO_PAD.encode(orig);
    assert_eq!("ZGF0YQ", encoded);
    assert_eq!(orig.as_slice(), &general_purpose::STANDARD_NO_PAD.decode(encoded).unwrap());
}
