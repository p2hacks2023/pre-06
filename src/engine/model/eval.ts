import { evaluate_hotness, extract_hot_buffer } from "../wasmpkg/hot_finder";

export function EvaluateHotness(image: string) {
  return Math.sqrt(evaluate_hotness(image) / 100) * 100;
}

export function ExtractHotBuffer(image: string) {
  return extract_hot_buffer(image);
}
