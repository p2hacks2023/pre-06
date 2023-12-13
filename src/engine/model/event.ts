export class TouchStartEvent {
  // X (pageX) 座標
  x: number;
  // Y (pageY) 座標
  y: number;
  constructor(event: TouchEvent) {
    this.x = event.changedTouches[0].pageX;
    this.y = event.changedTouches[0].pageY;
  }
}

export class TouchMoveEvent {
  // X (pageX) 座標
  x: number;
  // Y (pageY) 座標
  y: number;
  constructor(event: TouchEvent) {
    this.x = event.changedTouches[0].pageX;
    this.y = event.changedTouches[0].pageY;
  }
}

export class TouchEndEvent {
  // X (pageX) 座標
  x: number;
  // Y (pageY) 座標
  y: number;
  constructor(event: TouchEvent) {
    this.x = event.changedTouches[0].pageX;
    this.y = event.changedTouches[0].pageY;
  }
}
