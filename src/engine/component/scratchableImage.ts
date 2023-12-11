import Bound from "../geometry/bound";
import { Component } from "./component";

class ScratchableImage implements Component {
  bound: Bound;
  private imageData: ImageData | null;
  private scratchFinishCallback: () => void;

  constructor(bound: Bound, scratchFinishCallback: () => void) {
    this.bound = bound;
    this.imageData = null;
    this.scratchFinishCallback = scratchFinishCallback;
  }

  setImageData(imageData: ImageData) {
    this.imageData = imageData;
  }

  draw(context: CanvasRenderingContext2D) {
    if (this.imageData) {
      context.putImageData(this.imageData, 0, 0);
    }
  }

  onClick(_: MouseEvent) {
    // as mock
    this.scratchFinishCallback();
  }
}

export default ScratchableImage;
