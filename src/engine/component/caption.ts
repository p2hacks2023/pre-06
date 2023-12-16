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

class Particle {
  x: number;
  y: number;
  rangeX: number;
  rangeY: number;
  rangeWidth: number;
  rangeHeight: number;
  radius: number;
  initialFrame: number;
  radiusMax: number;
  speed: number;
  startFrame: number;

  constructor(
    rangeX: number,
    rangeY: number,
    rangeWidth: number,
    rangeHeight: number,
    initialFrame: number,
    radiusMax: number,
  ) {
    this.x = Math.random() * rangeWidth + rangeX;
    this.y = Math.random() * rangeHeight + rangeY;
    this.rangeX = rangeX;
    this.rangeY = rangeY;
    this.rangeWidth = rangeWidth;
    this.rangeHeight = rangeHeight;
    this.startFrame = initialFrame;
    this.initialFrame = initialFrame;
    this.speed = Math.random() * 0.02 + 0.02;
    this.radius = Math.random() * radiusMax;
    this.radiusMax = radiusMax;
  }

  draw(ctx: CanvasRenderingContext2D, frame: number) {
    if (this.initialFrame > frame) {
      return;
    }

    const ratio = (frame - this.startFrame) * this.speed;
    const size = Math.sin(ratio * Math.PI) * this.radius;

    if (size < 0) {
      this.x = Math.random() * this.rangeWidth + this.rangeX;
      this.y = Math.random() * this.rangeHeight + this.rangeY;
      this.startFrame = frame;
      this.radius = Math.random() * this.radiusMax;
      return;
    }
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Particles {
  particles: Particle[];

  constructor(
    num: number,
    rangeX: number,
    rangeY: number,
    rangeWidth: number,
    rangeHeight: number,
    initialFrame: number,
    radiusMax: number,
  ) {
    this.particles = [];
    for (let i = 0; i < num; i++) {
      this.particles.push(
        new Particle(
          rangeX,
          rangeY,
          rangeWidth,
          rangeHeight,
          initialFrame,
          radiusMax,
        ),
      );
    }
  }

  draw(ctx: CanvasRenderingContext2D, frame: number) {
    this.particles.forEach((p) => {
      p.draw(ctx, frame);
    });
  }
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
  particles: Particles | null;
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
        this.particles = null;
        break;
      case "heaven":
        this.opacity = 0.0;
        this.particles = new Particles(
          10,
          this.bound.x,
          this.bound.y + textSize,
          this.bound.width,
          this.bound.height,
          this.frame,
          3,
        );
        break;
      case "toohot":
        this.opacity = 1.0;
        this.particles = null;
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
    if (this.particles != null) {
      this.particles.draw(ctx, this.frame);
    }
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
