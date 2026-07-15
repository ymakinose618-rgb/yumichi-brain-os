# CLAUDE.md — ymakinose618-rgb 全リポ共通の正典

このファイルは、`ymakinose618-rgb` アカウント配下 全リポで動く Claude Code の**運用ルールの正典**。
各リポの `CLAUDE.md` はこのファイルを参照するポインタ + リポ別1行メモだけ。

## 1. 上位ルール（すべての作業に適用）

由美さんの user global CLAUDE.md（`C:\Users\y.makinose\.claude\CLAUDE.md`）が最上位ルール。
「着手前に見る／小さく確実に進める／完了前に自分の成果物を疑う／結論を最初に書く／最小構成から始める／危険な操作は立ち止まる／途中で止まらない」の7項を必ず守る。

Claude Code のメモリ（`C:\Users\y.makinose\.claude\projects\C--Users-y-makinose\memory\`）に **【ルール】** 系のエントリがある。作業前に該当ルールを必ず確認する。特に GAS 関連：

- `feedback-start-minimal` — 新規ツールは最小構成から。Claude API/日次バッチ/管理画面分離は初回に組み込まない
- `feedback-yumi-direct-excel-edit` — 由美さんはExcel/スプシを直接編集する。新版作成前に最新版確認、構造変更は末尾追加
- `feedback-register-gas-tools` — 新GASツールを作ったら毎回カタログ登録
- `feedback-parallel-chats-appsscript` — 並行チャット時は clasp push 直前に appsscript.json の oauthScopes を再確認
- `feedback-clasp-create-overwrites-appsscript` — clasp create 直後は timeZone/oauthScopes 全消え、必ず復元
- `feedback-gas-scope-reauth` — oauthScope 追加時は再承認必須（自動発火しない）
- `feedback-gas-setproperties-trap` — `setProperties(obj, true)` は他キー全削除。第2引数なしで呼ぶ
- `feedback-gas-deployment-moved` — 「移動済み」ラベルのURLは死んでる、新規deploy＋ScriptProperty更新必須
- `feedback-gas-deploy-update-existing` — `clasp deploy -i <既存ID>` で更新（新規発行しない）
- `feedback-font-yu-gothic-medium` — 紙配布物のフォントは Yu Gothic Medium
- `feedback-asagi-character-call` — `@キャラ名` で asagi-{name} subagent を Agent ツールで起動

## 2. リポ一覧と一行メモ

思考系
- **yumichi-brain-os** (public) — 思考構造3D可視化 + notes/書き溜め + 日次21:07 Actions
- **ai-agent-company** — Cloudflare Workers, 10エージェント LINE Bot, Firestore
- **ai-agent-office-3d** — AIエージェント会社の3Dオフィス可視化
- **ai-agent-local-runner** — AIエージェント会社のローカル常駐runner
- **yumichishisyo** — （用途要確認）

業務系（GAS）
- **katae-yugai-hyo** — 片江店 油外実績、clasp bind、日次入力
- **yugai-kanri** — 油外管理（bind版）、standaloneと二重管理中
- **kikaku-suishin-os** — 巨大GAS、企画推進課の統合OS
- **kikaku-os-web** — Firebase Hosting + Firestore、GASで重い機能を逃した先
- **weekly-mtg-tool** — clasp、週次MTG。executeAs:USER_ACCESSING切替が未対応
- **shift-kanri-tool** — 企画部3名シフト、手動同期ボタン方式
- **kankyoseibi-check** — 環境整備チェック、Admin/Index分離
- **cs-line-delivery-tool** — 3店舗LINE配信の管理
- **hosaka-routine-gas** / **hosaka-routine** — GAS版とPWA版が並存

集客系
- **next-jonan-blog-tool** — ネクスト城南ブログのGAS版
- **nousha-blog-tool** — 納車ブログ専用、AI排除・パターン選択方式・WP REST
- **carcontool** — Windows/Mac対応、Playwright、`system/` は触らない厳守
- **instagram-reels-report** — 直近14日リールのHook Score診断タグ

暮らし系
- **kakei-viewer** — 個人家計ビューア（by japcat18連携）

## 3. 日次 21:07 Routine

`.github/workflows/daily-digest.yml`（yumichi-brain-os 内、cron `7 12 * * *` UTC = JST 21:07）が毎日実行。

やること:
1. `inbox` ラベルの open な Issue を全部読む（yumichi-brain-os 内）
2. その日 `pushed_at` が更新された ymakinose618-rgb 配下 全リポの直近commitを拾う
3. `notes/daily/YYYY-MM-DD.md` を生成
4. push（Actions通知でメールも自動で届く）

手動trigger も `workflow_dispatch` で可能。実装詳細は yumichi-brain-os/notes/daily/README.md 参照。

## 4. inbox の書き方

スマホから GitHub Issue（`ymakinose618-rgb/yumichi-brain-os` の「📥 inbox（即書き）」テンプレ）で書く。
1タップで開けるように iOS ショートカット化推奨。LINE経由でのinbox化は今回は実装しない（ai-agent-company は議論・振り返り・「由美の脳」の用途に限定）。
