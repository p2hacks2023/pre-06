import Bound from "../geometry/bound";
import Point from "../geometry/point";
import { TouchEndEvent, TouchMoveEvent, TouchStartEvent } from "../model/event";

export interface Component {
  // コンポーネントの領域
  bound: Bound;

  // 画面が描画される時
  draw(context: CanvasRenderingContext2D): void;

  // 画面が擦られた時
  onScratch?(previousCursor: Point, currentCursor: Point): void;

  // シーンが変化した時 (ただし、コンポーネントが前後両方のシーンで有効である必要がある)
  onSceneChanged?(): void;

  // タッチされた最初のフレームの時
  onTouchStart?(event: TouchStartEvent): void;

  // タッチされている時
  onTouchMove?(event: TouchMoveEvent): void;

  // タッチが離された時、またはタッチがコンポーネントから外れた時
  onTouchEnd?(event: TouchEndEvent): void;
}
