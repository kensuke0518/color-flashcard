import './globals.css'

export const metadata = {
  title: '色彩検定 カラーフラッシュカード',
  description: '色彩検定の色を学習するフラッシュカードアプリ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
