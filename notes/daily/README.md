# daily/

Claude が毎日21:07に走らせるダイジェスト置き場。1日1ファイル `YYYY-MM-DD.md`。

## Routine が毎日やること

1. `inbox` ラベルの open な GitHub Issue を全部読む
2. その日 `pushed_at` が更新された全リポジトリの直近commitを拾う
3. 以下の構成で `daily/YYYY-MM-DD.md` を作る:
   - **今日の inbox**: Issue の中身を種別ごとに整理
   - **今日動いた手**: リポジトリ別 commit 一覧＋一言解釈
   - **拾った違和感**: `#違和感` タグの Issue と、commit メッセージから抽出した違和感
   - **明日の問い1つ**: 今日の内容から Claude が推薦する1問
4. 処理済み Issue にコメントを追記して close 提案（クローズは手動で）
5. push を完了させたらメール通知

## 手動で走らせたい時

「今日の分を吸い上げて」と Claude に頼めば、この Routine の内容を即実行できる。
