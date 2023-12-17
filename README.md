# P2HACKS2023 アピールシート 

<div align="center">

<img alt="この世界は熱過ぎる!!!" src="https://github.com/p2hacks2023/pre-06/assets/69315285/e675a453-36b6-4bd4-a4c8-74801b25377e" width="100%"></img>

</div>

### プロダクト名

この世界は熱すぎる!!!

### コンセプト

この世界を、僕らの力でもう少し **ひんやり** とさせてみませんか？

### 対象ユーザ

ひんやりしたい人・熱いものを破壊したい人

### 利用の流れ  

1. 熱いものを身の回りから探そう！赤色が多いものほど熱いぞ！
1. 熱いものを画面に収めてボタンを押せ！
1. 熱いものを砕いて**ひんやり**させろ！

### 推しポイント  

熱いものを破壊して、世界をひんやりさせる爽快なゲームに仕上がりました。
熱いものを探す際に、ゲーム画面が、熱いもの探しをアツく盛り上げてくれます。

### スクリーンショット

<img alt="sc1" src="https://github.com/p2hacks2023/pre-06/assets/69315285/82ace60e-df42-42b7-8860-3e5e2f85418c" width="25%"></img>
<img alt="sc2" src="https://github.com/p2hacks2023/pre-06/assets/69315285/d77446c0-d8a2-4c64-8993-6315ef9ef148" width="25%"></img>
<img alt="sc3" src="https://github.com/p2hacks2023/pre-06/assets/69315285/23f789bd-8ec4-48b7-bfa9-3862f22c896f" width="25%"></img>

## 開発体制  

### 役割分担  
| 人 | 役割 |
| - | - |
| 寸田 | Webページ作成・インフラセットアップ |
| 多田 | 素材・ゲーム描画ロジック作成 |
| 山﨑 | Rust Wasm による画像処理 |


### 開発における工夫した点 

迅速な動作確認のために、CloudFlare Pagesのプレビュー機能を活用した。
Cloudflare Pagesは、commitのたびにPreview buildをし、Pull Requestが発行されていると、該当PRにプレビューリンクを貼り付けてくれる。
このPreview Buildを利用して、多彩なデバイスでの表示のテストや、変更内容の確認をおこなった。

また、スマホでのデバッグに、USBデバッグを活用した。
スマホとパソコンをUSBケーブルにより接続し、開発者ツールを確認したり、ポートフォワーディング機能でローカルでのビルド結果を確認したりした。

Rust Wasm の動作確認のためにテストを実施した。
wasm pack のテストや、cargo testを利用して、JavaScript側と繋ぎこむ前の動作確認を行った。

HTML Canvasは、基本的に描画機能のみを提供するので、共同開発に向かない。
また、ゲームのシーンごとに必要なコンポーネントが変化するため、シーン管理とコンポーネントの出し分けの適切な管理が必要となる。
これらの問題点を解消するため、共同開発にも対応する独自のフレームワークを作成した。
詳細は[`src/README.md`](/src/README.md)を参照。

開発中の情報共有のために、カジュアルに発言できる timesチャンネルを各メンバごとに作成した。
開発の進捗や思ったことを気軽に書き込むことで、問題をすぐに共有したり、自分の状況を報告したりすることができた。

## 開発技術 

### 利用したプログラミング言語  

- HTML Living Standard
- JavaScript
- TypeScript
- Rust

### 利用したフレームワーク・ライブラリ

- [Vite](https://vitejs.dev/)
- [HTML Canvas](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [Prettier](https://prettier.io/)

### その他開発に使用したツール・サービス
- Cloudflare Pages
  - Hosting 機能
  - DevOps 機能
- GitHub
  - バージョン管理
  - タスク管理

