# 色彩学習 - 開発進捗記録

## プロジェクト概要

- **アプリ名**: 色彩学習（色彩検定 カラーフラッシュカード）
- **URL**: https://shikisai-learning.pages.dev
- **リポジトリ**: https://github.com/kensuke0518/shikisai-learning
- **スタック**: Next.js 15 (App Router, 静的エクスポート) + Tailwind CSS v4 + Cloudflare Pages
- **Google Analytics**: G-5L9R20HDB4

---

## 実装済み機能

### SEO / アナリティクス

- `app/layout.jsx` に Next.js metadata API で SEO タグを設定
  - title: 「色彩学習」
  - description / keywords / robots / author / theme-color
  - Open Graph (og:title, og:description, og:locale, og:type)
  - Twitter Card (summary)
- `next/script` で Google Analytics (gtag.js) を追加
  - 測定ID: `G-5L9R20HDB4`（当初 G-EP7DGH5RY3 → 更新済み）
- `html lang="ja"` 設定済み

### データ

- `src/colors.json`: 色彩検定の慣用色名データ
  - フィールド: `id`, `name`, `colorcode`, `colorgroup`, `keito`, `munsell`, `feature`
- 色グループ名を英語から日本語（〜系）に変更
  - Red→赤系 / Orange→オレンジ系 / Yellow→黄系 / Green→緑系 / Blue→青系
  - Purple→紫系 / Pink→ピンク系 / Brown→茶系 / Grey→灰系 / White→白系

### クイズ機能

#### モード（ホーム画面タブで切替）

| モード | 内容 |
|--------|------|
| 色名解答 | 色パッチを見て○/×で自己採点するフラッシュカード |
| 四択解答 | 色パッチを見て4択から色名を選ぶ |
| 説明から解答 | `feature` テキストを読んで4択から色名を選ぶ |

#### 設定（ホーム画面）

- **出題数**: 10問 / 20問 / 全問
- **解答時間**: 無限 / 5秒 / 10秒 / 20秒 / カスタム（数値入力）
- **色グループ**: すべて / 各グループ単体

#### タイマー

- クイズ画面上部に横線バーでカウントダウン表示（緑→オレンジ→赤）
- 時間切れ時の動作:
  - **色名解答**: 答えを自動表示 + `⏰ 時間切れ` ラベル。○/× ボタンは有効のまま（自分で判定）
  - **四択 / 説明から解答**: `⏰ 時間切れ！— 正解は「〇〇」` を表示。「次の問題へ」で進む（×記録）

#### 結果・ランキング画面（3タブ）

| タブ | 内容 |
|------|------|
| 今回の結果 | 直近クイズの全問正誤一覧 |
| 総合ワースト | localStorage の全履歴から間違いが多い色 TOP20 |
| グループ別ワースト | グループごとの間違いTOP10 |

- **色詳細モーダル**: 総合ワースト・グループ別の各行をクリックするとモーダルを表示
  - 内容: カラーチップ（大）・色名・グループ・系統色名・マンセル値・説明
  - 背景クリックまたは × で閉じる

### UI / UX

- **ダークモード**: 全画面対応。☀️/🌙 ボタンで切替、`localStorage` で設定を永続化
- 学習履歴クリア機能（localStorage の `result:*` キーを一括削除）

---

## ファイル構成（主要）

```
/
├── app/
│   ├── layout.jsx        # SEO metadata + Google Analytics
│   ├── page.jsx          # / → /quiz/ へリダイレクト
│   └── quiz/
│       └── page.jsx      # メインアプリ（全画面・全ロジック）
├── src/
│   └── colors.json       # 色データ
├── docs/
│   └── gtag.md           # Google Analytics タグ（参照用）
├── next.config.mjs       # output: 'export'（静的エクスポート）
├── wrangler.jsonc         # Cloudflare Workers 設定
└── PROGRESS.md           # 本ファイル
```

---

## デプロイ

```bash
npm run build          # Next.js 静的ビルド → out/ を生成
npm run deploy:pages   # Cloudflare Pages へデプロイ
git push origin main   # GitHub へプッシュ
```

---

## コミット履歴（本セッション以降）

| コミット | 内容 |
|----------|------|
| `ddc3d8a` | ランキングの色行をクリックで詳細モーダルを表示 |
| `9760ef0` | 色名解答: 時間切れでも○×を自分で選べるよう変更 |
| `978431a` | タイマーUIと時間切れ動作を改善（横線バー化） |
| `8e98679` | 解答タイマー機能を追加 |
| `dc635bc` | 「説明から解答」モードを追加 |
| `da58ee4` | 四択解答モード・ダークモードを追加 |
| `8c581ab` | 色グループ名を英語から日本語（〜系）に変更 |
| `ab92f03` | app/layout.jsx: SEO対策とGoogle Analyticsを追加 |
| `21b5031` | SEO対策とGoogle Analyticsタグを更新 |
