mod utils;
mod hsv;
pub mod img_util;
pub mod mock;

use wasm_bindgen::prelude::*;
use std::io::Cursor;
use std::error::Error;
use hsv::to_hsv;
use image::DynamicImage;
use image::io::Reader as ImageReader;
use image::GenericImageView;
use img_util::{base64_to_img, is_pixel_hot};

fn byte_to_image(bytes: Vec<u8>) -> Result<DynamicImage, Box<dyn Error + Send + Sync + 'static>> {
    Ok(ImageReader::new(Cursor::new(bytes)).with_guessed_format()?.decode()?)
}

/// Evaluate the "hotness" of the image.
/// For more details about the "Hotness", see https://github.com/p2hacks2023/pre-06/issues/7
#[wasm_bindgen]
pub fn evaluate_hotness(img: String) -> f64 {
    match byte_to_image(base64_to_img(img)) {
        Ok(image) => {
            let px_cnt = image.width() * image.height();
            let hotpx_cnt = image.pixels()
                                .map(|(_, _, px)| to_hsv(&px))
                                .filter(|x| is_pixel_hot(&x))
                                .collect::<Vec<_>>()
                                .len();

            (hotpx_cnt as f64) / (px_cnt as f64) * 100.0
        }
        Err(_) => {
            0.0
        }
    }
}

/// Extract "hot" object from the input.
/// The output of this function is base64 encoded PNG image.
#[wasm_bindgen]
pub fn extract_hot_buffer(img: String) -> String {
    img
}
