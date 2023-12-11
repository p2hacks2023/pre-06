import Bound from "../geometry/bound";
import { GetCropGeometryFromVideo } from "../video/crop";
import { Component } from "./component";

class VideoPreview implements Component {
  bound: Bound;
  private videoElement: HTMLVideoElement;

  constructor(bound: Bound, videoElement: HTMLVideoElement) {
    this.bound = bound;
    this.videoElement = videoElement;
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
  }
}

export default VideoPreview;
