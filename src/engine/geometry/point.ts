class Point {
    x: number;
    y: number;
  
    constructor(x?: number, y?: number) {
      this.x = x || 0;
      this.y = y || 0;
    }
  
    sub(point: Point) {
      return new Point(this.x - point.x, this.y - point.y);
    }
  
    squaredDistance(point: Point) {
      return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
    }

    distance(point: Point) {
        return Math.sqrt(this.squaredDistance(point));
    }

    lerp(point: Point, t: number) {
        return new Point(this.x * (1 - t) + point.x * t, this.y * (1 - t) + point.y * t);
    }
}

export default Point;