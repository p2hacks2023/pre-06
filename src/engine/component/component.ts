import Bound from "../geometry/bound";
import Point from "../geometry/point";
import { TouchEndEvent, TouchMoveEvent, TouchStartEvent } from "../model/event";

export interface Component {
  bound: Bound;
  draw(context: CanvasRenderingContext2D): void;

  onScratch?(previousCursor: Point, currentCursor: Point): void;
  onSceneChanged?(): void;
  onTouchStart?(event: TouchStartEvent): void;
  onTouchMove?(event: TouchMoveEvent): void;
  onTouchEnd?(event: TouchEndEvent): void;
}
