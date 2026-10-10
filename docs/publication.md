# DOT ATELIER：公開完了

日付：2026-10-10（日本時間）

- アプリ： https://kentaro-oishi-c3creators.github.io/app-dot-atelier/
- 使い方： https://kentaro-oishi-c3creators.github.io/app-dot-atelier/docs/guide.html
- ソースとドキュメント： https://github.com/kentaro-oishi-c3creators/app-dot-atelier
- 公開成功のActions： https://github.com/kentaro-oishi-c3creators/app-dot-atelier/actions/runs/38020511453

React・TypeScript・Vite製のキャラクター/アイコン編集アプリ。ペン、消しゴム、塗りつぶし、色を拾う道具、取り消し、拡大、透過PNG保存、編集データ保存/読み込み、端末内自動保存に対応する。

PCとスマホ相当のChromiumで主要な編集と保存を確認済み。初回公開はGitHub Actionsのテスト・ビルド・デプロイが成功し、公開アプリ・利用ガイド・JS/CSSのHTTP 200を確認。実機スマートフォンでの保存挙動は利用端末ごとに確認する。

今後はGitHubのmainとdocs/を正本として更新する。mainへのpushからGitHub Actionsが自動でビルド・公開する。Driveにある初期資料/ZIPは作成時点のスナップショットで、最新ソースはGitHubを参照する。

作品はブラウザのlocalStorageに保存。別端末へ移す場合は編集データを保存して読み込む。AI画像生成・PNG読み込み・レイヤー・アニメーションは拡張候補。
