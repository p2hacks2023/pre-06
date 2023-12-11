import Bound from "../geometry/bound";
import { Component } from "./component";

class Icecup implements Component {
  bound: Bound;
  private goalBound: Bound;
  private image: HTMLImageElement | null;
  private clock;

  constructor(bound: Bound, canvasWidth: number, canvasHeight: number) {
    this.bound = bound;
    const goalWidth = Math.min(canvasWidth, canvasHeight) * 0.75;
    this.goalBound = new Bound(
      Math.max(canvasWidth / 2 - goalWidth / 2, 0),
      Math.max(canvasHeight / 2 - this.bound.height / 2, 0),
      goalWidth,
      goalWidth,
    );
    this.image = null;
    this.clock = -1;
    const image = new Image();
    image.src = "images/icecup.webp";
    image.onload = () => {
      this.image = image;
    };
  }

  onSceneChanged() {
    this.clock = 0;
  }

  draw(context: CanvasRenderingContext2D) {
    if (this.clock >= 0) {
      this.clock += 1;
      this.bound.animateTo(this.goalBound, 0.1);
    }
    if (this.image) {
      context.drawImage(
        this.image,
        this.bound.x,
        this.bound.y,
        this.bound.width,
        this.bound.height,
      );
    }
  }
}

export default Icecup;
