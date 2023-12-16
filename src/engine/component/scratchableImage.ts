import Bound from "../geometry/bound";
import Point from "../geometry/point";
import { dataURLtoImageData } from "../video/crop";
import { evaluate_hotness, extract_hot_buffer } from "../wasmpkg/hot_finder";
import { Component } from "./component";

// 画面の大きさに対する、落とす図形の半径の大きさ
const SCRATCH_RADIUS_NORMAL_RATIO = 0.15;
// 重力加速度 (2の倍数であると良い)
const GRAVITY = 4;
// 落下してからの時間がこの値を超えたら図形が白くなる
const FALL_TIME_WHITE = 20;
// アツいピクセルを表す色
const EFFECT_COLOR = [255, 150, 150];
// アツいピクセルの色が変化する割合
const EFFECT_COLOR_STRENGTH = 0.3;

function getIndex(x: number, y: number, width: number) {
  return y * width + x;
}

class ScratchableImage implements Component {
  bound: Bound;
  // もととなる画像
  private imageData: ImageData | null;

  private scratchableImageBuffer: ImageData | null;
  // フラッシュが終わった時に呼ばれるコールバック
  private flushEndCallback: () => void;
  // フラッシュの強さ
  private flushBrightness: number;
  // 落下した図形が増えた時に呼ばれるコールバック
  private fallCallback: (hotProp: number, hotness: number) => void;
  // 落下する図形のグループ
  private fallgroup: number[];
  // 次に落下する図形のグループのindex
  private nextFallgroup: number;
  // 各グループの落下してからの時間
  private falltime: number[];
  // アツいピクセルかどうか
  private hotPixel: boolean[];
  private initialHotPixelCount: number;
  private hotPixelCount: number;
  // 落とす図形の半径
  private scratchRadius: number;
  // satisfied時に画像全体が向かうy座標
  private goalY: number | null;
  // 全体のアツさ
  private hotnessScore: number;

  private frame: number;

  constructor(
    bound: Bound,
    flushEndCallback: () => void,
    fallCallback: (hotProp: number, hotness: number) => void,
  ) {
    this.bound = bound;
    this.goalY = null;
    this.imageData = null;
    this.scratchableImageBuffer = null;
    this.flushEndCallback = flushEndCallback;
    this.flushBrightness = 1.0;
    this.fallCallback = fallCallback;
    this.fallgroup = [];
    this.falltime = [];
    this.hotPixel = [];
    this.hotPixelCount = 0;
    this.initialHotPixelCount = 0;
    this.nextFallgroup = 0;
    this.hotnessScore = 0;
    this.scratchRadius =
      Math.min(this.bound.width, this.bound.height) *
      SCRATCH_RADIUS_NORMAL_RATIO;
    this.frame = 0;
  }

  async setImageData(imageDataURL: string) {
    this.hotnessScore = evaluate_hotness(imageDataURL);
    const hotBuffer = extract_hot_buffer(imageDataURL);
    this.imageData = await dataURLtoImageData(imageDataURL);
    this.scratchableImageBuffer = new ImageData(
      this.imageData.width,
      this.imageData.height,
    );
    const hotPixelData = await dataURLtoImageData(hotBuffer);
    this.hotPixel = new Array(
      this.imageData.width * this.imageData.height,
    ).fill(false);
    this.hotPixelCount = 0;
    this.fallgroup = new Array(
      this.imageData.width * this.imageData.height,
    ).fill(-1);
    this.falltime = [];

    for (let i = 0; i < this.imageData.width * this.imageData.height; i++) {
      // if is hot
      if (hotPixelData.data[i * 4 + 3] > 0) {
        this.hotPixel[i] = true;
        this.hotPixelCount += 1;
      }
    }

    this.initialHotPixelCount = this.hotPixelCount;
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this.imageData) {
      return;
    }
    if (this.goalY != null) {
      if (!this.scratchableImageBuffer) {
        return;
      }
      this.bound.y = (this.bound.y - this.goalY) * 0.95 + this.goalY;
      context.putImageData(
        this.scratchableImageBuffer,
        this.bound.x,
        this.bound.y,
      );
      return;
    }
    if (this.flushBrightness > 0) {
      context.putImageData(this.imageData, this.bound.x, this.bound.y);
      context.fillStyle = `rgba(255, 255, 255, ${this.flushBrightness})`;
      context.fillRect(
        this.bound.x,
        this.bound.y,
        this.bound.width,
        this.bound.height,
      );
      this.flushBrightness -= 0.05;
      if (this.flushBrightness <= 0) {
        this.flushEndCallback();
      }
    } else {
      if (!this.scratchableImageBuffer) {
        return;
      }

      // 全てのfalltimeを更新
      for (let i = 0; i < this.falltime.length; i++) {
        if (this.falltime[i] < 0) {
          continue;
        }
        this.falltime[i] += 1;
      }

      const width = this.imageData.width;
      const height = this.imageData.height;
      const data = this.imageData.data;
      let groupFallHeight = new Array(this.nextFallgroup);
      let whiteProps = new Array(this.nextFallgroup);
      for (let i = 0; i < this.nextFallgroup; i++) {
        groupFallHeight[i] =
          this.falltime[i] * this.falltime[i] * GRAVITY * 0.5;
        whiteProps[i] = Math.min(1.0, this.falltime[i] / FALL_TIME_WHITE);
      }

      const redProp = (Math.sin(this.frame * 0.2)*0.5+0.5) * EFFECT_COLOR_STRENGTH + (1-EFFECT_COLOR_STRENGTH);
      for (let i = width * height - 1; i >= 0; i--) {
        const fallgroup = this.fallgroup[i];
        if (fallgroup < 0) {
          if (this.hotPixel[i]) {
            this.scratchableImageBuffer.data[i * 4 + 0] = data[i * 4 + 0]*redProp+EFFECT_COLOR[0]*(1-redProp);
            this.scratchableImageBuffer.data[i * 4 + 1] = data[i * 4 + 1]*redProp+EFFECT_COLOR[1]*(1-redProp);
            this.scratchableImageBuffer.data[i * 4 + 2] = data[i * 4 + 2]*redProp+EFFECT_COLOR[2]*(1-redProp);
          } else {
            this.scratchableImageBuffer.data[i * 4 + 0] = data[i * 4 + 0];
            this.scratchableImageBuffer.data[i * 4 + 1] = data[i * 4 + 1];
            this.scratchableImageBuffer.data[i * 4 + 2] = data[i * 4 + 2];
          }
          this.scratchableImageBuffer.data[i * 4 + 3] = 255;
        } else {
          this.scratchableImageBuffer.data[i * 4 + 3] = 0;
          if (this.falltime[fallgroup] < 0) {
            continue;
          }
          let fallHeight = groupFallHeight[fallgroup];
          const debrisIndex = i + fallHeight * width;
          if (debrisIndex >= width * height) {
            this.falltime[fallgroup] = -1;
            continue;
          }
          for (let j = 0; j < 3; j++) {
            this.scratchableImageBuffer.data[debrisIndex * 4 + j] =
              data[i * 4 + j] * (1 - whiteProps[fallgroup]) +
              255 * whiteProps[fallgroup];
          }
          this.scratchableImageBuffer.data[debrisIndex * 4 + 3] =
            data[i * 4 + 3];
        }
      }

      context.putImageData(
        this.scratchableImageBuffer,
        this.bound.x,
        this.bound.y,
      );
    }
    this.frame += 1;
  }

  // 与えたポイントに対してボロノイ図を導き、その図形を落下させる
  FallCell(start: Point) {
    const [startx, starty] = [
      Math.floor(start.x - this.bound.x),
      Math.floor(start.y - this.bound.y),
    ];
    const [width, height] = [this.imageData!.width, this.imageData!.height];

    const index = getIndex(startx, starty, width);

    if (this.fallgroup[index] >= 0) {
      return;
    }

    if (!this.hotPixel[index]) {
      return;
    }

    // 局所的なボロノイ図を作る
    const voronoiPoints = [[startx, starty]];
    let angle = 0.0;
    const minAngle = Math.PI / 3;
    const maxAngle = Math.PI / 2.2;

    while (angle < 2 * Math.PI - minAngle) {
      const random = Math.random() * (maxAngle - minAngle) + minAngle;
      angle += random;
      const radius = Math.random() * this.scratchRadius + this.scratchRadius;
      const x = startx + radius * Math.cos(angle);
      const y = starty + radius * Math.sin(angle);
      voronoiPoints.push([x, y]);
    }

    let stack = [[startx, starty]];

    while (stack.length > 0) {
      const [x, y] = stack.pop() as [number, number];
      const index = getIndex(x, y, width);
      if (!this.hotPixel[index]) {
        continue;
      }
      if (this.fallgroup[index] >= 0) {
        continue;
      }

      let minSqDistance = Number.MAX_VALUE;
      let minIndex = 0;
      voronoiPoints.forEach((_, index) => {
        const distance =
          (x - voronoiPoints[index][0]) ** 2 +
          (y - voronoiPoints[index][1]) ** 2;
        if (distance < minSqDistance) {
          minSqDistance = distance;
          minIndex = index;
        }
      });
      if (minIndex != 0) {
        continue;
      }
      // fallgroupに追加
      this.fallgroup[index] = this.nextFallgroup;
      this.hotPixelCount -= 1;
      // 4方向に伝播
      // up
      const upIndex = getIndex(x - 1, y, width);
      if (x - 1 >= 0 && this.fallgroup[upIndex] < 0 && this.hotPixel[upIndex]) {
        stack.push([x - 1, y]);
      }
      // down
      const downIndex = getIndex(x + 1, y, width);
      if (
        x + 1 < width &&
        this.fallgroup[downIndex] < 0 &&
        this.hotPixel[downIndex]
      ) {
        stack.push([x + 1, y]);
      }
      // left
      const leftIndex = getIndex(x, y - 1, width);
      if (
        y - 1 >= 0 &&
        this.fallgroup[leftIndex] < 0 &&
        this.hotPixel[leftIndex]
      ) {
        stack.push([x, y - 1]);
      }
      // right
      const rightIndex = getIndex(x, y + 1, width);
      if (
        y + 1 < height &&
        this.fallgroup[rightIndex] < 0 &&
        this.hotPixel[rightIndex]
      ) {
        stack.push([x, y + 1]);
      }
    }
    this.falltime.push(0);
    this.nextFallgroup += 1;

    const hotPixelRatio = this.hotPixelCount / this.initialHotPixelCount;

    this.fallCallback(hotPixelRatio, this.hotnessScore);
  }

  onSceneChanged(_: string, scene: string): void {
    if (scene == "finish") {
      // 画面上部に移動させる
      this.goalY = -this.bound.height * 1.5;
    }
  }

  onScratch(previousCursor: Point, currentCursor: Point): void {
    if (this.goalY != null) {
      return;
    }

    const distance = previousCursor.distance(currentCursor);
    let startDistance = 0.0;
    while (startDistance < distance) {
      const t = startDistance / distance;
      const scratchPoint = currentCursor.lerp(previousCursor, t);
      this.FallCell(scratchPoint);
      startDistance += this.scratchRadius;
    }
  }
}

export default ScratchableImage;
