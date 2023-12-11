import Bound from "../geometry/bound";

export interface Component {
  bound: Bound;
  draw(context: CanvasRenderingContext2D): void;

  onClick?(event: MouseEvent): void;

  onSceneChanged?(): void;
}
