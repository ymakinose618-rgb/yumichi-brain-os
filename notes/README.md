# notes/ — 書き溜めレイヤー

3D UI とは別に、テキストで書き溜める場所。

## 構造

```
notes/
├── README.md              このファイル
├── inbox/                 毎日の即書き（1日1ファイル: YYYY-MM-DD.md）
├── analysis/              思考分析レポート（YYYY-MM-DD-<title>.md）
├── tools-catalog/         作ってきたツールの棚卸し
└── daily/                 Claude が毎日書き込むダイジェスト
```

## 使い分け

| フォルダ | 誰が書く | 頻度 | 目的 |
|---|---|---|---|
| `inbox/` | 自分（スマホ） | 毎日 | 生の観察・違和感・アイデアを摩擦ゼロで放り込む |
| `daily/` | Claude | 毎日 | inbox + その日更新した全リポジトリの拾い上げ |
| `analysis/` | Claude（依頼時） | 不定期 | 溜まったログから思考パターンを分析 |
| `tools-catalog/` | Claude（更新時） | 月次 | 作ったツールを棚卸し、動機を再言語化 |

## 3D UI との関係

- **書く**: notes/inbox に即書き（軽い）
- **観る**: 3D UI（週次）
- 週次の Routine で notes → 3D の DEFAULT_FOLDERS / EDGES / 観察カードに反映する（将来）

## 判断フレーム

作る/待つ/作らないの判断は `analysis/2026-07-15-first-analysis.md` §4 を参照。
