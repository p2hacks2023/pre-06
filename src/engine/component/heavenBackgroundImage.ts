import Bound from "../geometry/bound";
import { Component } from "./component";

const BACKGROUND_COLOR_1 = [255, 255, 255];
const BACKGROUND_COLOR_2 = [160, 240, 255];

class HeavenBackgroundImage implements Component {
  bound: Bound;
  private backgroundImage: HTMLImageElement | null;

  constructor(bound: Bound) {
    this.bound = bound;
    this.backgroundImage = null;
    const backgroundWidth = 1;
    let background = new ImageData(backgroundWidth, bound.height);
    for (let i = 0; i < backgroundWidth * bound.height; i++) {
      const y = Math.floor(i / backgroundWidth);
      const prop = Math.min(
        Math.sin(((y / bound.height) * Math.PI) / 2) * 1.5,
        1.0,
      );
      background.data[i * 4 + 0] =
        BACKGROUND_COLOR_1[0] * prop + BACKGROUND_COLOR_2[0] * (1 - prop);
      background.data[i * 4 + 1] =
        BACKGROUND_COLOR_1[1] * prop + BACKGROUND_COLOR_2[1] * (1 - prop);
      background.data[i * 4 + 2] =
        BACKGROUND_COLOR_1[2] * prop + BACKGROUND_COLOR_2[2] * (1 - prop);
      background.data[i * 4 + 3] = 255;
    }

    let canvas = document.createElement("canvas");
    canvas.width = backgroundWidth;
    canvas.height = bound.height;

    let context = canvas.getContext("2d");
    context?.putImageData(background, 0, 0);
    let image = new Image();
    image.src = canvas.toDataURL();
    image.onload = () => {
      this.backgroundImage = image;
    };
  }

  draw(context: CanvasRenderingContext2D): void {
    if (this.backgroundImage) {
      context.drawImage(
        this.backgroundImage,
        this.bound.x,
        this.bound.y,
        this.bound.width,
        this.bound.height,
      );
    }
  }
}

export default HeavenBackgroundImage;
