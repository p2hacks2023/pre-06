/* tslint:disable */
/* eslint-disable */
/**
* Convert an image binary (Vec<u8>) to a base64 (String).
* You can choose to put an html data header (e.g., "data:image/jpeg;base64") or not.
* To put an html data header, put 'true' to the second parameter of the function.
* @param {Uint8Array} img
* @param {boolean} put_html_data_header
* @returns {string}
*/
export function img_to_base64(img: Uint8Array, put_html_data_header: boolean): string;
/**
* Convert a base64 string to an image binary (Vec<u8>).
* Both base64 that has an html data header and that doesn't are allowed.
* @param {string} data
* @returns {Uint8Array}
*/
export function base64_to_img(data: string): Uint8Array;
/**
* Evaluate the "hotness" of the image.
* For more details about the "Hotness", see https://github.com/p2hacks2023/pre-06/issues/7
* @param {string} img
* @returns {number}
*/
export function evaluate_hotness(img: string): number;
/**
* Extract "hot" object from the input.
* The output of this function is base64 encoded PNG image.
* @param {string} img
* @returns {string}
*/
export function extract_hot_buffer(img: string): string;
/**
* Mock of "evaluate_hotness()"
* Output is test_value. In other words, you can decide the exact return value for your debugging.
* For negative input, bigger input than 100.0, and other input that couldn't be parsed to f64, this function returns 0.0
* @param {string} test_value
* @returns {number}
*/
export function evaluate_hotness_mock(test_value: string): number;
/**
* Mock of "extract_hot_buffer()"
* Output the input as is.
* @param {string} img
* @returns {string}
*/
export function extract_hot_buffer_mock(img: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly img_to_base64: (a: number, b: number, c: number, d: number) => void;
  readonly base64_to_img: (a: number, b: number, c: number) => void;
  readonly evaluate_hotness: (a: number, b: number) => number;
  readonly extract_hot_buffer: (a: number, b: number, c: number) => void;
  readonly evaluate_hotness_mock: (a: number, b: number) => number;
  readonly extract_hot_buffer_mock: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
