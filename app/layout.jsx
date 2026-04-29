import './globals.css'

export const metadata = {
  metadataBase: new URL('https://shikisai-learning.org'),
  title: '色彩学習',
  description: '色彩学習 — 慣用色名をフラッシュカード形式で覚える無料学習アプリ。色を見て名前を答えるクイズ形式で、マンセル値・系統色名・特徴も確認できます。',
  keywords: ['色彩学習', '色彩検定', '慣用色名', 'カラーフラッシュカード', '色名暗記', 'マンセル値', '色彩検定1級', '色彩検定2級', '色彩検定3級'],
  authors: [{ name: '色彩学習' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: '色彩学習',
    description: '慣用色名をフラッシュカード形式で効率よく学習。色を見て名前を答えるクイズ形式で、マンセル値・系統色名も確認できます。',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '色彩学習',
    description: '慣用色名をフラッシュカード形式で学習できる無料アプリ。',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#7c3aed" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5L9R20HDB4" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5L9R20HDB4');
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
