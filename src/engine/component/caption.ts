import Bound from "../geometry/bound";
import { Component } from "./component";

function blendColor(
  color1: [number, number, number],
  color2: [number, number, number],
  ratio: number,
): [number, number, number] {
  return [
    color1[0] * (1 - ratio) + color2[0] * ratio,
    color1[1] * (1 - ratio) + color2[1] * ratio,
    color1[2] * (1 - ratio) + color2[2] * ratio,
  ];
}

class Caption implements Component {
  bound: Bound;
  goalBound: Bound | null;
  animationSpeed: number;
  text: string;
  textSize: number;
  lineWidth: number;
  visible: boolean;
  fontFamily: string[];
  fillColor: [number, number, number];
  strokeColor: [number, number, number];
  opacity: number;
  effect: "normal" | "heaven" | "toohot";
  frame: number;

  constructor(
    startBound: Bound,
    goalBound: Bound | null,
    animationSpeed: number,
    text: string,
    textSize: number,
    lineWidth: number,
    visible: boolean,
    fontFamily: string[],
    fillColor: [number, number, number],
    strokeColor: [number, number, number],
    effect: "normal" | "heaven" | "toohot",
  ) {
    this.bound = startBound;
    this.goalBound = goalBound;
    this.animationSpeed = animationSpeed;
    this.text = text;
    this.textSize = textSize;
    this.lineWidth = lineWidth;
    this.visible = visible;
    this.fontFamily = fontFamily;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.effect = effect;
    this.frame = 0;

    switch (this.effect) {
      case "normal":
        this.opacity = 1.0;
        break;
      case "heaven":
        this.opacity = 0.0;
        break;
      case "toohot":
        this.opacity = 1.0;
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) {
      return;
    }
    if (this.goalBound != null) {
      this.bound.animateTo(this.goalBound, this.animationSpeed);
    }
    this.text.split("\n").forEach((line, index) => {
      let fillColor = this.fillColor;
      let strokeColor = this.strokeColor;
      if (this.effect === "toohot") {
        const ratio = Math.sin(this.frame * 0.3) * 0.3 + 0.7;
        fillColor = blendColor([1.0, 1.0, 1.0], this.fillColor, ratio);
        strokeColor = blendColor([1.0, 1.0, 1.0], this.strokeColor, ratio);
      }
      ctx.fillStyle = `rgb(${fillColor[0] * 255}, ${fillColor[1] * 255}, ${
        fillColor[2] * 255
      })`;
      ctx.strokeStyle = `rgb(${strokeColor[0] * 255}, ${
        strokeColor[1] * 255
      }, ${strokeColor[2] * 255})`;
      ctx.lineWidth = this.lineWidth;
      ctx.font = `${this.textSize}px ${this.fontFamily.join(",")}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = this.opacity;

      let quakeX = 1.0,
        quakeY = 1.0;
      if (this.effect === "toohot") {
        quakeX = Math.sin(this.frame * 5.0) * 0.01 + 1.0;
        quakeY = Math.random() * 0.01 + 1.0;
      }
      ctx.strokeText(
        line,
        (this.bound.x + this.bound.width / 2) * quakeX,
        (this.bound.y + this.bound.height / 2 + this.textSize * index) * quakeY,
      );
      ctx.fillText(
        line,
        (this.bound.x + this.bound.width / 2) * quakeX,
        (this.bound.y + this.bound.height / 2 + this.textSize * index) * quakeY,
      );
      ctx.globalAlpha = 1.0;
      this.opacity = (this.opacity - 1.0) * (1.0 - this.animationSpeed) + 1.0;
    });
    this.frame++;
  }

  changeText(text: string) {
    this.text = text;
  }

  changeVisible(visible: boolean) {
    this.visible = visible;
  }
}

export default Caption;
