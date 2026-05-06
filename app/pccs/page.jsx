'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const TONES = [
  { id: 'v',    name: 'ビビッド',           row: 3, col: 5, bg: 'hsl(350,96%,47%)',  light: true  },
  { id: 'b',    name: 'ブライト',            row: 1, col: 4, bg: 'hsl(350,76%,65%)',  light: false },
  { id: 's',    name: 'ストロング',          row: 3, col: 4, bg: 'hsl(350,70%,41%)',  light: true  },
  { id: 'dp',   name: 'ディープ',            row: 4, col: 4, bg: 'hsl(350,82%,29%)',  light: true  },
  { id: 'lt',   name: 'ライト',              row: 1, col: 3, bg: 'hsl(350,60%,74%)',  light: false },
  { id: 'sf',   name: 'ソフト',              row: 2, col: 3, bg: 'hsl(350,32%,60%)',  light: true  },
  { id: 'd',    name: 'ダル',                row: 3, col: 3, bg: 'hsl(350,25%,44%)',  light: true  },
  { id: 'dk',   name: 'ダーク',              row: 5, col: 3, bg: 'hsl(350,42%,25%)',  light: true  },
  { id: 'p',    name: 'ペール',              row: 1, col: 2, bg: 'hsl(350,42%,88%)',  light: false },
  { id: 'ltg',  name: 'ライトグレイッシュ', row: 2, col: 2, bg: 'hsl(350,18%,72%)',  light: false },
  { id: 'g',    name: 'グレイッシュ',        row: 3, col: 2, bg: 'hsl(350,14%,51%)',  light: true  },
  { id: 'dkg',  name: 'ダークグレイッシュ', row: 4, col: 2, bg: 'hsl(350,10%,33%)',  light: true  },
  { id: 'W',    name: 'ホワイト',            row: 1, col: 1, bg: '#f5f5f5',           light: false, gray: true },
  { id: 'ltGy', name: 'ライトグレー',       row: 2, col: 1, bg: 'hsl(0,0%,76%)',    light: false, gray: true },
  { id: 'mGy',  name: 'ミディアムグレー',  row: 3, col: 1, bg: 'hsl(0,0%,55%)',    light: false, gray: true },
  { id: 'dkGy', name: 'ダークグレー',       row: 4, col: 1, bg: 'hsl(0,0%,36%)',    light: true,  gray: true },
  { id: 'Bk',   name: 'ブラック',            row: 5, col: 1, bg: 'hsl(0,0%,10%)',    light: true,  gray: true },
]

const IMAGE_WORDS = [
  { id: 'romantic', label: 'ロマンチック', color: '#d45090', tones: ['p', 'lt'] },
  { id: 'feminine', label: 'フェミニン',   color: '#c870a0', tones: ['p', 'ltg'] },
  { id: 'yuragi',   label: 'やすらぎ',     color: '#a080c0', tones: ['p', 'ltg', 'sf'] },
  { id: 'natural',  label: 'ナチュラル',   color: '#80a860', tones: ['ltg', 'sf'] },
  { id: 'elegant',  label: 'エレガント',   color: '#806890', tones: ['sf', 'g', 'd'] },
  { id: 'classic',  label: 'クラシック',   color: '#704830', tones: ['d', 'dk', 'dkg'] },
  { id: 'formal',   label: 'フォーマル',   color: '#282830', tones: ['dk', 'dkg', 'Bk'] },
  { id: 'gorgeous', label: 'ゴージャス',   color: '#900030', tones: ['dp', 'v'] },
  { id: 'dynamic',  label: 'ダイナミック', color: '#c81818', tones: ['v', 's'] },
  { id: 'active',   label: 'アクティブ',   color: '#d84808', tones: ['v', 'b', 's'] },
  { id: 'casual',   label: 'カジュアル',   color: '#e07018', tones: ['b', 'lt'] },
  { id: 'clear',    label: 'クリア',       color: '#2898c8', tones: ['lt', 'b'] },
  { id: 'fresh',    label: 'フレッシュ',   color: '#20a848', tones: ['b', 'v'] },
]

export default function PccsPage() {
  const [selectedWord, setSelectedWord] = useState(null)

  const wordData    = IMAGE_WORDS.find(w => w.id === selectedWord)
  const activeTones = wordData?.tones ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">PCCSトーン概念図</h1>
            <p className="text-xs text-slate-500 mt-0.5">イメージワードを選ぶと対応するトーンをハイライト</p>
          </div>
          <Link href="/" className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors">← ホーム</Link>
        </div>

        {/* イメージワード選択 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">イメージワード</p>
          <div className="flex flex-wrap gap-2">
            {IMAGE_WORDS.map(word => {
              const isActive = selectedWord === word.id
              return (
                <button
                  key={word.id}
                  onClick={() => setSelectedWord(isActive ? null : word.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-md scale-105'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                  style={isActive ? { backgroundColor: word.color, borderColor: word.color } : {}}
                >
                  {word.label}
                </button>
              )
            })}
          </div>

          {wordData && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 items-center">
              <span className="text-xs text-slate-400">対応トーン：</span>
              {wordData.tones.map(tid => {
                const tone = TONES.find(t => t.id === tid)
                return (
                  <span key={tid} className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                    <span className="w-3 h-3 rounded-sm border border-slate-300 inline-block flex-shrink-0" style={{ backgroundColor: tone?.bg }} />
                    {tone?.name}
                    <span className="text-slate-400 font-normal">({tid})</span>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* トーン概念図 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">トーン概念図</p>

          <div className="flex items-stretch gap-2">
            {/* 縦軸ラベル */}
            <div className="flex flex-col justify-between items-center w-4 text-slate-400 py-1" style={{ fontSize: '10px' }}>
              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>高明度</span>
              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>低明度</span>
            </div>

            {/* グリッド */}
            <div
              className="flex-1"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(5, 1fr)',
                gap: '6px',
                minHeight: '300px',
              }}
            >
              {TONES.map(tone => {
                const isHighlighted = activeTones.includes(tone.id)
                const isDimmed      = activeTones.length > 0 && !isHighlighted
                return (
                  <div
                    key={tone.id}
                    style={{
                      gridRow:    tone.row,
                      gridColumn: tone.col,
                      backgroundColor: tone.bg,
                      opacity:   isDimmed ? 0.15 : 1,
                      boxShadow: isHighlighted ? `0 0 0 3px ${wordData?.color}, 0 4px 14px ${wordData?.color}55` : 'none',
                      transform: isHighlighted ? 'scale(1.07)' : 'scale(1)',
                      transition: 'opacity 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease',
                      zIndex: isHighlighted ? 10 : 1,
                    }}
                    className="rounded-lg flex flex-col items-center justify-center p-1 relative"
                  >
                    <span
                      className="font-bold leading-none"
                      style={{ fontSize: '11px', color: tone.light ? 'rgba(255,255,255,0.95)' : 'rgba(30,30,30,0.85)' }}
                    >
                      {tone.id}
                    </span>
                    <span
                      className="text-center leading-tight mt-0.5"
                      style={{ fontSize: '8px', color: tone.light ? 'rgba(255,255,255,0.7)' : 'rgba(50,50,50,0.6)' }}
                    >
                      {tone.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 横軸ラベル */}
          <div className="flex justify-between mt-2 pl-6 text-slate-400" style={{ fontSize: '10px' }}>
            <span>← 無彩色 / 低彩度</span>
            <span>高彩度 →</span>
          </div>
        </div>

      </div>
    </div>
  )
}
