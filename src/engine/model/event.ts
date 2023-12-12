export class TouchStartEvent {
  pageX: number;
  pageY: number;
  constructor(event: TouchEvent) {
    this.pageX = event.changedTouches[0].pageX;
    this.pageY = event.changedTouches[0].pageY;
  }
}

export class TouchMoveEvent {
  pageX: number;
  pageY: number;
  constructor(event: TouchEvent) {
    this.pageX = event.changedTouches[0].pageX;
    this.pageY = event.changedTouches[0].pageY;
  }
}

export class TouchEndEvent {
  pageX: number;
  pageY: number;
  constructor(event: TouchEvent) {
    this.pageX = event.changedTouches[0].pageX;
    this.pageY = event.changedTouches[0].pageY;
  }
}
