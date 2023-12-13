import Bound from "../geometry/bound";

export function GetCropGeometryFromVideo(
  videoElement: HTMLVideoElement,
  width: number,
  height: number,
): Bound {
  const [captureWidth, captureHeight] = (function (
    videoElement: HTMLVideoElement,
    width: number,
    height: number,
  ): [number, number] {
    const videoRatio = videoElement.videoWidth / videoElement.videoHeight;
    const boundRatio = width / height;
    if (videoRatio > boundRatio) {
      return [height * videoRatio, height];
    } else {
      return [width, width / videoRatio];
    }
  })(videoElement, width, height);

  const captureX = (width - captureWidth) / 2;
  const captureY = (height - captureHeight) / 2;

  return new Bound(captureX, captureY, captureWidth, captureHeight);
}

export async function CropImageFromVideo(
  videoElement: HTMLVideoElement,
  width: number,
  height: number,
): Promise<ImageData> {
  const geom = GetCropGeometryFromVideo(videoElement, width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;

  // wait for video to be ready
  return await new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      context.drawImage(videoElement, geom.x, geom.y, geom.width, geom.height);
      resolve(context.getImageData(0, 0, geom.width, geom.height));
    };
    videoElement.load();
  });
}
