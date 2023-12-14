import Bound from "../geometry/bound";
import Point from "../geometry/point";
import { dataURLtoImageData } from "../video/crop";
import { evaluate_hotness, extract_hot_buffer } from "../wasmpkg/hot_finder";
import { Component } from "./component";

// 画面の大きさに対する、落とす図形の半径の大きさ
const SCRATCH_RADIUS_NORMAL_RATIO = 0.1;
// 重力加速度 (2の倍数であると良い)
const GRAVITY = 4;
// 落下してからの時間がこの値を超えたら図形が白くなる
const FALL_TIME_WHITE = 20;

function getIndex(x: number, y: number, width: number) {
  return y * width + x;
}

function getXY(index: number, width: number) {
  return [index % width, Math.floor(index / width)];
}

class ScratchableImage implements Component {
  bound: Bound;
  // もととなる画像
  private imageData: ImageData | null;
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

  constructor(
    bound: Bound,
    flushEndCallback: () => void,
    fallCallback: (hotProp: number, hotness: number) => void,
  ) {
    this.bound = bound;
    this.goalY = null;
    this.imageData = null;
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
  }

  async setImageData(imageDataURL: string) {
    this.hotnessScore = evaluate_hotness(imageDataURL);
    const hotBuffer = extract_hot_buffer(imageDataURL);
    this.imageData = await dataURLtoImageData(imageDataURL);
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
    const scratchedImageBuffer = new Uint8ClampedArray(width * height * 4);
    let groupFallHeight = new Array(this.falltime.length).fill(-1);

    for (let i = 0; i < width * height; i++) {
      const fallgroup = this.fallgroup[i];
      if (fallgroup < 0 || !this.hotPixel[i]) {
        if (scratchedImageBuffer[i * 4 + 3] > 0) {
          continue;
        }
        scratchedImageBuffer[i * 4 + 0] = data[i * 4 + 0];
        scratchedImageBuffer[i * 4 + 1] = data[i * 4 + 1];
        scratchedImageBuffer[i * 4 + 2] = data[i * 4 + 2];
        scratchedImageBuffer[i * 4 + 3] = data[i * 4 + 3];
      } else {
        if (this.falltime[fallgroup] < 0) {
          continue;
        }

        let fallHeight = groupFallHeight[fallgroup];
        if (groupFallHeight[fallgroup] < 0) {
          const falltime = this.falltime[fallgroup];
          fallHeight = falltime * falltime * GRAVITY * 0.5;
          groupFallHeight[fallgroup] = fallHeight;
        }
        const [x, y] = getXY(i, width);
        const dy = y + fallHeight;
        const debrisIndex = getIndex(x, dy, width);
        if (debrisIndex >= width * height) {
          this.falltime[fallgroup] = -1;
          continue;
        }

        const whiteProp = this.falltime[fallgroup] / FALL_TIME_WHITE;

        scratchedImageBuffer[debrisIndex * 4 + 0] =
          data[i * 4 + 0] * (1 - whiteProp) + 255 * whiteProp;
        scratchedImageBuffer[debrisIndex * 4 + 1] =
          data[i * 4 + 1] * (1 - whiteProp) + 255 * whiteProp;
        scratchedImageBuffer[debrisIndex * 4 + 2] =
          data[i * 4 + 2] * (1 - whiteProp) + 255 * whiteProp;
        scratchedImageBuffer[debrisIndex * 4 + 3] = data[i * 4 + 3];
      }
    }

    context.putImageData(
      new ImageData(scratchedImageBuffer, width, height),
      this.bound.x,
      this.bound.y,
    );

    if (this.goalY != null) {
      this.bound.y = (this.bound.y - this.goalY) * 0.95 + this.goalY;
      return;
    }

    if (this.flushBrightness > 0) {
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
    }
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
      if (x - 1 >= 0 && this.fallgroup[x - 1 + y * width] < 0) {
        stack.push([x - 1, y]);
      }
      // down
      if (x + 1 < width && this.fallgroup[x + 1 + y * width] < 0) {
        stack.push([x + 1, y]);
      }
      // left
      if (y - 1 >= 0 && this.fallgroup[x + (y - 1) * width] < 0) {
        stack.push([x, y - 1]);
      }
      // right
      if (y + 1 < height && this.fallgroup[x + (y + 1) * width] < 0) {
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
