import Bound from "../geometry/bound";
import { TouchEndEvent } from "../model/event";
import { Component } from "./component";

class Button implements Component {
  bound: Bound;
  round: number;
  text: string;
  textSize: number;
  fontFamily: string[];
  color: string | CanvasGradient | CanvasPattern;
  onClickCallback?: () => void;

  constructor(
    bound: Bound,
    round: number,
    text: string,
    textSize: number,
    fontFamily: string[],
    color: string | CanvasGradient | CanvasPattern,
    onClickCallback?: () => void,
  ) {
    this.bound = bound;
    this.round = round;
    this.text = text;
    this.textSize = textSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.onClickCallback = onClickCallback;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.bound.x + this.round, this.bound.y);
    ctx.lineTo(this.bound.x + this.bound.width - this.round, this.bound.y);
    ctx.arc(
      this.bound.x + this.bound.width - this.round,
      this.bound.y + this.round,
      this.round,
      Math.PI * (3 / 2),
      0,
      false,
    );
    ctx.lineTo(
      this.bound.x + this.bound.width,
      this.bound.y + this.bound.height - this.round,
    );
    ctx.arc(
      this.bound.x + this.bound.width - this.round,
      this.bound.y + this.bound.height - this.round,
      this.round,
      0,
      Math.PI * (1 / 2),
      false,
    );
    ctx.lineTo(this.bound.x + this.round, this.bound.y + this.bound.height);
    ctx.arc(
      this.bound.x + this.round,
      this.bound.y + this.bound.height - this.round,
      this.round,
      Math.PI * (1 / 2),
      Math.PI,
      false,
    );
    ctx.lineTo(this.bound.x, this.bound.y + this.round);
    ctx.arc(
      this.bound.x + this.round,
      this.bound.y + this.round,
      this.round,
      Math.PI,
      Math.PI * (3 / 2),
      false,
    );
    ctx.closePath();
    ctx.fill();

    const textWidth = ctx.measureText(this.text).width;
    ctx.font = `${this.textSize}px '${this.fontFamily.join("', '")}'`;
    ctx.fillStyle = "#fff";
    ctx.fillText(
      this.text,
      this.bound.x + this.bound.width / 2 - textWidth / 2,
      this.bound.y + this.bound.height / 2 + this.textSize / 2 - 7,
    );
  }

  onTouchEnd(_: TouchEndEvent): void {
    if (this.onClickCallback) {
      this.onClickCallback();
    }
  }
}

export default Button;
