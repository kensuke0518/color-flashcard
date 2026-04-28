'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import colorsData from '../../src/colors.json'

export default function ColorFlashcard() {
  const colors = colorsData

  const [darkMode,      setDarkMode]      = useState(false)
  const [quizType,      setQuizType]      = useState('flashcard') // 'flashcard' | 'choice' | 'description'
  const [gameState,     setGameState]     = useState('home')      // 'home' | 'quiz' | 'result'
  const [quizMode,      setQuizMode]      = useState(10)
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [questionOrder, setQuestionOrder] = useState([])
  const [currentIndex,  setCurrentIndex]  = useState(0)
  const [showAnswer,    setShowAnswer]    = useState(false)
  const [results,       setResults]       = useState([])
  const [rankingTab,    setRankingTab]    = useState('current')
  // 四択 / 説明
  const [choiceOptions,       setChoiceOptions]       = useState([])
  const [selectedChoice,      setSelectedChoice]      = useState(null) // null=未選択, -1=時間切れ, id=選択済
  const [isAnswered,          setIsAnswered]           = useState(false)
  const [flashcardTimedOut,   setFlashcardTimedOut]   = useState(false)
  // モーダル
  const [modalColor,          setModalColor]          = useState(null)
  // タイマー設定
  const [timerSetting,   setTimerSetting]   = useState(0)    // 0=無限, 5|10|20|'custom'
  const [customTimerVal, setCustomTimerVal] = useState('15')
  const [timeLeft,       setTimeLeft]       = useState(null)

  const timerRef = useRef(null)

  // タイマー有効秒数
  const effectiveSecs = timerSetting === 'custom'
    ? Math.max(1, parseInt(customTimerVal) || 10)
    : timerSetting

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const startCountdown = (secs) => {
    clearTimer()
    if (!secs) { setTimeLeft(null); return }
    setTimeLeft(secs)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ダークモード復元
  useEffect(() => {
    try { if (localStorage.getItem('darkMode') === 'true') setDarkMode(true) } catch {}
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev
      try { localStorage.setItem('darkMode', String(next)) } catch {}
      return next
    })
  }

  // 問題が変わったらタイマーをリスタート
  useEffect(() => {
    if (gameState !== 'quiz') return
    startCountdown(effectiveSecs)
    return clearTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, gameState])

  // フラッシュカード: 回答を見たらタイマー停止
  useEffect(() => {
    if (showAnswer) clearTimer()
  }, [showAnswer])

  // 四択/説明: 選択済みになったらタイマー停止
  useEffect(() => {
    if (isAnswered) clearTimer()
  }, [isAnswered])

  // 時間切れ処理
  useEffect(() => {
    if (timeLeft !== 0 || !effectiveSecs || gameState !== 'quiz') return
    const q = questionOrder[currentIndex]
    if (!q) return

    if (quizType === 'flashcard') {
      if (!showAnswer) {
        setShowAnswer(true)
        setFlashcardTimedOut(true)
      }
    } else {
      if (!isAnswered) {
        const result = { id: q.id, answer: q.name, userAnswer: '×', timestamp: new Date().toISOString() }
        setResults(prev => [...prev, result])
        try { localStorage.setItem(`result:${Date.now()}_${q.id}`, JSON.stringify(result)) } catch {}
        setSelectedChoice(-1) // -1 = 時間切れ
        setIsAnswered(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const colorGroups = useMemo(() => {
    const groups = new Set(colors.map(c => c.colorgroup))
    return ['all', ...Array.from(groups).sort()]
  }, [colors])

  // --- Theme ---
  const dm = darkMode
  const t = {
    screenBg:     dm ? 'bg-gray-900'     : 'bg-gradient-to-br from-purple-50 to-blue-50',
    cardBg:       dm ? 'bg-gray-800'     : 'bg-white',
    cardBorder:   dm ? 'border-gray-700' : 'border-gray-200',
    textPrimary:  dm ? 'text-white'      : 'text-gray-900',
    textSecondary:dm ? 'text-gray-300'   : 'text-gray-500',
    textMuted:    dm ? 'text-gray-500'   : 'text-gray-400',
    tabBg:        dm ? 'bg-gray-700'     : 'bg-gray-100',
    tabActive:    dm ? 'bg-gray-500 text-white shadow' : 'bg-white text-purple-700 shadow-sm',
    tabInactive:  dm ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700',
    rowBg:        dm ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200',
    rowHover:     dm ? 'hover:bg-gray-600' : 'hover:bg-gray-100',
    sectionBg:    dm ? 'bg-gray-700'     : 'bg-blue-50',
    sectionTitle: dm ? 'text-blue-300'   : 'text-blue-800',
    sectionValue: dm ? 'text-white'      : 'text-blue-900',
    sectionSub:   dm ? 'text-blue-200'   : 'text-blue-700',
    answerBg:     dm ? 'bg-gray-700 border-gray-500' : 'bg-purple-50 border-purple-200',
    answerTitle:  dm ? 'text-white'      : 'text-purple-900',
    answerLabel:  dm ? 'text-gray-300'   : 'text-gray-700',
    answerValue:  dm ? 'text-gray-300'   : 'text-gray-600',
    answerBorder: dm ? 'border-gray-600' : 'border-purple-100',
    progressBg:   dm ? 'bg-gray-600'     : 'bg-gray-200',
    groupHeader:  dm ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
    groupSubText: dm ? 'text-purple-300' : 'text-purple-600',
    btnSecondary: dm ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    btnClear:     dm ? 'text-gray-600 hover:text-red-400' : 'text-gray-400 hover:text-red-500',
    inputBorder:  dm ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800',
    groupBtn: (active) => active
      ? dm ? 'bg-purple-800 border-purple-500 text-purple-200' : 'bg-purple-100 border-purple-500 text-purple-700'
      : dm ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
    choiceBtn: (state) => {
      if (state === 'correct') return 'bg-green-600 border-green-500 text-white'
      if (state === 'wrong')   return 'bg-red-600 border-red-500 text-white'
      if (state === 'dim')     return dm
        ? 'bg-gray-700 border-gray-600 text-gray-600 opacity-40'
        : 'bg-gray-100 border-gray-200 text-gray-400 opacity-40'
      return dm
        ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-purple-900 hover:border-purple-500'
        : 'bg-white border-gray-200 text-gray-800 hover:bg-purple-50 hover:border-purple-400'
    },
  }

  // --- 横線タイマーバー ---
  const TimerBar = () => {
    if (!effectiveSecs || timeLeft === null) return null
    const pct = Math.max(0, timeLeft / effectiveSecs) * 100
    const color = pct > 50 ? '#22c55e' : pct > 20 ? '#f97316' : '#ef4444'
    return (
      <div className="mb-3">
        <div className={`relative h-2 rounded-full overflow-hidden ${dm ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 0.8s linear, background-color 0.5s ease' }}
          />
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-xs font-bold tabular-nums" style={{ color }}>{timeLeft}秒</span>
        </div>
      </div>
    )
  }

  // --- 色詳細モーダル ---
  const ColorModal = () => {
    if (!modalColor) return null
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        onClick={() => setModalColor(null)}
      >
        <div
          className={`${t.cardBg} rounded-2xl shadow-2xl w-full max-w-sm p-6 relative`}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setModalColor(null)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
              dm ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            ×
          </button>

          <div className="w-full h-36 rounded-xl shadow-lg mb-5" style={{ backgroundColor: modalColor.colorcode }} />

          <h3 className={`text-2xl font-bold text-center mb-4 ${t.answerTitle}`}>{modalColor.name}</h3>

          <div className="space-y-1 text-sm">
            {[
              { label: 'グループ',   value: modalColor.colorgroup },
              { label: '系統色名',   value: modalColor.keito },
              { label: 'マンセル値', value: modalColor.munsell },
            ].map(row => (
              <div key={row.label} className={`flex border-b ${t.answerBorder} py-1.5`}>
                <span className={`font-semibold w-24 flex-shrink-0 ${t.answerLabel}`}>{row.label}</span>
                <span className={t.answerValue}>{row.value}</span>
              </div>
            ))}
            <div className="pt-2">
              <p className={`leading-relaxed text-sm ${t.answerValue}`}>{modalColor.feature}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- ダークモードボタン ---
  const DarkToggle = () => (
    <button
      onClick={toggleDarkMode}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
        dm ? 'bg-gray-600 hover:bg-gray-500 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
      }`}
      aria-label="ダークモード切替"
    >
      {dm ? '☀️' : '🌙'}
    </button>
  )

  // --- Statistics ---
  const getStatistics = () => {
    const stats = {}
    try {
      Object.keys(localStorage).filter(k => k.startsWith('result:')).forEach(k => {
        const d = JSON.parse(localStorage.getItem(k))
        if (!stats[d.id]) {
          const info = colors.find(c => c.id === d.id)
          stats[d.id] = { id: d.id, name: d.answer, group: info?.colorgroup ?? 'Unknown', correct: 0, incorrect: 0, total: 0 }
        }
        stats[d.id].total++
        if (d.userAnswer === '○') stats[d.id].correct++; else stats[d.id].incorrect++
      })
    } catch {}
    return Object.values(stats)
  }

  const getMistakeRanking = () =>
    getStatistics().filter(s => s.incorrect > 0)
      .sort((a, b) => b.incorrect !== a.incorrect ? b.incorrect - a.incorrect : (a.correct / a.total) - (b.correct / b.total))

  const getGroupMistakeRanking = () => {
    const gr = {}
    getStatistics().forEach(s => {
      if (s.incorrect === 0) return
      if (!gr[s.group]) gr[s.group] = []
      gr[s.group].push(s)
    })
    Object.keys(gr).forEach(g => gr[g].sort((a, b) =>
      b.incorrect !== a.incorrect ? b.incorrect - a.incorrect : (a.correct / a.total) - (b.correct / b.total)))
    return gr
  }

  // --- 選択肢生成 ---
  const generateChoices = (correct) => {
    const wrong = [...colors.filter(c => c.id !== correct.id)].sort(() => Math.random() - 0.5).slice(0, 3)
    return [...wrong, correct].sort(() => Math.random() - 0.5)
  }

  // --- Navigation ---
  const startQuiz = () => {
    let target = selectedGroup === 'all' ? colors : colors.filter(c => c.colorgroup === selectedGroup)
    let shuffled = [...target].sort(() => Math.random() - 0.5)
    if (quizMode !== 'all') shuffled = shuffled.slice(0, quizMode)
    if (!shuffled.length) { alert('該当する問題がありません'); return }

    setQuestionOrder(shuffled)
    setCurrentIndex(0)
    setShowAnswer(false)
    setFlashcardTimedOut(false)
    setResults([])
    setRankingTab('current')
    if (quizType !== 'flashcard') {
      setChoiceOptions(generateChoices(shuffled[0]))
      setSelectedChoice(null)
      setIsAnswered(false)
    }
    setGameState('quiz')
  }

  const goToRanking = () => { setRankingTab('mistake'); setGameState('result') }
  const returnHome  = () => { clearTimer(); setGameState('home'); setResults([]) }

  // --- Flashcard handlers ---
  const handleShowAnswer = () => {
    clearTimer()
    setShowAnswer(true)
  }

  const saveResult = (question, isCorrect) => {
    const r = { id: question.id, answer: question.name, userAnswer: isCorrect ? '○' : '×', timestamp: new Date().toISOString() }
    setResults(prev => [...prev, r])
    try { localStorage.setItem(`result:${Date.now()}_${question.id}`, JSON.stringify(r)) } catch {}
  }

  const handleAnswer = (isCorrect) => {
    clearTimer()
    saveResult(currentQuestion, isCorrect)
    if (currentIndex < questionOrder.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setFlashcardTimedOut(false)
    } else {
      setGameState('result')
      setRankingTab('current')
    }
  }

  // --- 四択 / 説明 handlers ---
  const handleChoiceSelect = (choice) => {
    if (isAnswered) return
    clearTimer()
    setSelectedChoice(choice.id)
    setIsAnswered(true)
    saveResult(currentQuestion, choice.id === currentQuestion.id)
  }

  const handleChoiceNext = () => {
    const next = currentIndex + 1
    if (next < questionOrder.length) {
      setCurrentIndex(next)
      setChoiceOptions(generateChoices(questionOrder[next]))
      setSelectedChoice(null)
      setIsAnswered(false)
    } else {
      setGameState('result')
      setRankingTab('current')
    }
  }

  const handleClearHistory = () => {
    if (!window.confirm('過去の学習履歴をすべて削除しますか？')) return
    try {
      Object.keys(localStorage).filter(k => k.startsWith('result:')).forEach(k => localStorage.removeItem(k))
      alert('履歴を削除しました')
      if (gameState === 'result') setGameState('home')
    } catch {}
  }

  const currentQuestion = questionOrder[currentIndex]

  // ========== HOME SCREEN ==========
  if (gameState === 'home') {
    return (
      <div className={`min-h-screen ${t.screenBg} flex items-center justify-center py-4`}>
        <div className={`${t.cardBg} rounded-lg shadow-xl p-8 max-w-2xl w-full`}>

          {/* 学習データ + ダークモード（見出し上） */}
          <div className="flex justify-end items-center gap-2 mb-2">
            <button onClick={goToRanking}
              className="w-[100px] py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors shadow flex items-center justify-center gap-1">
              <span>🏆</span> 学習データ
            </button>
            <DarkToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className={`text-4xl font-bold mb-2 ${dm ? 'text-purple-300' : 'text-purple-800'}`}>カラーフラッシュカード</h1>
            <p className={`text-xs leading-relaxed ${t.textSecondary}`}>
              慣用色名をフラッシュカードで効率よく暗記。色彩検定2級や1級2次の勉強にお役立ていただけます！
            </p>
          </div>

          {/* 現在の設定 + クイズ開始 */}
          <div className={`${t.sectionBg} p-4 rounded-lg text-center mb-3`}>
            <p className={`text-sm font-medium mb-1 ${t.sectionTitle}`}>現在の設定</p>
            <p className={`text-2xl font-bold ${t.sectionValue}`}>{selectedGroup === 'all' ? '全グループ' : selectedGroup}</p>
            <p className={t.sectionSub}>
              {{ flashcard: '色名解答', choice: '四択解答', description: '説明から解答' }[quizType]}
              {' / × '}
              {quizMode === 'all' ? '全問' : `${quizMode}問`}
              {' / '}
              {timerSetting === 0 ? '無制限' : timerSetting === 'custom' ? `${customTimerVal || '?'}秒` : `${timerSetting}秒`}
            </p>
          </div>

          <button onClick={startQuiz}
            className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 mb-6">
            <span>🚀</span> クイズ開始
          </button>

          {/* クイズタイプ */}
          <div className={`flex ${t.tabBg} p-1 rounded-lg mb-2`}>
            {[
              { value: 'flashcard',   label: '色名解答' },
              { value: 'choice',      label: '四択解答' },
              { value: 'description', label: '説明から解答' },
            ].map(({ value, label }) => (
              <button key={value} onClick={() => setQuizType(value)}
                className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${quizType === value ? t.tabActive : t.tabInactive}`}>
                {label}
              </button>
            ))}
          </div>

          {/* クイズタイプ説明 */}
          {{
            flashcard:   { icon: '🎴', text: '色のパッチを見て色名を思い浮かべ、正解を確認してから○/×で自己採点します。' },
            choice:      { icon: '🔢', text: '色のパッチを見て、4つの選択肢の中から正しい色名を選びます。' },
            description: { icon: '📖', text: '色の説明文を読んで、4つの選択肢の中から対応する色名を選びます。' },
          }[quizType] && (
            <div className={`flex items-start gap-2 px-3 py-2 rounded-lg mb-5 text-sm ${dm ? 'bg-gray-700 text-gray-300' : 'bg-purple-50 text-purple-800'}`}>
              <span className="text-base leading-snug flex-shrink-0 mt-0.5">
                {{ flashcard: '🎴', choice: '🔢', description: '📖' }[quizType]}
              </span>
              <span className="leading-snug">
                {{ flashcard:   '色のパッチを見て色名を思い浮かべ、正解を確認してから○/×で自己採点します。',
                   choice:      '色のパッチを見て、4つの選択肢の中から正しい色名を選びます。',
                   description: '色の説明文を読んで、4つの選択肢の中から対応する色名を選びます。',
                }[quizType]}
              </span>
            </div>
          )}

          {/* 設定 */}
          <div className="space-y-5 mb-8">
            {/* 出題数 */}
            <div>
              <p className={`text-sm font-semibold mb-2 ${t.textSecondary}`}>出題数</p>
              <div className={`flex ${t.tabBg} p-1 rounded-lg`}>
                {[{ label: '10問', value: 10 }, { label: '20問', value: 20 }, { label: '全問', value: 'all' }].map(m => (
                  <button key={m.label} onClick={() => setQuizMode(m.value)}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${quizMode === m.value ? t.tabActive : t.tabInactive}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 解答時間 */}
            <div>
              <p className={`text-sm font-semibold mb-2 ${t.textSecondary}`}>解答時間</p>
              <div className={`flex ${t.tabBg} p-1 rounded-lg mb-2`}>
                {[
                  { label: '無限', value: 0 },
                  { label: '5秒',  value: 5 },
                  { label: '10秒', value: 10 },
                  { label: '20秒', value: 20 },
                  { label: 'カスタム', value: 'custom' },
                ].map(m => (
                  <button key={m.label} onClick={() => setTimerSetting(m.value)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${timerSetting === m.value ? t.tabActive : t.tabInactive}`}>
                    {m.label}
                  </button>
                ))}
              </div>
              {timerSetting === 'custom' && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={customTimerVal}
                    onChange={e => setCustomTimerVal(e.target.value)}
                    className={`w-20 px-3 py-1.5 rounded-lg border text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-400 ${t.inputBorder}`}
                  />
                  <span className={`text-sm ${t.textSecondary}`}>秒</span>
                </div>
              )}
            </div>

            {/* 色グループ */}
            <div>
              <p className={`text-sm font-semibold mb-2 ${t.textSecondary}`}>色グループ</p>
              <div className="grid grid-cols-3 gap-2">
                {colorGroups.map(group => (
                  <button key={group} onClick={() => setSelectedGroup(group)}
                    className={`py-2 px-1 text-xs font-bold rounded-md border transition-all truncate ${t.groupBtn(selectedGroup === group)}`}>
                    {group === 'all' ? 'すべて' : group}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ========== RESULT / RANKING SCREEN ==========
  if (gameState === 'result') {
    const mistakeRanking = getMistakeRanking()
    const groupMistakes  = getGroupMistakeRanking()
    const isFromResult   = results.length > 0

    return (
      <>
      <div className={`min-h-screen ${t.screenBg} py-4 md:py-8`}>
        <div className={`max-w-3xl mx-auto ${t.cardBg} rounded-lg shadow-lg p-6 md:p-8`}>

          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-3xl font-bold ${dm ? 'text-purple-300' : 'text-purple-800'}`}>
              {isFromResult ? 'お疲れ様でした！' : '学習データ'}
            </h2>
            <DarkToggle />
          </div>

          <div className={`flex flex-wrap gap-2 mb-6 p-1 ${t.tabBg} rounded-lg`}>
            {[
              { id: 'current', label: '今回の結果' },
              { id: 'mistake', label: '総合ワースト' },
              { id: 'group',   label: 'グループ別' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setRankingTab(tab.id)}
                className={`flex-1 py-2 px-3 text-sm md:text-base font-bold rounded-md transition-all ${rankingTab === tab.id ? t.tabActive : t.tabInactive}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {rankingTab === 'current' && (
              <div className="mb-8">
                <h3 className={`text-xl font-semibold mb-4 ${t.textPrimary}`}>今回の結果</h3>
                {results.length === 0 ? (
                  <div className={`text-center py-12 ${t.textSecondary} ${t.rowBg} rounded border border-dashed`}>
                    <p className="mb-2">直近のクイズデータがありません</p>
                    <p className={`text-sm ${t.textMuted}`}>ホームに戻ってクイズを開始してください</p>
                  </div>
                ) : (
                  <>
                    <div className={`flex justify-between items-end mb-4 px-2 ${t.textSecondary} text-sm`}>
                      <span>実施モード: {selectedGroup === 'all' ? '全グループ' : selectedGroup}</span>
                      <span className={`text-lg font-bold ${t.textPrimary}`}>
                        正解数: {results.filter(r => r.userAnswer === '○').length} / {results.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {results.map((result, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 ${t.rowBg} rounded border`}>
                          <span className={`font-medium text-sm md:text-base ${t.textPrimary}`}>Q{result.id}: {result.answer}</span>
                          <span className={`text-xl md:text-2xl font-bold ${result.userAnswer === '○' ? 'text-green-500' : 'text-red-500'}`}>
                            {result.userAnswer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {rankingTab === 'mistake' && (
              <div className="mb-8">
                <h3 className={`text-xl font-semibold mb-4 ${t.textPrimary}`}>間違いが多い色 TOP20（全体）</h3>
                {mistakeRanking.length === 0 ? (
                  <div className={`text-center py-12 ${t.textSecondary}`}>まだ学習データがありません</div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {mistakeRanking.slice(0, 20).map((stat, i) => {
                      const color = colors.find(c => c.id === stat.id)
                      const rate  = Math.round((stat.correct / stat.total) * 100)
                      return (
                        <div key={stat.id} onClick={() => color && setModalColor(color)}
                          className={`flex items-center gap-3 p-3 ${t.rowBg} rounded border ${t.rowHover} transition-colors cursor-pointer`}>
                          <div className={`text-lg font-bold w-6 ${t.textMuted}`}>{i + 1}</div>
                          <div className="w-10 h-10 rounded shadow-sm flex-shrink-0 border border-gray-300" style={{ backgroundColor: color?.colorcode }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-bold truncate mr-2 ${t.textPrimary}`}>{stat.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${dm ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{stat.group}</span>
                            </div>
                            <div className={`text-xs flex items-center gap-2 ${t.textSecondary}`}>
                              <div className={`flex-1 h-2 ${t.progressBg} rounded-full overflow-hidden`}>
                                <div className="h-full bg-blue-500" style={{ width: `${rate}%` }} />
                              </div>
                              <span>{rate}%</span>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-xl font-bold text-red-500">×{stat.incorrect}</div>
                            <div className={`text-xs ${t.textMuted}`}>全{stat.total}回</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {rankingTab === 'group' && (
              <div className="mb-8">
                <h3 className={`text-xl font-semibold mb-4 ${t.textPrimary}`}>グループ別 間違いTOP10</h3>
                {Object.keys(groupMistakes).length === 0 ? (
                  <div className={`text-center py-12 ${t.textSecondary}`}>まだ学習データ（間違い）がありません</div>
                ) : (
                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2">
                    {colorGroups.filter(g => g !== 'all' && groupMistakes[g]).map(group => {
                      const mistakes = groupMistakes[group]
                      return (
                        <div key={group} className={`border ${t.cardBorder} rounded-lg overflow-hidden`}>
                          <div className={`${t.groupHeader} px-4 py-2 font-bold border-b ${t.cardBorder} flex justify-between`}>
                            <span>{group}</span>
                            <span className={`text-sm font-normal ${t.groupSubText}`}>間違い: {mistakes.length}色</span>
                          </div>
                          <div className={`${dm ? 'bg-gray-900' : 'bg-gray-50'} p-2 space-y-2`}>
                            {mistakes.slice(0, 10).map((stat, idx) => {
                              const color = colors.find(c => c.id === stat.id)
                              const rate  = Math.round((stat.correct / stat.total) * 100)
                              return (
                                <div key={stat.id} onClick={() => color && setModalColor(color)}
                                  className={`flex items-center gap-3 p-2 ${t.cardBg} rounded border ${t.cardBorder} shadow-sm ${t.rowHover} transition-colors cursor-pointer`}>
                                  <div className={`text-base font-bold w-5 text-center ${t.textMuted}`}>{idx + 1}</div>
                                  <div className="w-8 h-8 rounded shadow-sm flex-shrink-0 border border-gray-300" style={{ backgroundColor: color?.colorcode }} />
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-semibold text-sm truncate ${t.textPrimary}`}>{stat.name}</div>
                                    <div className={`text-xs ${t.textSecondary}`}>正解率: {rate}%</div>
                                  </div>
                                  <span className="text-lg font-bold text-red-500">×{stat.incorrect}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`space-y-3 mt-6 border-t ${t.cardBorder} pt-6`}>
            <button onClick={startQuiz} className="w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md">
              {results.length > 0 ? 'もう一度同じ設定で解く' : 'クイズを始める'}
            </button>
            <button onClick={returnHome} className={`w-full py-3 text-lg font-bold rounded-lg transition-colors ${t.btnSecondary}`}>
              ホームに戻る
            </button>
            <button onClick={handleClearHistory} className={`w-full py-2 text-sm transition-colors ${t.btnClear}`}>
              学習履歴をクリアする
            </button>
          </div>
        </div>
      </div>
      <ColorModal />
      </>
    )
  }

  // ========== QUIZ SCREEN ==========
  if (!currentQuestion) {
    return <div className={`text-center p-8 ${t.textPrimary}`}>読み込み中...</div>
  }

  // ---------- 共通ヘッダー ----------
  const QuizHeader = ({ label }) => (
    <div className={`flex justify-between items-center mb-2 text-xs md:text-sm ${t.textSecondary}`}>
      <div>
        {selectedGroup !== 'all' && <span className="mr-2 font-bold text-purple-500">[{selectedGroup}]</span>}
        進捗: {currentIndex + 1} / {questionOrder.length}
      </div>
      <div className="flex items-center gap-2">
        <DarkToggle />
        <button onClick={returnHome} className="hover:text-red-400 transition-colors ml-1">{label}</button>
      </div>
    </div>
  )

  // ---------- 四択 / 説明から解答 ----------
  if (quizType === 'choice' || quizType === 'description') {
    const timedOut  = selectedChoice === -1
    const isCorrect = !timedOut && selectedChoice === currentQuestion.id

    return (
      <div className={`min-h-screen ${t.screenBg} flex items-center justify-center py-4 md:py-8`}>
        <div className={`${t.cardBg} rounded-lg shadow-xl py-6 px-4 max-w-3xl w-full`}>
          <QuizHeader label="中断" />
          <TimerBar />

          <div className="flex flex-col items-center mb-6">
            <div className={`text-xl md:text-2xl font-bold mb-4 ${t.textPrimary}`}>第{currentIndex + 1}問</div>

            {quizType === 'choice' ? (
              <>
                <div className="w-36 h-36 md:w-52 md:h-52 rounded-xl shadow-lg" style={{ backgroundColor: currentQuestion.colorcode }} />
                <p className={`mt-3 text-sm ${t.textSecondary}`}>この色の名前は？</p>
              </>
            ) : (
              <div className={`w-full max-w-lg rounded-xl border-2 ${t.answerBg} p-5 md:p-6`}>
                <p className={`text-xs font-semibold mb-3 ${t.textMuted}`}>次の説明に当てはまる色名を選んでください</p>
                <p className={`text-base md:text-lg leading-relaxed font-medium ${t.answerTitle}`}>{currentQuestion.feature}</p>
                {isAnswered && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg shadow flex-shrink-0 border border-gray-300" style={{ backgroundColor: currentQuestion.colorcode }} />
                    <span className={`text-sm ${t.answerValue}`}>{currentQuestion.colorgroup} / {currentQuestion.keito} / {currentQuestion.munsell}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4択ボタン */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {choiceOptions.map(choice => {
              let state = 'default'
              if (isAnswered || timedOut) {
                if (choice.id === currentQuestion.id) state = 'correct'
                else if (choice.id === selectedChoice)  state = 'wrong'
                else state = 'dim'
              }
              return (
                <button key={choice.id} onClick={() => handleChoiceSelect(choice)} disabled={isAnswered}
                  className={`w-full py-3 px-4 text-sm md:text-base font-bold rounded-lg border-2 transition-all text-left ${t.choiceBtn(state)}`}>
                  {choice.name}
                </button>
              )
            })}
          </div>

          {/* フィードバック */}
          {(isAnswered || timedOut) && (
            <div className="mt-2">
              <div className={`text-center text-lg font-bold mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {timedOut
                  ? `⏰ 時間切れ！ — 正解は「${currentQuestion.name}」`
                  : isCorrect
                    ? '正解！'
                    : `不正解 — 正解は「${currentQuestion.name}」`}
              </div>
              <button onClick={handleChoiceNext}
                className="w-full py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                {currentIndex < questionOrder.length - 1 ? '次の問題へ →' : '結果を見る'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- フラッシュカード ----------
  return (
    <div className={`min-h-screen ${t.screenBg} flex items-center justify-center py-4 md:py-8`}>
      <div className={`${t.cardBg} rounded-lg shadow-xl py-6 px-4 max-w-3xl w-full`}>
        <QuizHeader label="中断してホームへ" />
        <TimerBar />

        <div className="mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className={`text-xl md:text-2xl font-bold ${t.textPrimary}`}>第{currentIndex + 1}問</div>
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-lg shadow-lg" style={{ backgroundColor: currentQuestion.colorcode }} />
          </div>

          {showAnswer && (
            <div className={`${t.answerBg} rounded-lg p-4 md:p-6 border-2 mx-auto max-w-lg`}>
              <h3 className={`text-2xl font-bold mb-4 text-center ${t.answerTitle}`}>{currentQuestion.name}</h3>
              <div className="space-y-2 text-sm md:text-base">
                {[
                  { label: 'グループ',   value: currentQuestion.colorgroup },
                  { label: '系統色名',   value: currentQuestion.keito },
                  { label: 'マンセル値', value: currentQuestion.munsell },
                ].map(row => (
                  <div key={row.label} className={`flex border-b ${t.answerBorder} py-1`}>
                    <span className={`font-semibold w-24 md:w-32 flex-shrink-0 ${t.answerLabel}`}>{row.label}</span>
                    <span className={t.answerValue}>{row.value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <p className={`leading-relaxed text-sm ${t.answerValue}`}>{currentQuestion.feature}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <button onClick={handleShowAnswer} disabled={showAnswer}
            className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors w-full md:w-auto ${
              showAnswer ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}>
            回答を見る
          </button>
        </div>

        {flashcardTimedOut && (
          <div className="text-center text-sm font-bold text-red-500 mb-3">⏰ 時間切れ</div>
        )}
        <div className="flex gap-4 justify-center">
          {[
            { label: '○', correct: true,  cls: 'bg-green-600 text-white hover:bg-green-700 shadow-md' },
            { label: '×', correct: false, cls: 'bg-red-600 text-white hover:bg-red-700 shadow-md' },
          ].map(({ label, correct, cls }) => (
            <button key={label} onClick={() => handleAnswer(correct)} disabled={!showAnswer}
              className={`flex-1 md:flex-none px-8 py-4 text-2xl font-bold rounded-lg transition-colors ${
                !showAnswer ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : cls
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
