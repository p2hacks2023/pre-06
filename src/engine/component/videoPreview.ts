import Bound from "../geometry/bound";
import { CropImageFromVideo, GetCropGeometryFromVideo } from "../video/crop";
import { evaluate_hotness } from "../wasmpkg/hot_finder";
import { Component } from "./component";

class VideoPreview implements Component {
  bound: Bound;
  private videoElement: HTMLVideoElement;
  private hotnessCalculatedCallback: (hotProp: number) => void;
  private frame: number;
  private hotInnerShadowImage: HTMLImageElement | null;

  constructor(
    bound: Bound,
    videoElement: HTMLVideoElement,
    hotnessCalculatedCallback: (hotProp: number) => void,
  ) {
    this.bound = bound;
    this.videoElement = videoElement;
    this.hotnessCalculatedCallback = hotnessCalculatedCallback;
    this.frame = 0;
    this.hotInnerShadowImage = null;
    const hotInnerShadowWidth = 1;
    let hotInnerShadow = new ImageData(hotInnerShadowWidth, bound.height);
    for (let i = 0; i < 5 * bound.height; i++) {
      const y = Math.floor(i / hotInnerShadowWidth);
      hotInnerShadow.data[i * 4 + 0] = 255;
      hotInnerShadow.data[i * 4 + 1] = 0;
      hotInnerShadow.data[i * 4 + 2] = 0;
      hotInnerShadow.data[i * 4 + 3] =
        (1.0 - Math.sin((y / bound.height) * Math.PI)) * 100;
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
      context.drawImage(
        this.hotInnerShadowImage,
        0,
        0,
        this.bound.width,
        this.bound.height,
      );
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
      const hotness = evaluate_hotness(imageDataURL);
      this.hotnessCalculatedCallback(hotness);
    }

    this.frame += 1;
  }
}

export default VideoPreview;
