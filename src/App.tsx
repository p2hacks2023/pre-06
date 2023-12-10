import { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const webcamRef = useRef<Webcam>(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log(imageSrc?.toString());
  }, [webcamRef]);

  return (
    <>
      <Webcam
        audio={false}
        width={540}
        height={360}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
      <video id="canvas"></video>
      <button id="capture" onClick={capture}>
        キャプチャ
      </button>
      <canvas id="draw"></canvas>
    </>
  );
}

export default App;
