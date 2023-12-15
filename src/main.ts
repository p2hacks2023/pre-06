import GameExecutor from "./engine/executor";
import ExecuteVideoElement from "./engine/video/exec";
import init from "./engine/wasmpkg/hot_finder";
import "./style.css";

// ゲームを開始する
// 有効なイベントを引数として指定することで、そのイベントをゲームに反映させる
function startGame(availableEvents: string[] = []) {
  init();
  const videoElement = document.createElement("video");

  // attribute to iOS Safari
  videoElement.setAttribute("autoplay", "");
  videoElement.setAttribute("muted", "");
  videoElement.setAttribute("playsinline", "");

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
      // 最初のシーンを設定
      gameExecutor.stageScene("take!");
      // 処理を開始
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
