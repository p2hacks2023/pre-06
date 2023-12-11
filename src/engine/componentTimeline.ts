import ComponentContainer from "./componentContainer";
import Icecup from "./component/icecup";
import ScratchableImage from "./component/scratchableImage";
import Shatter from "./component/shatter";
import VideoPreview from "./component/videoPreview";
import Bound from "./geometry/bound";
import GameRouter from "./executor";
import { CropImageFromVideo } from "./video/crop";

export type Scene = "none" | "take!" | "scratch!" | "satisfied";

export function InitializeComponents(
  router: GameRouter,
  canvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
) {
  let componentContainer: ComponentContainer = new ComponentContainer();

  const scratchableImage = new ScratchableImage(
    new Bound(0, 0, canvas.width, canvas.height),
    () => {
      router.stageScene("satisfied");
    },
  );
  componentContainer.addComponent(scratchableImage, ["scratch!"]);

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
        router.stageScene("scratch!");
      },
    ),
    ["take!"],
  );

  const icecupWidth = Math.min(canvas.width, canvas.height) * 1.25;
  componentContainer.addComponent(
    new Icecup(
      new Bound(
        canvas.width / 2 - icecupWidth / 2,
        canvas.height - icecupWidth / 2,
        icecupWidth,
        icecupWidth,
      ),
      canvas.width,
      canvas.height,
    ),
    ["scratch!", "satisfied"],
  );

  return componentContainer;
}
