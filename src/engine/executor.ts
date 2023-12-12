import { Component } from "./component/component";
import ComponentContainer from "./componentContainer";
import { InitializeComponents, Scene } from "./componentTimeline";
import Point from "./geometry/point";
import { TouchEndEvent, TouchMoveEvent } from "./model/event";

class GameExecutor {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  private videoElement: HTMLVideoElement;
  private componentContainer: ComponentContainer;
  private scratchCursorQueue: Point[];
  private previousCursorDiff: Point;
  private touchingComponentIndex: number | null;

  constructor(canvas: HTMLCanvasElement, videoElement: HTMLVideoElement) {
    this.scene = "none";
    this.canvas = canvas;
    this.videoElement = videoElement;
    this.componentContainer = InitializeComponents(this, canvas, videoElement);
    this.scratchCursorQueue = [];
    this.previousCursorDiff = new Point(-1, -1);
    this.touchingComponentIndex = null;
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
    this.scratchCursorQueue.push(currentCursor);

    const minWindowSize = Math.min(this.canvas.width, this.canvas.height);

    if (this.scratchCursorQueue.length > 15) {
      const poppedCursor = this.scratchCursorQueue.shift() as Point;
      const currentCursorDiff = poppedCursor.sub(currentCursor);
      if (
        (currentCursorDiff.x >= 0 != this.previousCursorDiff.x >= 0 ||
          currentCursorDiff.y >= 0 != this.previousCursorDiff.y >= 0) &&
        currentCursorDiff.squaredDistance(this.previousCursorDiff) >
          (minWindowSize * 0.01) ** 2
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
    event.stopPropagation();

    const components = this.componentContainer.queryEnabledComponents([
      this.scene,
    ]);

    switch (eventType) {
      case "touchmove": {
        const touchMoveEvent = new TouchMoveEvent(event as TouchEvent);
        this.invokeOnScratchEvent(
          new Point(touchMoveEvent.pageX, touchMoveEvent.pageY),
          components,
        );
        components.forEach((component, index) => {
          if (
            component.onTouchMove &&
            component.bound.includes(touchMoveEvent.pageX, touchMoveEvent.pageY)
          ) {
            component.onTouchMove(touchMoveEvent);
          }
          if (
            index == this.touchingComponentIndex &&
            component.onTouchEnd &&
            !component.bound.includes(
              touchMoveEvent.pageX,
              touchMoveEvent.pageY,
            )
          ) {
            component.onTouchEnd(touchMoveEvent);
            this.touchingComponentIndex = null;
          }
        });
        break;
      }
      case "touchstart": {
        const touchStartEvent = new TouchMoveEvent(event as TouchEvent);
        components.forEach((component, index) => {
          if (
            component.onTouchStart &&
            component.bound.includes(
              touchStartEvent.pageX,
              touchStartEvent.pageY,
            )
          ) {
            component.onTouchStart(touchStartEvent);
            this.touchingComponentIndex = index;
          }
        });
        break;
      }
      case "touchend": {
        const touchEndEvent = new TouchEndEvent(event as TouchEvent);
        components.forEach((component) => {
          if (
            component.onTouchEnd &&
            component.bound.includes(touchEndEvent.pageX, touchEndEvent.pageY)
          ) {
            component.onTouchEnd(touchEndEvent);
          }
        });
        this.scratchCursorQueue = [];
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
