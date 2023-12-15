import Bound from "../geometry/bound";
import { CropImageFromVideo, GetCropGeometryFromVideo } from "../video/crop";
import { evaluate_hotness } from "../wasmpkg/hot_finder";
import { Component } from "./component";

class VideoPreview implements Component {
  bound: Bound;
  private videoElement: HTMLVideoElement;
  private hotnessCalculatedCallback: (hotProp: number) => void;
  private frame: number;

  constructor(
    bound: Bound,
    videoElement: HTMLVideoElement,
    hotnessCalculatedCallback: (hotProp: number) => void,
  ) {
    this.bound = bound;
    this.videoElement = videoElement;
    this.hotnessCalculatedCallback = hotnessCalculatedCallback;
    this.frame = 0;
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

    if (this.frame % 10 == 0) {
      const imageDataURL = CropImageFromVideo(
        this.videoElement,
        this.bound.width,
        this.bound.height,
      );
      const hotness = evaluate_hotness(imageDataURL);
      this.hotnessCalculatedCallback(hotness);
    }

    this.frame += 1;
  }
}

export default VideoPreview;
