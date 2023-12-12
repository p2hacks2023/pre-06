use wasm_bindgen::prelude::*;

use base64::{Engine as _, alphabet, engine::{self, general_purpose}};

fn img_to_base64(img: Vec<u8>) -> String {
    todo!{}
}

#[wasm_bindgen]
pub fn base64_to_img(data: String) -> Vec<u8> {
    // strip_pos = 21 iff the data is an HTML inline image and a PNG.
    // Or 22, if the data is JPEG.
    // So, strip_pos should not be 0 in this use case.
    // If it is 0, the data is collapsed, or it is not an HTML inline image.
    let strip_pos = data.find(',').unwrap_or_else(|| 0);

    if strip_pos == 0 {
        general_purpose::STANDARD.decode(data).unwrap()
    }
    else {
        // Using to_string() because a slice of str doesn't have a size known at compile-time.
        general_purpose::STANDARD.decode(
            data[(strip_pos + 1)..].to_string()
        ).unwrap()
    }
}
