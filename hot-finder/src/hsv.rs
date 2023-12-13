use image::Rgba;
use std::cmp;

#[derive(Debug, PartialEq)]
pub(crate) struct Hsv {
    hue: f64,
    saturation: f64,
    value: f64
}

#[allow(dead_code)]
impl Hsv {
    pub(crate) fn get_hue(&self) -> f64 {
        self.hue
    }
    
    pub(crate) fn get_saturation(&self) -> f64 {
        self.saturation
    }
    
    pub(crate) fn get_value(&self) -> f64 {
        self.value
    }
}

#[allow(non_snake_case)]
pub(crate) fn to_hsv(pixel: &Rgba<u8>) -> Hsv {
    let r = pixel[0] as f64;
    let g = pixel[1] as f64;
    let b = pixel[2] as f64;

    let I_max = cmp::max(cmp::max(pixel[0], pixel[1]), pixel[2]) as f64;
    let I_min = cmp::min(cmp::min(pixel[0], pixel[1]), pixel[2]) as f64;

    println!{"{}, {}", I_max, I_min};

    let s = if I_max != 0.0 { ((I_max - I_min) / I_max) * 100f64 } else { 0.0 };
    let v = (I_max / 255f64) * 100f64;

    let mut h = if I_max != I_min {
        let fpart = |numerator| { numerator / (I_max - I_min) * 60f64 };

        if I_max == r      { fpart(g - b) }
        else if I_max == g { fpart(b - r) + 120f64 }
        else               { fpart(r - g) + 240f64 }
    }
    else { 0f64 };

    while h < 0.0 { h += 360.0; }
    while h > 360.0 { h -= 360.0; }

    // Each value has been rounded to the second decimal point.
    Hsv {
        hue:        (h * 10.0).round() / 10.0,
        saturation: (s * 10.0).round() / 10.0,
        value:      (v * 10.0).round() / 10.0
    }
}

#[cfg(test)]
mod tests {
    use crate::hsv::*;

    #[test]
    fn to_hsv_light_orange() {
        let origin = Rgba::<u8>([255u8, 191u8, 127u8, 0u8]);
        let res = Hsv {
            hue: 30,
            saturation: 50,
            value: 100
        };
        assert_eq!(to_hsv(&origin), res)
    }
}
