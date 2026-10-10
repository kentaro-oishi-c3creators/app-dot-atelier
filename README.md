# DOT ATELIER / ドットアトリエ

ドット絵を作成します。画像編集がはじめてでも、下絵を選んで色を塗り、自分だけのキャラクター・アイコンを完成できるWebアプリです。

[アプリを開く](https://kentaro-oishi-c3creators.github.io/app-dot-atelier/) · [使い方](https://kentaro-oishi-c3creators.github.io/app-dot-atelier/docs/guide.html)

## できること

- 冒険者・ねこ・ハートの32×32下絵
- ペン、消しゴム、塗りつぶし、色を拾う道具、18色パレット、自由な色
- スマホのタッチ描画、1〜4倍拡大、マス目の表示切り替え
- 元に戻す・やり直す（最大80操作）
- 16×16 / 32×32 / 64×64 の新規キャンバス
- 原寸・4倍・16倍の透過PNG保存
- 作品のブラウザ内自動保存、JSON編集データの保存・読み込み
- JSON雛形の表示・コピー・出力、AIプロンプトの作成・編集・コピー
- AIのJSONを貼り付けて読み込み、プロンプトとJSONのMarkdown出力

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

編集途中の自動保存は端末とブラウザごとのlocalStorageに保存されます。明示的にクラウドへ保存した作品は、同じアカウントから別端末でも開けます。JSONファイルでのバックアップも可能です。作品データがGitHubに送られることはありません。

クラウドはSupabaseの非公開ストレージ＋Vercel API、DriveはGoogle OAuth＋Drive APIです。接続設定と公開条件は [docs/cloud.md](docs/cloud.md) を参照してください。

公開準備済みのリポジトリへ登録する場合：`bash scripts/publish-github.sh`。Pagesの設定・workflow書き込み権限が必要です。
