import { Component } from "./component/component";
import ComponentContainer from "./componentContainer";
import { InitializeComponents, Scene } from "./componentTimeline";
import Point from "./geometry/point";


class GameExecutor {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private videoElement: HTMLVideoElement;
  private componentContainer: ComponentContainer;
  private touchMoveQueue: Point[];
  private previousCursorDiff: Point;

  constructor(canvas: HTMLCanvasElement, videoElement: HTMLVideoElement) {
    this.scene = "none";
    this.canvas = canvas;
    this.videoElement = videoElement;
    this.componentContainer = InitializeComponents(this, canvas, videoElement);
    this.touchMoveQueue = [];
    this.previousCursorDiff = new Point(-1, -1);
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

  private invokeOnScratchEvent(currentCursor: Point, components: Component[]) {
    
    this.touchMoveQueue.push(currentCursor);

    const minWindowSize = Math.min(this.canvas.width, this.canvas.height);
    
    if (this.touchMoveQueue.length > 15) {
      const poppedCursor = this.touchMoveQueue.shift() as Point;
      const currentCursorDiff = poppedCursor.sub(currentCursor);
      if (
        (currentCursorDiff.x >= 0 != this.previousCursorDiff.x >= 0 ||
          currentCursorDiff.y >= 0 != this.previousCursorDiff.y >= 0) &&
        currentCursorDiff.squaredDistance(this.previousCursorDiff) > (minWindowSize*0.01)**2
      ) {
        components.forEach((component) => {
          if (
            component.onScratch &&
            component.bound.includes(currentCursor.x, currentCursor.y)
          ) {
            component.onScratch(poppedCursor, currentCursor);
          }
        });
      }
      this.previousCursorDiff = currentCursorDiff;
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
      case "mousemove":{
        const mouseMoveEvent = event as MouseEvent;
        const currentCursor = new Point(
          mouseMoveEvent.offsetX,
          mouseMoveEvent.offsetY,
        );
        this.invokeOnScratchEvent(currentCursor, components);
        break;
      }
      case "touchmove":{
        const touchEvent = event as TouchEvent;
        const moveX = touchEvent.changedTouches[0].pageX;
        const moveY = touchEvent.changedTouches[0].pageY;
        const currentCursor = new Point(moveX, moveY);
        this.invokeOnScratchEvent(currentCursor, components);
        break;
      }
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
