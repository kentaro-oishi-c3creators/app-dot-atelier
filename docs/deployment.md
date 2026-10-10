# GitHub Pagesへの公開

## 初回

1. `kentaro-oishi-c3creators` に公開リポジトリ `dot-atelier` を作成する。
2. GitHub連携にそのリポジトリへの読み書き権限を付与する。
3. リポジトリへソースをpushする。
4. Settings → Pages → Build and deployment → Sourceを **GitHub Actions** にする。
5. Actionsで `Build and deploy GitHub Pages` の成功を確認する。
6. Pages設定に表示されたURLでアプリと `docs/guide.html` を確認する。

公開用ビルドは `npm ci && npm test && npm run build`。`dist/` にアプリと利用ガイドを出力。履歴、端末内作品、node_modules、認証情報はリポジトリに含めない。

## 更新

mainへのpushがテスト・ビルド・公開を開始する。必要ならActionsのRun workflowで再公開。ソースは公開される。APIキーなど秘密情報をコミットしない。

## 初回作成時の制約

2026-10-10、環境のGitHub認証でユーザー取得は成功したが、GraphQL createRepositoryとREST POST /user/reposは両方403「Resource not accessible by integration」。その接続だけでは新規リポジトリ作成不可。空リポジトリの作成・連携権限が整った後でpush・Pages設定を続行する。

接続済みの gh CLI で、空リポジトリ作成後に `bash scripts/publish-github.sh` を実行すると、テスト・ビルド・Pages設定・mainへのpushまで行います。Contentsの書き込み、workflowファイルの書き込み、Pages設定の権限が必要です。公開成功はActionsの成功とPages URLで確認してください。
