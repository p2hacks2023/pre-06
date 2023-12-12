import Bound from "../geometry/bound";
import Point from "../geometry/point";

export interface Component {
  bound: Bound;
  draw(context: CanvasRenderingContext2D): void;

  onClick?(event: MouseEvent): void;
  onScratch?(previousCursor: Point, currentCursor: Point): void;
  onSceneChanged?(): void;
}
