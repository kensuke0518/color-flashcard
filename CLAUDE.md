# CLAUDE.md — カラーフラッシュカード 開発ガイド

## プロジェクト概要

色彩検定の慣用色名を学習するフラッシュカードアプリ。

- **本番URL**: https://shikisai-learning.pages.dev（独自ドメイン取得後に更新予定）
- **スタック**: Next.js 15 App Router / 静的エクスポート / Tailwind CSS v4 / Cloudflare Pages
- **Google Analytics**: G-5L9R20HDB4

## ファイル構成

```
app/
  layout.jsx       # SEO metadata + Google Analytics（直接 <script> タグで記述）
  page.jsx         # / → /quiz/ へリダイレクト
  quiz/
    page.jsx       # メインアプリ（全画面・全ロジック）
  globals.css      # グローバルスタイル
src/
  colors.json      # 色データ（id / name / colorcode / colorgroup / keito / munsell / feature）
docs/
  gtag.md          # Google Analytics タグ（参照用）
PROGRESS.md        # 実装済み機能の詳細記録
```

## よく使うコマンド

```bash
npm run build          # Next.js 静的ビルド → out/ を生成
npm run deploy:pages   # Cloudflare Pages へデプロイ（out/ をアップロード）
git push origin main   # GitHub へプッシュ
```

通常の作業フロー（変更 → ビルド確認 → デプロイ → コミット＆プッシュ）：

```bash
npm run build && npm run deploy:pages && git add <files> && git commit -m "..." && git push origin main
```

## コーディング規約

- **コメントは書かない**。書く場合は「なぜ」が非自明な箇所のみ、日本語で1行
- **ファイルを新規作成しない**。既存ファイルを編集することを優先する
- **不要な抽象化・リファクタリングをしない**。タスクに必要な最小限の変更のみ行う
- **エラーハンドリングを過剰に追加しない**。起きえないケースのバリデーションは不要

## Git ルール

- **コミット前に必ずユーザーに確認する**（明示的に「コミットして」と言われた場合のみ実行）
- `git push --force` は絶対に使わない
- `--no-verify` でフックをスキップしない
- コミットメッセージは日本語で簡潔に

## デプロイ注意事項

- デプロイは `out/` ディレクトリの静的ファイルを Cloudflare Pages へアップロードする
- `npm run build` でエラーが出た場合はデプロイしない
- `next/script` は静的エクスポートで script タグが HTML に直接出力されないため使用しない。代わりに `<script dangerouslySetInnerHTML>` を使う

## やってはいけないこと

- `app/quiz/page.jsx` 以外に新しいページファイルを作成しない（現状は単一ページアプリ）
- `src/colors.json` のデータ構造（フィールド名）を変更しない
- `output: 'export'` の設定を外さない（Cloudflare Pages は SSR 非対応）
- Google Analytics の測定ID（G-5L9R20HDB4）を無断で変更しない
