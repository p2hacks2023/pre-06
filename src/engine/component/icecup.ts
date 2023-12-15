import Bound from "../geometry/bound";
import { Grade } from "../model/grade";
import { Scene } from "../model/scene";
import { Component } from "./component";

const SYRUP_VISIBLE_DURATION = 100;

async function createSyrupImage(
  baseImage: HTMLImageElement,
  color: [number, number, number],
) {
  const canvas = document.createElement("canvas");
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);
  const baseImageData = context.getImageData(
    0,
    0,
    baseImage.width,
    baseImage.height,
  );

  const width = baseImageData.width;
  const height = baseImageData.height;
  let syrupImageData = new ImageData(width, height);
  // ピクセルが透明でなく、かつ白でない場合、色を塗る
  for (let i = 0; i < baseImage.width * baseImage.height; i++) {
    const r = baseImageData.data[i * 4 + 0];
    const g = baseImageData.data[i * 4 + 1];
    const b = baseImageData.data[i * 4 + 2];
    const a = baseImageData.data[i * 4 + 3];
    if (a == 255 && !(r == 255 && g == 255 && b == 255)) {
      syrupImageData.data[i * 4 + 0] = color[0] * 255;
      syrupImageData.data[i * 4 + 1] = color[1] * 255;
      syrupImageData.data[i * 4 + 2] = color[2] * 255;
      syrupImageData.data[i * 4 + 3] = 255;
    }
  }

  return createImageBitmap(syrupImageData);
}

class Icecup implements Component {
  bound: Bound;
  private finishBound: Bound;
  private icecupImage: HTMLImageElement | null;
  private syrupImage: ImageBitmap | null;
  private baseSyrupImage: HTMLImageElement | null;
  private syrupColor: [number, number, number] | null;
  private finishClock: number;
  private syrupClock: number;
  private syrupOpacity: number;
  private moveFinishedCallback: () => void;
  private syrupFinishedCallback: () => void;

  constructor(
    bound: Bound,
    finishBound: Bound,
    moveFinishedCallback: () => void,
    syrupFinishedCallback: () => void,
  ) {
    this.bound = bound;
    this.finishBound = finishBound;
    this.finishClock = -1;
    this.syrupClock = -1;
    this.syrupOpacity = 0;

    this.icecupImage = null;
    const icecupImage = new Image();
    icecupImage.src = "images/icecup.webp";
    icecupImage.onload = () => {
      this.icecupImage = icecupImage;
    };
    this.baseSyrupImage = null;
    const baseSyrupImage = new Image();
    baseSyrupImage.src = "images/syrup.webp";
    baseSyrupImage.onload = () => {
      this.baseSyrupImage = baseSyrupImage;
    };
    this.syrupImage = null;
    this.syrupColor = null;

    this.moveFinishedCallback = moveFinishedCallback;
    this.syrupFinishedCallback = syrupFinishedCallback;
  }

  onSceneChanged(_: Scene, scene: Scene) {
    this.finishClock = -1;
    this.syrupClock = -1;
    if (scene == "finish") {
      this.finishClock = 0;
    }
    if (scene == "syruptime") {
      this.syrupClock = 0;
    }
  }

  draw(context: CanvasRenderingContext2D) {
    if (this.finishClock >= 0) {
      this.finishClock += 1;
      this.bound.animateTo(this.finishBound, 0.05);
      if (Math.abs(this.bound.y - this.finishBound.y) < 1) {
        this.moveFinishedCallback();
      }
    }
    if (this.syrupClock >= 0) {
      this.syrupClock += 1;
      const syrupWidth = this.bound.width * 0.02;
      const syrupMoveRange = this.bound.width * 0.3;
      const syrupX =
        this.bound.x +
        syrupMoveRange * Math.cos(this.syrupClock / 7) +
        this.bound.width * 0.5;
      const syrupOpacity = Math.min(
        Math.sin((this.syrupClock / SYRUP_VISIBLE_DURATION) * Math.PI) * 2,
        1,
      );
      const syrupColor = this.syrupColor || [0.5, 0.5, 0.5];
      context.fillStyle = `rgba(${syrupColor[0] * 255}, ${
        syrupColor[1] * 255
      }, ${syrupColor[2] * 255}, ${syrupOpacity})`;
      context.fillRect(
        syrupX,
        0,
        syrupWidth,
        this.bound.y + this.bound.height / 2,
      );

      this.syrupOpacity = Math.min(this.syrupClock / SYRUP_VISIBLE_DURATION, 1);
      if (this.syrupClock >= SYRUP_VISIBLE_DURATION) {
        this.syrupFinishedCallback();
        this.syrupClock = -1;
      }
    }
    if (this.icecupImage) {
      context.drawImage(
        this.icecupImage,
        this.bound.x,
        this.bound.y,
        this.bound.width,
        this.bound.height,
      );
    }
    if (this.syrupImage) {
      context.globalAlpha = this.syrupOpacity;
      context.drawImage(
        this.syrupImage,
        this.bound.x,
        this.bound.y,
        this.bound.width,
        this.bound.height,
      );
      context.globalAlpha = 1;
    }
  }

  setGrade(grade: Grade) {
    this.syrupColor = grade.color;
    createSyrupImage(this.baseSyrupImage!, this.syrupColor).then(
      (syrupImage) => {
        this.syrupImage = syrupImage;
      },
    );
  }
}

export default Icecup;
