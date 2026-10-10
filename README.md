# DOT ATELIER / ドットアトリエ

画像編集がはじめてでも、下絵を選んで色を塗り、自分だけのキャラクター・アイコンを完成できるWebアプリ。

## できること

- 冒険者・ねこ・ハートの32×32下絵
- ペン、消しゴム、塗りつぶし、色を拾う道具、18色パレット、自由な色
- スマホのタッチ描画、1〜4倍拡大、マス目の表示切り替え
- 元に戻す・やり直す（最大80操作）
- 16×16 / 32×32 / 64×64 の新規キャンバス
- 原寸・4倍・16倍の透過PNG保存
- 作品のブラウザ内自動保存、JSON編集データの保存・読み込み

現在は手動編集と固定の下絵に対応。言葉からのAI画像生成、PNG読み込み、レイヤー、アニメーションは今後の拡張候補です。

## 開発

Node.js 24とnpmを使用。

```sh
npm ci
npm run dev
npm test
npm run build
```

`dist/` が公開用ファイル。秘密鍵・APIキー・バックエンドは不要。

## GitHub Pages

`.github/workflows/pages.yml` で main へのpushからテスト・ビルド・公開を行います。GitHubの Settings → Pages → Source を **GitHub Actions** に設定してください。

Viteの `base: './'` によりリポジトリ配下のPages URLに対応。ドキュメントは `docs/` を正本としてソースと一緒にGit管理し、`docs/guide.html` をPagesに同時公開します。Driveは今回の要件・設計判断・引き継ぎのスナップショット置き場です。

## ドキュメント

- [企画・会話の決定事項](docs/concept.md)
- [使い方](docs/guide.html)
- [構成・データ形式](docs/architecture.md)
- [公開手順](docs/deployment.md)
- [検証結果](docs/verification.md)

作品は端末とブラウザごとのlocalStorageに保存され、端末間では同期されません。バックアップや移動には編集データ保存を使ってください。作品データがGitHubに送られることはありません。

公開準備済みの空リポジトリへ登録する場合：`bash scripts/publish-github.sh`。Pagesの設定・workflow書き込み権限が必要です。
