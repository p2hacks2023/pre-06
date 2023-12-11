import ComponentContainer from "./componentContainer";
import { InitializeComponents, Scene } from "./componentTimeline";

class GameExecutor {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private videoElement: HTMLVideoElement;
  private componentContainer: ComponentContainer;

  constructor(canvas: HTMLCanvasElement, videoElement: HTMLVideoElement) {
    this.scene = "none";
    this.canvas = canvas;
    this.videoElement = videoElement;
    this.componentContainer = InitializeComponents(this, canvas, videoElement);
  }

  invokeProcess() {
    window.requestAnimationFrame(() => {
      this.processFrame();
    });
  }

  stageScene(scene: Scene) {
    const components = this.componentContainer.queryEnabledComponents([
      this.scene,
      scene,
    ]);
    components.forEach((component) => {
      if (component.onSceneChanged) {
        component.onSceneChanged();
      }
    });

    this.scene = scene;

    if (scene == "take!") {
      this.videoElement.play();
    } else {
      this.videoElement.pause();
    }
  }

  listen(eventType: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const components = this.componentContainer.queryEnabledComponents([
      this.scene,
    ]);

    switch (eventType) {
      case "click":
        const mouseEvent = event as MouseEvent;
        components.forEach((component) => {
          if (
            component.onClick &&
            component.bound.includes(mouseEvent.offsetX, mouseEvent.offsetY)
          ) {
            component.onClick(mouseEvent);
          }
        });
        break;
    }
  }

  processFrame() {
    const context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.componentContainer
      .queryEnabledComponents([this.scene])
      .forEach((component) => component.draw(context));
    this.invokeProcess();
  }
}

export default GameExecutor;
