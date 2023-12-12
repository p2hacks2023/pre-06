import GameExecutor from "./engine/executor";
import ExecuteVideoElement from "./engine/video/exec";
import "./style.css";

function startGame(availableEvents: string[] = []) {
  const videoElement = document.createElement("video");
  ExecuteVideoElement(
    navigator,
    videoElement,
    (videoElement) => {
      const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const gameExecutor = new GameExecutor(canvas, videoElement);
      availableEvents.forEach((eventType) => {
        window.addEventListener(eventType, (event) => {
          gameExecutor.listen(eventType, event);
        });
      });
      // initial scene
      gameExecutor.stageScene("take!");
      gameExecutor.invokeProcess();
    },
    (err) => {
      console.log(err);
    },
  );
}

window.onload = () => {
  startGame(["touchmove", "touchstart", "touchend"]);
};
