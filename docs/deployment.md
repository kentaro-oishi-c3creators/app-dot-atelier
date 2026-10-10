# GitHub Pagesへの公開

## 公開先と管理先

- リポジトリ： https://github.com/kentaro-oishi-c3creators/app-dot-atelier
- Pages： https://kentaro-oishi-c3creators.github.io/app-dot-atelier/
- 利用ガイド： https://kentaro-oishi-c3creators.github.io/app-dot-atelier/docs/guide.html

ソースとドキュメントの正本はこのリポジトリのmainとdocs/。Driveには企画・完成時点の資料を保存する。

## 初回設定

ユーザーがスマートフォンから公開リポジトリapp-dot-atelierを作成。初期READMEの履歴を維持してソースを登録。GitHubアプリにリポジトリへのアクセスを許可し、Settings → Pages → Build and deployment → SourceをGitHub Actionsへ変更する。

GitHubアプリの通常のソース書き込み権限だけではPagesサイトの初回作成が403になる場合がある。その場合はリポジトリ所有者が上記Pages設定を行う。設定後は失敗したActionsを再実行できる。

## 更新と再公開

mainへのpushが.github/workflows/pages.ymlでテスト・ビルド・公開を開始する。必要ならActionsのRun workflowで再公開する。

公開用ビルドはnpm ci、npm test、npm run build。dist/にアプリと利用ガイドを出力する。作品データ、認証情報、node_modulesはソース管理に含めない。

公開成功はActionsの成功とPages URLで確認する。端末内の作品データはデプロイに含まれず、localStorageに保存される。
クラウド保存APIの公開先と再デプロイ手順、Google・Supabaseの接続設定は [cloud.md](cloud.md) に記載。アプリのPages公開とバックエンドのVercel公開は別のデプロイとして管理する。
