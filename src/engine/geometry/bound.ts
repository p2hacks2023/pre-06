class Bound {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(
    bound_x: number,
    bound_y: number,
    bound_width: number,
    bound_height: number,
  ) {
    this.x = bound_x;
    this.y = bound_y;
    this.width = bound_width;
    this.height = bound_height;
  }

  includes(point_x: number, point_y: number) {
    return (
      point_x >= this.x &&
      point_x <= this.x + this.width &&
      point_y >= this.y &&
      point_y <= this.y + this.height
    );
  }

  animateTo(bound: Bound, invSpeed: number) {
    const speed = 1 - invSpeed;
    this.x = (this.x - bound.x) * speed + bound.x;
    this.y = (this.y - bound.y) * speed + bound.y;
    this.width = (this.width - bound.width) * speed + bound.width;
    this.height = (this.height - bound.height) * speed + bound.height;
  }
}

export default Bound;
