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

export async function dataURLtoImageData(dataURL: string): Promise<ImageData> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  const image = new Image();
  image.src = dataURL;

  return await new Promise((resolve) => {
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      resolve(context.getImageData(0, 0, image.width, image.height));
    };
  });
}

export function CropImageFromVideo(
  videoElement: HTMLVideoElement,
  width: number,
  height: number,
): string {
  const geom = GetCropGeometryFromVideo(videoElement, width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context?.drawImage(videoElement, geom.x, geom.y, geom.width, geom.height);
  return canvas.toDataURL("image/png");
}
