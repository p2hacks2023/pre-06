import Bound from "../geometry/bound";
import { Component } from "./component";

const thermometer_base = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
  width="128"
  height="752"
  viewBox="0 0 33.86624 198.96416"
  version="1.1"
  id="svg5"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:svg="http://www.w3.org/2000/svg">
  <defs
    id="defs2" />
  <g
    id="layer1">
    <path
      id="path1733-11"
      style="fill:none;stroke:#767676;stroke-width:1.32292;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
      d="m 25.399997,156.63333 -16.9333304,-1e-5 v 0 m 16.9333304,-16.93333 -16.9333304,-1e-5 v 0 m 16.9333304,-16.93331 -16.9333304,-1e-5 v 0 m 16.9333304,-16.93332 -16.9333304,-1e-5 v 0 M 25.399997,88.9 l -16.9333304,-9e-6 v 0 M 25.399997,71.966669 8.4666666,71.96666 v 0 m 16.9333304,-16.933324 -16.9333304,-9e-6 v 0 m 16.9333304,-16.933324 -16.9333304,-9e-6 v 0 m 16.9333404,-16.933323 -16.9333394,-9e-6 v 0" />
    <path
      style="fill:#c32829;fill-opacity:1;stroke:none;stroke-width:2.64583;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:normal"
      id="path7226-0"
      transform="rotate(-45)"
      d="m -104.76967,140.69067 a 11.973672,11.973672 0 0 1 -7.39154,11.06223 11.973672,11.973672 0 0 1 -13.04879,-2.59556 11.973672,11.973672 0 0 1 -2.59557,-13.04879 11.973672,11.973672 0 0 1 11.06223,-7.39155 z" />
    <path
      id="path7226"
      style="fill:none;stroke:#2a2a2a;stroke-width:2.64583;stroke-linecap:round;stroke-linejoin:round"
      d="m 25.399994,173.56666 3e-6,-169.3333274 -16.9333304,7e-7 -10e-7,166.2503067 -2e-6,3.08302 c -3.4244466,3.42445 -4.4488647,8.57454 -2.595573,13.04879 1.853298,4.47426 6.2193344,7.39155 11.0622374,7.39155 4.842896,-1e-5 9.208935,-2.9173 11.062229,-7.39155 1.853295,-4.47426 0.828883,-9.62434 -2.595564,-13.04879 v 0" />
  </g>
</svg>`;

function blendColor(
  color1: [number, number, number],
  color2: [number, number, number],
  ratio: number,
): [number, number, number] {
  return [
    color1[0] * (1 - ratio) + color2[0] * ratio,
    color1[1] * (1 - ratio) + color2[1] * ratio,
    color1[2] * (1 - ratio) + color2[2] * ratio,
  ];
}

const ratio = 2;

class HotMeter implements Component {
  bound: Bound;
  percentage: number;
  goalPercentage: number;
  thermometer: HTMLImageElement;
  hotEffectThreshold: number;
  frame: number;

  constructor(
    x: number,
    y: number,
    percentage: number,
    hotEffectThreshold: number,
  ) {
    this.percentage = percentage;
    this.goalPercentage = percentage;
    this.bound = new Bound(x, y, 0, 0);
    this.thermometer = new Image();
    this.thermometer.src =
      "data:image/svg+xml;base64," + btoa(thermometer_base);
    this.hotEffectThreshold = hotEffectThreshold;
    this.frame = 0;
    this.thermometer.onload = () => {
      this.bound = new Bound(
        x,
        y,
        this.thermometer.width / ratio,
        this.thermometer.height / ratio,
      );
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    const defaultColor: [number, number, number] = [
      195 / 255,
      40 / 255,
      41 / 255,
    ];
    let color = defaultColor;
    let quakeX = 1.0,
      quakeY = 1.0;
    if (this.percentage > this.hotEffectThreshold) {
      color = blendColor(
        [1.0, 1.0, 1.0],
        defaultColor,
        Math.sin(this.frame * 0.3) * 0.3 + 0.7,
      );
      quakeX = Math.sin(this.frame * 5.0) * 0.01 + 1.0;
      quakeY = Math.random() * 0.01 + 1.0;
    }

    ctx.fillStyle = `rgb(${color[0] * 255}, ${color[1] * 255}, ${
      color[2] * 255
    })`;

    ctx.fillRect(
      this.bound.x + 32 / ratio,
      this.bound.y + 16 / ratio + ((100 - this.percentage) * 6.4) / ratio,
      64 / ratio,
      (this.percentage * 6.4) / ratio + 5,
    );
    ctx.drawImage(
      this.thermometer,
      this.bound.x * quakeX,
      this.bound.y * quakeY,
      this.bound.width,
      this.bound.height,
    );
    this.percentage =
      (this.percentage - this.goalPercentage) * 0.9 + this.goalPercentage;
    this.frame++;
  }

  updatePercentage(percentage: number) {
    this.goalPercentage = percentage;
  }
}

export default HotMeter;
