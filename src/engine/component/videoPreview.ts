import Bound from "../geometry/bound";
import { EvaluateHotness } from "../model/eval";
import { CropImageFromVideo, GetCropGeometryFromVideo } from "../video/crop";
import { Component } from "./component";

class VideoPreview implements Component {
  bound: Bound;
  private videoElement: HTMLVideoElement;
  private hotnessCalculatedCallback: (hotProp: number) => void;
  private frame: number;
  private hotInnerShadowImage: HTMLImageElement | null;

  private hotEffectThreshold: number;
  private currentHotness: number;

  constructor(
    bound: Bound,
    videoElement: HTMLVideoElement,
    hotnessCalculatedCallback: (hotProp: number) => void,
    hotEffectThreshold: number,
  ) {
    this.bound = bound;
    this.videoElement = videoElement;
    this.hotnessCalculatedCallback = hotnessCalculatedCallback;
    this.frame = 0;
    this.hotInnerShadowImage = null;
    this.hotEffectThreshold = hotEffectThreshold;
    this.currentHotness = 0;
    const hotInnerShadowWidth = 1;
    let hotInnerShadow = new ImageData(hotInnerShadowWidth, bound.height);
    for (let i = 0; i < hotInnerShadowWidth * bound.height; i++) {
      const y = Math.floor(i / hotInnerShadowWidth);
      hotInnerShadow.data[i * 4 + 0] = 200;
      hotInnerShadow.data[i * 4 + 1] = 0;
      hotInnerShadow.data[i * 4 + 2] = 0;
      hotInnerShadow.data[i * 4 + 3] =
        (1.0 - Math.sin((y / bound.height) * Math.PI)) * 200 + 30;
    }

    let canvas = document.createElement("canvas");
    canvas.width = hotInnerShadowWidth;
    canvas.height = bound.height;

    let context = canvas.getContext("2d");
    context?.putImageData(hotInnerShadow, 0, 0);
    let image = new Image();
    image.src = canvas.toDataURL();
    image.onload = () => {
      this.hotInnerShadowImage = image;
    };
  }

  draw(context: CanvasRenderingContext2D) {
    const geom = GetCropGeometryFromVideo(
      this.videoElement,
      this.bound.width,
      this.bound.height,
    );
    context.drawImage(
      this.videoElement,
      geom.x,
      geom.y,
      geom.width,
      geom.height,
    );

    if (this.hotInnerShadowImage) {
      let alpha = 0.2;
      if (this.currentHotness > this.hotEffectThreshold) {
        alpha = (Math.sin(this.frame * 0.3) * 0.5 + 0.5) * 0.3 + 0.7;
      }
      context.globalAlpha = alpha;
      context.drawImage(
        this.hotInnerShadowImage,
        0,
        0,
        this.bound.width,
        this.bound.height,
      );
      context.globalAlpha = 1.0;
    }

    if (this.frame % 20 == 0) {
      const aspectRatio =
        this.videoElement.videoWidth / this.videoElement.videoHeight;
      const minWidth = 10;
      const cropWidth = Math.max(minWidth, this.bound.width * 0.1);
      const cropHeight = cropWidth / aspectRatio;
      const imageDataURL = CropImageFromVideo(
        this.videoElement,
        cropWidth,
        cropHeight,
      );
      const hotness = EvaluateHotness(imageDataURL);
      this.currentHotness = hotness;
      this.hotnessCalculatedCallback(hotness);
    }

    this.frame += 1;
  }
}

export default VideoPreview;
