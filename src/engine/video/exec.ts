async function ExecuteVideoElement(
  navigator: Navigator,
  videoElement: HTMLVideoElement,
  successCallback: (videoElement: HTMLVideoElement) => void,
  errorCallback: (err: Error) => void,
) {
  const success = (stream: MediaStream) => {
    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = () => {
      successCallback(videoElement);
    };
  };

  await navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: {
          exact: "environment",
        },
      },
      audio: false,
    })
    .then(success)
    .catch(async (_) => {
      await navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then(success)
        .catch((err) => {
          errorCallback(err);
        });
    });
}

export default ExecuteVideoElement;
