# クラウド保存

フロントエンドはGitHub Pages、保存APIはVercelの `isiken-c3creators/app-dot-atelier-cloud`、ログインと非公開のJSON保存はVercel Marketplaceで作成したSupabaseを使う。

## 利用者の操作

- アプリの作品一覧：メール・パスワードで登録し、確認メールを承認してログイン。「クラウドに新しく保存」でスナップショットを保存。「開く」は確認後にキャンバスへ反映。「現在の作品で上書き」と「削除」には確認を表示。
- Google Drive：Googleの許可後、自分のDriveの `Dot Atelier` フォルダへ `.dot.json` を保存。新規保存・読み込み・上書き・ゴミ箱への移動に対応。アプリが作成したファイルを対象とする。
- 両方は独立。自動で二重保存しない。編集中の自動保存は従来の端末内localStorageを継続。

## 接続設定

`src/cloud-config.json` はSupabaseのURL・publishable key・API URL・Googleの公開クライアントIDだけを含む。秘密キーは含めない。バックエンドの秘密キーはVercelの環境変数で管理する。

Supabaseの **Authentication → URL Configuration** で、Site URLとRedirect URLsに次を設定する。確認メールとパスワード再設定の戻り先として必要。

`https://kentaro-oishi-c3creators.github.io/app-dot-atelier/`

Google側はDrive APIを有効にし、OAuth同意画面を外部・テストとして設定。テストユーザーに利用者のGoogleメールを追加する。スコープは `https://www.googleapis.com/auth/drive.file`。ウェブアプリ用OAuthクライアントの承認済みJavaScript生成元は `https://kentaro-oishi-c3creators.github.io`。ブラウザのトークン方式なのでリダイレクトURI・client secretは使用しない。公開クライアントIDを `googleClientId` に設定して再ビルドする。

Googleの認可トークンはメモリーにのみ保持。期限が切れたら再接続する。ChatGPTのDriveプラグイン接続はWebアプリの認可に使用できない。

## データ保護

`dot-atelier-projects` は非公開バケット。ブラウザからストレージへの直接アクセスを許可するポリシーは追加しない。保存APIはSupabase AuthでJWTから本人を確認し、`ユーザーID/作品UUID.json` に限定してサービスキーで操作する。ユーザーIDはクライアントから受け取らない。JSONの形式・作品ID・サイズを検証する。CORSはGitHub Pagesの生成元と検証用localhost:5174に限定。レスポンスはno-store。

Vercel側のDeployment Protectionは別の入口制限。一般利用者のアプリからAPIを呼ぶには本番APIを到達可能にする設定が必要。これは作品を公開する設定ではなく、作品のアクセスはAPIの本人確認で制限する。変更時はアカウント所有者の承認を得る。

## 再デプロイ

アプリはmainへのpushでGitHub ActionsがPagesへ公開。バックエンドは `cd cloud` → `vercel deploy --prod --scope isiken-c3creators`。VercelのGit接続は現在未接続のため、バックエンド変更はCLIで別途デプロイする。

`node --env-file=cloud/.env.local scripts/setup-cloud.mjs` は非公開バケットを準備し、公開設定のみを生成する（GoogleクライアントIDは空になるので、既存のIDがある場合は保持・再設定する）。検証環境でHTTPプロキシが必要ならNodeの `--use-env-proxy` を追加する。

`scripts/verify-cloud.mjs` は実サービスでログイン・保存・読み込み・上書き・削除・他人の作品へのアクセス拒否を検証する。一時ユーザーと一時作品はfinallyで削除し、メールは送信しない。

## 制約

アプリ保存は最大100件。Drive一覧は直近100件。共同編集や競合マージはなく、上書きは最後に保存した内容になる。Supabase標準メール送信には制限があるため、多人数利用時は独自SMTPの設定を検討する。無料枠を超える利用や有料プラン変更は別途確認する。
