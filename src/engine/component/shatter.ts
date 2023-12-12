import Bound from "../geometry/bound";
import { TouchEndEvent } from "../model/event";
import { Component } from "./component";

class Shatter implements Component {
  bound: Bound;
  private videoElement: HTMLVideoElement;
  private shotCallback: (videoElement: HTMLVideoElement) => void;

  constructor(
    bound: Bound,
    videoElement: HTMLVideoElement,
    shotCallback: (videoElement: HTMLVideoElement) => void,
  ) {
    this.bound = bound;
    this.videoElement = videoElement;
    this.shotCallback = shotCallback;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.lineWidth = 15;
    context.strokeStyle = "gray";
    context.arc(
      this.bound.x + this.bound.width / 2,
      this.bound.y + this.bound.height / 2,
      this.bound.width / 2,
      0,
      2 * Math.PI,
    );
    context.stroke();
    context.fillStyle = "white";
    context.fill();
  }

  onTouchEnd(_: TouchEndEvent): void {
    this.shotCallback(this.videoElement);
  }
}

export default Shatter;
