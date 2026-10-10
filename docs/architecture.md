# 構成とデータ形式

## 構成

React 19 / TypeScript / Vite / Canvas 2D / CSS。静的ファイルをGitHub Pagesで配信。サーバー、ログイン、データベースなし。

- `src/App.tsx`：道具、描画イベント、履歴、入出力、自動保存、編集UI
- `src/pixels.ts`：下絵、線の補間、塗りつぶし、編集データの検証
- `src/style.css`：PC・スマホのレイアウト
- `.github/workflows/pages.yml`：CIとPages公開
- `docs/`：仕様と利用資料

Pointer Eventsとpointer captureでマウス・指・ペンを同じ描画処理に統一。キャンバスのみ `touch-action: none` とし、周囲ではスクロール可能。速いストロークはBresenhamの線でマスを補間。ストローク終了時に1操作として履歴保存。塗りつぶしは4方向連結領域だけを反復処理し、行境界を越えない。

## データ

```json
{"version":1,"name":"作品名","size":32,"pixels":["","#80b6a0"]}
```

`pixels` は実際には `size × size` 件必要。左上から行方向に並ぶ。空文字は透明、他は `#rrggbb`。許容サイズは16、32、64。作品名は80文字以内。読み込みは1MB以内でサイズ・件数・色・版を検証。

localStorageキーは `dot-atelier-v1`。自動保存失敗は画面で通知。端末間移動はクラウドへの明示的保存・読み込み、または `.dot.json` ファイルを手動で保存・読み込みする。PNGにはレイヤーと編集履歴が含まれない。元に戻す履歴はメモリー内のみ。

## 公開・外部通信

描画データをサーバーへ送信しない。Google Fontsからフォントを読み込むが、読み込めない場合もシステムフォントで動作する。GitHub Pagesの通常アクセスログはホスティング側のもの。オフライン保証・PWAは未対応。

## AIへの引き継ぎ

src/Handoff.tsxは雛形・プロンプト・Markdown出力・JSON貼り付けを担当。src/handoff.tsで出力形式と貼り付けJSONを検証する。プロンプトの下書きはdot-atelier-handoff-v1に保存。AIへの自動送信はなく、利用者がコピーして外部のAIに渡す。返されたJSONは既存のvalidateProjectを通し、確認ダイアログ後にキャンバスへ反映する。コード囲み付きJSONも受け付ける。

## クラウド保存

`src/Cloud.tsx` はSupabase Authと作品一覧、`cloud/api/projects.ts` は本人確認と非公開JSONの操作、`src/Drive.tsx` はGoogle Identity ServicesとDrive REST APIを担当する。共有のJSON検証は `cloud/lib/project.ts`。フロントにはpublishable keyだけを含め、サービスキーはVercel環境変数に限定する。詳細は [cloud.md](cloud.md)。
