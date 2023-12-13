import ComponentContainer from "./componentContainer";
import Icecup from "./component/icecup";
import ScratchableImage from "./component/scratchableImage";
import Shatter from "./component/shatter";
import VideoPreview from "./component/videoPreview";
import Bound from "./geometry/bound";
import GameRouter from "./executor";
import { CropImageFromVideo } from "./video/crop";
import Button from "./component/button";

// scratch!シーンを終える条件となる、残りアツピクセル比率のしきい値
const SCRATCH_FINISH_HOTPROP_THRESHOLD = 0.15;
// かき氷が下から上に向かってくるときの、かき氷の見える部分の(かき氷の大きさに対する)最大割合
const ICECUP_RAISING_RATIO = 0.5;

export function InitializeComponents(
  router: GameRouter,
  canvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
) {
  let componentContainer: ComponentContainer = new ComponentContainer();

  let scratchableImageHotPropChanged: (hotProp: number) => void;
  const scratchableImage = new ScratchableImage(
    new Bound(0, 0, canvas.width, canvas.height),
    () => {
      router.stageScene("scratch!");
    },
    (hotProp) => {
      if (hotProp < SCRATCH_FINISH_HOTPROP_THRESHOLD) {
        router.stageScene("finish");
      }
      scratchableImageHotPropChanged(hotProp);
    },
  );
  componentContainer.addComponent(scratchableImage, [
    "flush",
    "scratch!",
    "finish",
  ]);

  componentContainer.addComponent(
    new VideoPreview(
      new Bound(0, 0, canvas.width, canvas.height),
      videoElement,
    ),
    ["take!"],
  );

  const shatterDiameter = Math.min(canvas.width, canvas.height) / 6;
  componentContainer.addComponent(
    new Shatter(
      new Bound(
        canvas.width / 2 - shatterDiameter / 2,
        canvas.height - shatterDiameter,
        shatterDiameter,
        shatterDiameter,
      ),
      videoElement,
      (videoElement) => {
        scratchableImage.setImageData(
          CropImageFromVideo(videoElement, canvas.width, canvas.height),
        );
        router.stageScene("flush");
      },
    ),
    ["take!"],
  );

  const icecupWidth = Math.min(canvas.width, canvas.height) * 1.25;
  const icecup = new Icecup(
    new Bound(
      canvas.width / 2 - icecupWidth / 2,
      canvas.height,
      icecupWidth,
      icecupWidth,
    ),
    canvas.width,
    canvas.height,
    () => {
      router.stageScene("satisfied");
    },
    () => {
      router.stageScene("result");
    },
  );
  componentContainer.addComponent(icecup, [
    "scratch!",
    "finish",
    "satisfied",
    "syruptime",
    "result",
  ]);

  scratchableImageHotPropChanged = (hotProp) => {
    icecup.bound.y =
      canvas.height - icecupWidth * (1.0 - hotProp) * ICECUP_RAISING_RATIO;
  };

  const satisfiedButtonWidth = Math.min(canvas.width, canvas.height) * 0.4;
  const satisfiedButton = new Button(
    new Bound(
      canvas.width / 2 - satisfiedButtonWidth / 2,
      canvas.height - satisfiedButtonWidth,
      satisfiedButtonWidth,
      satisfiedButtonWidth * 0.4,
    ),
    20,
    "result",
    "rgb(100, 100, 100)",
    () => {
      router.stageScene("syruptime");
    },
  );
  componentContainer.addComponent(satisfiedButton, ["satisfied"]);

  const resultButtonWidth = Math.min(canvas.width, canvas.height) * 0.4;
  const resultButton = new Button(
    new Bound(
      canvas.width / 2 - resultButtonWidth / 2,
      canvas.height - resultButtonWidth,
      resultButtonWidth,
      resultButtonWidth * 0.4,
    ),
    20,
    "again",
    "rgb(100, 100, 100)",
    () => {
      router.stageScene("take!");
    },
  );
  componentContainer.addComponent(resultButton, ["result"]);

  return componentContainer;
}
