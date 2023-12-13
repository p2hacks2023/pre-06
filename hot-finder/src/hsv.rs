use image::Rgba;
use std::cmp;

#[derive(Debug, PartialEq)]
pub(crate) struct Hsv {
    hue: i32,
    saturation: i32,
    value: i32
}

#[allow(dead_code)]
impl Hsv {
    pub(crate) fn get_hue(&self) -> i32 {
        self.hue
    }
    
    pub(crate) fn get_saturation(&self) -> i32 {
        self.saturation
    }
    
    pub(crate) fn get_value(&self) -> i32 {
        self.value
    }
}

pub(crate) fn to_hsv(pixel: &Rgba<u8>) -> Hsv {
    let max = cmp::max(cmp::max(pixel[0], pixel[1]), pixel[2]) as i32;
    let min = cmp::min(cmp::min(pixel[0], pixel[1]), pixel[2]) as i32;
    let r = pixel[0] as i32;
    let g = pixel[1] as i32;
    let b = pixel[2] as i32;   

    let s = max-min;

    let h = if max != min {
        if max == r      { 60 * ((g-b)/(max-min)) }
        else if max == g { 60 * ((b-r)/(max-min)) + 120 }
        else             { 60 * ((r-g)/(max-min)) + 240 }
    }
    else { 0 };

    Hsv {
        hue: h,
        saturation: s,
        value: max
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
