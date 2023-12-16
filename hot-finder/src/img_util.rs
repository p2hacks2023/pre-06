use wasm_bindgen::prelude::*;

use base64::{Engine as _, engine::general_purpose};
use image::Rgba;
use crate::hsv::Hsv;

/// Classify a pixel is hot or not.
/// Details: https://github.com/p2hacks2023/pre-06/issues/7
pub(crate) fn is_pixel_hot(pixel: &Hsv) -> bool {
    let is_in_hue_range = pixel.get_hue() < 60.0 || 300.0 <= pixel.get_hue();
    let is_in_satu_range = 50.0 <= pixel.get_saturation();
    let is_in_value_range = 50.0 <= pixel.get_value();

    is_in_hue_range && is_in_satu_range && is_in_value_range
}

pub(crate) fn to_transparent(pixel: &Rgba<u8>) -> Rgba<u8> {
    Rgba::<u8>([pixel[0], pixel[1], pixel[2], 0u8])
}

/// Convert an image binary (Vec<u8>) to a base64 (String).
/// You can choose to put an html data header (e.g., "data:image/jpeg;base64") or not.
/// To put an html data header, put 'true' to the second parameter of the function.
#[wasm_bindgen]
pub fn img_to_base64(img: Vec<u8>, put_html_data_header: bool) -> String {
    let html_data_header = if put_html_data_header {
        if img[6..10] == [0x4A, 0x46, 0x49, 0x46] {
            "data:image/jpeg;base64,"
        }
        else if img[0..8] == [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] {
            "data:image/png;base64,"
        }
        else {
            ""
        }
    }
    else {
        ""
    };

    (html_data_header.to_owned() + &general_purpose::STANDARD.encode(img)).to_string()
}

/// Convert a base64 string to an image binary (Vec<u8>).
/// Both base64 that has an html data header and that doesn't are allowed.
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
