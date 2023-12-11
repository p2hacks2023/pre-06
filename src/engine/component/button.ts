import Bound from "../geometry/bound";
import { Component } from "./component";

class Button implements Component {
  bound: Bound;
  round: number;
  color: string | CanvasGradient | CanvasPattern;

  constructor(bound: Bound, round: number, color: string | CanvasGradient | CanvasPattern) {
    this.bound = bound;
    this.round = round
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.bound.x + this.round, this.bound.y);
    ctx.lineTo(this.bound.x + this.bound.width - this.round, this.bound.y);
    ctx.arc(this.bound.x + this.bound.width - this.round, this.bound.y + this.round, this.round, Math.PI * (3/2), 0, false);
    ctx.lineTo(this.bound.x + this.bound.width, this.bound.y + this.bound.height - this.round);
    ctx.arc(this.bound.x + this.bound.width - this.round, this.bound.y + this.bound.height - this.round, this.round, 0, Math.PI * (1/2), false);
    ctx.lineTo(this.bound.x + this.round, this.bound.y + this.bound.height);       
    ctx.arc(this.bound.x + this.round, this.bound.y + this.bound.height - this.round, this.round, Math.PI * (1/2), Math.PI, false);
    ctx.lineTo(this.bound.x, this.bound.y + this.round);
    ctx.arc(this.bound.x + this.round, this.bound.y + this.round, this.round, Math.PI, Math.PI * (3/2), false);
    ctx.closePath();
    ctx.fill();
  }
}

export default Button;
