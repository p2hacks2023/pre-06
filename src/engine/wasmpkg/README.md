<div align="center">
<h1><strong>Hot Finder</strong></h1>
</div>

## Acknowledgement

This package generated with [wasm-pack-template](https://github.com/rustwasm/wasm-pack-template)

## Document

`#[wasm_bindgen]`のせいで`rustdoc`が動かなかったので(多分なにか設定すれば動かせると思う)、詳細なドキュメントや実装はコードや関数の上のコードコメント(`///`で始まる行)を読んでください。

熱さについては、ここではなく、[「熱さ」ってなに？](https://github.com/p2hacks2023/pre-06/issues/7)を参考にしてください。

このライブラリは以下の関数を提供します。

### For release

```rust
fn evaluate_hotness(img: String) -> f64
```

- 画像を与えると、画像全体の熱さを返します
- 入力はPNG画像を想定しています
  - PNG以外が入力として与えられた場合は0を返します

```rust
fn extract_hot_buffer(img: String) -> String
```

- 画像を与えると、赤を多く含む部分を切り取って返します
  - このとき、赤をそこまで多く含まない部分は透過されます
  - 入力はPNGを想定しています
    - PNG以外が入力として与えられた場合は与えられた画像をそのまま返します

### For develop/debug

```rust
fn evaluate_hotness_mock(test_value: String) -> f64
```

- Mock用の関数です
- 欲しい値を文字列で入力するとその値が返ってきます
  - すなわち、wasmの繋ぎこみがテストできます
  - 不正な入力 (負の実数、100より大きな値、数値としてparseできない文字列) が与えられた場合は0を返します

```rust
fn extract_hot_buffer_mock(img: String) -> String
```

- Mock用の関数です
- 入力画像に関わらず、透過ピクセルを含む、あるstaticなbase64 PNG画像を返します
