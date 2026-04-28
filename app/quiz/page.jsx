'use client'

import React, { useState, useMemo } from 'react'
import colorsData from '../../src/colors.json'

const ColorFlashcard = () => {
  const colors = colorsData

  // 画面の状態管理: 'home' | 'quiz' | 'result'
  const [gameState, setGameState] = useState('home')

  // 出題数モード: 10, 20, 'all'
  const [quizMode, setQuizMode] = useState(10)

  // 色グループ選択: 'all' または 'Red', 'Blue' など
  const [selectedGroup, setSelectedGroup] = useState('all')

  const [questionOrder, setQuestionOrder] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [results, setResults] = useState([])

  // 結果画面の表示タブ: 'current' | 'mistake' | 'group'
  const [rankingTab, setRankingTab] = useState('current')

  const colorGroups = useMemo(() => {
    const groups = new Set(colors.map(c => c.colorgroup))
    return ['all', ...Array.from(groups).sort()]
  }, [colors])

  const getStatistics = () => {
    const stats = {}
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('result:'))
        .forEach(key => {
          const data = JSON.parse(localStorage.getItem(key))
          if (!stats[data.id]) {
            const colorInfo = colors.find(c => c.id === data.id)
            stats[data.id] = {
              id: data.id,
              name: data.answer,
              group: colorInfo ? colorInfo.colorgroup : 'Unknown',
              correct: 0,
              incorrect: 0,
              total: 0
            }
          }
          stats[data.id].total++
          if (data.userAnswer === '○') {
            stats[data.id].correct++
          } else {
            stats[data.id].incorrect++
          }
        })
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
    return Object.values(stats)
  }

  const getMistakeRanking = () => {
    const stats = getStatistics()
    return stats
      .filter(s => s.incorrect > 0)
      .sort((a, b) => {
        if (b.incorrect !== a.incorrect) return b.incorrect - a.incorrect
        const rateA = a.correct / a.total
        const rateB = b.correct / b.total
        return rateA - rateB
      })
  }

  const getGroupMistakeRanking = () => {
    const stats = getStatistics()
    const groupRankings = {}
    stats.forEach(stat => {
      if (stat.incorrect === 0) return
      const group = stat.group
      if (!groupRankings[group]) {
        groupRankings[group] = []
      }
      groupRankings[group].push(stat)
    })
    Object.keys(groupRankings).forEach(group => {
      groupRankings[group].sort((a, b) => {
        if (b.incorrect !== a.incorrect) return b.incorrect - a.incorrect
        return (a.correct / a.total) - (b.correct / b.total)
      })
    })
    return groupRankings
  }

  const startQuiz = () => {
    let targetColors = colors
    if (selectedGroup !== 'all') {
      targetColors = colors.filter(c => c.colorgroup === selectedGroup)
    }
    let shuffled = [...targetColors].sort(() => Math.random() - 0.5)
    if (quizMode !== 'all') {
      shuffled = shuffled.slice(0, quizMode)
    }
    if (shuffled.length === 0) {
      alert('該当する問題がありません')
      return
    }
    setQuestionOrder(shuffled)
    setCurrentIndex(0)
    setShowAnswer(false)
    setResults([])
    setRankingTab('current')
    setGameState('quiz')
  }

  const goToRanking = () => {
    setRankingTab('mistake')
    setGameState('result')
  }

  const returnHome = () => {
    setGameState('home')
    setResults([])
  }

  const currentQuestion = questionOrder[currentIndex]

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleAnswer = (isCorrect) => {
    const result = {
      id: currentQuestion.id,
      answer: currentQuestion.name,
      userAnswer: isCorrect ? '○' : '×',
      timestamp: new Date().toISOString()
    }
    const newResults = [...results, result]
    setResults(newResults)
    try {
      const key = `result:${Date.now()}_${currentQuestion.id}`
      localStorage.setItem(key, JSON.stringify(result))
    } catch (error) {
      console.error('Error saving result:', error)
    }
    if (currentIndex < questionOrder.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    } else {
      setGameState('result')
      setRankingTab('current')
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('過去の学習履歴をすべて削除しますか？')) {
      try {
        Object.keys(localStorage)
          .filter(key => key.startsWith('result:'))
          .forEach(key => localStorage.removeItem(key))
        alert('履歴を削除しました')
        if (gameState === 'result') {
          setGameState('home')
        }
      } catch (error) {
        console.error('Error clearing history:', error)
      }
    }
  }

  // 1. ホーム画面
  if (gameState === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-800 mb-2">色彩検定</h1>
            <p className="text-gray-500">カラーフラッシュカード</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">出題数</p>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {[
                    { label: '10問', value: 10 },
                    { label: '20問', value: 20 },
                    { label: '全問', value: 'all' }
                  ].map((mode) => (
                    <button
                      key={mode.label}
                      onClick={() => setQuizMode(mode.value)}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                        quizMode === mode.value
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">色グループ</p>
                <div className="grid grid-cols-3 gap-2">
                  {colorGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`py-2 px-1 text-xs font-bold rounded-md border transition-all truncate ${
                        selectedGroup === group
                          ? 'bg-purple-100 border-purple-500 text-purple-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {group === 'all' ? 'すべて' : group}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center mb-2">
                <p className="text-sm text-blue-800 font-medium mb-1">現在の設定</p>
                <p className="text-2xl font-bold text-blue-900">
                  {selectedGroup === 'all' ? '全グループ' : selectedGroup}
                </p>
                <p className="text-blue-700">
                  × {quizMode === 'all' ? '全問' : `${quizMode}問`}
                </p>
              </div>

              <button
                onClick={startQuiz}
                className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>🚀</span> クイズ開始
              </button>

              <button
                onClick={goToRanking}
                className="w-full py-3 bg-purple-600 text-white text-lg font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>🏆</span> ランキング
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. 結果・ランキング画面
  if (gameState === 'result') {
    const mistakeRanking = getMistakeRanking()
    const groupMistakes = getGroupMistakeRanking()
    const isFromResult = results.length > 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-purple-800">
            {isFromResult ? 'お疲れ様でした！' : '学習データ'}
          </h2>

          <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            {[
              { id: 'current', label: '今回の結果' },
              { id: 'mistake', label: '総合ワースト' },
              { id: 'group', label: 'グループ別ワースト' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRankingTab(tab.id)}
                className={`flex-1 py-2 px-3 text-sm md:text-base font-bold rounded-md transition-all ${
                  rankingTab === tab.id
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {rankingTab === 'current' && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">今回の結果</h3>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded border border-dashed">
                    <p className="mb-2">直近のクイズデータがありません</p>
                    <p className="text-sm text-gray-400">ホームに戻ってクイズを開始してください</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-end mb-4 px-2">
                      <span className="text-sm text-gray-500">
                        実施モード: {selectedGroup === 'all' ? '全グループ' : selectedGroup}
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        正解数: {results.filter(r => r.userAnswer === '○').length} / {results.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                        >
                          <span className="font-medium text-gray-800 text-sm md:text-base">
                            Q{result.id}: {result.answer}
                          </span>
                          <span className={`text-xl md:text-2xl font-bold ${
                            result.userAnswer === '○' ? 'text-green-600' : 'text-red-600'
                          }`}>
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
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  間違いが多い色 TOP20 (全体)
                </h3>
                {mistakeRanking.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    まだ学習データがありません
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {mistakeRanking.slice(0, 20).map((stat, index) => {
                      const color = colors.find(c => c.id === stat.id)
                      const correctRate = Math.round((stat.correct / stat.total) * 100)
                      return (
                        <div
                          key={stat.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-lg font-bold text-gray-400 w-6">
                            {index + 1}
                          </div>
                          <div
                            className="w-10 h-10 rounded shadow-sm flex-shrink-0 border border-gray-200"
                            style={{ backgroundColor: color?.colorcode }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-gray-800 truncate mr-2">
                                {stat.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-600">
                                {stat.group}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${correctRate}%` }}
                                />
                              </div>
                              <span>{correctRate}%</span>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-xl font-bold text-red-500">
                              ×{stat.incorrect}
                            </div>
                            <div className="text-xs text-gray-400">
                              全{stat.total}回
                            </div>
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
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  グループ別 間違いTOP10
                </h3>
                {Object.keys(groupMistakes).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    まだ学習データ（間違い）がありません
                  </div>
                ) : (
                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2">
                    {colorGroups
                      .filter(group => group !== 'all' && groupMistakes[group])
                      .map((group) => {
                        const mistakes = groupMistakes[group]
                        return (
                          <div key={group} className="border rounded-lg overflow-hidden">
                            <div className="bg-purple-100 px-4 py-2 font-bold text-purple-800 border-b flex justify-between">
                              <span>{group} Group</span>
                              <span className="text-sm font-normal text-purple-600">
                                間違い: {mistakes.length}色
                              </span>
                            </div>
                            <div className="bg-gray-50 p-2 space-y-2">
                              {mistakes.slice(0, 10).map((stat, idx) => {
                                const color = colors.find(c => c.id === stat.id)
                                const correctRate = Math.round((stat.correct / stat.total) * 100)
                                return (
                                  <div
                                    key={stat.id}
                                    className="flex items-center gap-3 p-2 bg-white rounded border shadow-sm"
                                  >
                                    <div className="text-base font-bold text-gray-400 w-5 text-center">
                                      {idx + 1}
                                    </div>
                                    <div
                                      className="w-8 h-8 rounded shadow-sm flex-shrink-0 border border-gray-200"
                                      style={{ backgroundColor: color?.colorcode }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-gray-800 text-sm truncate">
                                        {stat.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        正解率: {correctRate}%
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-lg font-bold text-red-500 block leading-none">
                                        ×{stat.incorrect}
                                      </span>
                                    </div>
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

          <div className="space-y-3 mt-6 border-t pt-6">
            <button
              onClick={startQuiz}
              className="w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              {results.length > 0 ? 'もう一度同じ設定で解く' : 'クイズを始める'}
            </button>

            <button
              onClick={returnHome}
              className="w-full py-3 bg-gray-200 text-gray-700 text-lg font-bold rounded-lg hover:bg-gray-300 transition-colors"
            >
              ホームに戻る
            </button>

            <button
              onClick={handleClearHistory}
              className="w-full py-2 text-gray-400 text-sm hover:text-red-500 transition-colors mt-2"
            >
              学習履歴をクリアする
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 3. クイズ画面
  if (!currentQuestion) {
    return <div className="text-center p-8">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-xl py-6 px-4 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4 text-xs md:text-sm text-gray-500">
          <div>
            {selectedGroup !== 'all' && <span className="mr-2 font-bold text-purple-600">[{selectedGroup}]</span>}
            進捗: {currentIndex + 1} / {questionOrder.length}
          </div>
          <button onClick={returnHome} className="hover:text-gray-800">中断してホームへ</button>
        </div>

        <div className="mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="text-xl md:text-2xl font-bold text-gray-700">
              第{currentIndex + 1}問
            </div>
            <div
              className="w-32 h-32 md:w-48 md:h-48 rounded-lg shadow-lg transition-all"
              style={{ backgroundColor: currentQuestion.colorcode }}
            />
          </div>

          {showAnswer && (
            <div className="bg-purple-50 rounded-lg p-4 md:p-6 border-2 border-purple-200 mx-auto max-w-lg">
              <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">
                {currentQuestion.name}
              </h3>
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex border-b border-purple-100 py-1">
                  <span className="font-semibold text-gray-700 w-24 md:w-32 flex-shrink-0">グループ</span>
                  <span className="text-gray-600">{currentQuestion.colorgroup}</span>
                </div>
                <div className="flex border-b border-purple-100 py-1">
                  <span className="font-semibold text-gray-700 w-24 md:w-32 flex-shrink-0">系統色名</span>
                  <span className="text-gray-600">{currentQuestion.keito}</span>
                </div>
                <div className="flex border-b border-purple-100 py-1">
                  <span className="font-semibold text-gray-700 w-24 md:w-32 flex-shrink-0">マンセル値</span>
                  <span className="text-gray-600">{currentQuestion.munsell}</span>
                </div>
                <div className="pt-2">
                  <p className="text-gray-600 leading-relaxed text-sm">{currentQuestion.feature}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <button
            onClick={handleShowAnswer}
            disabled={showAnswer}
            className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors w-full md:w-auto ${
              showAnswer
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            回答を見る
          </button>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleAnswer(true)}
            disabled={!showAnswer}
            className={`flex-1 md:flex-none px-8 py-4 text-2xl font-bold rounded-lg transition-colors ${
              !showAnswer
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
            }`}
          >
            ○
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={!showAnswer}
            className={`flex-1 md:flex-none px-8 py-4 text-2xl font-bold rounded-lg transition-colors ${
              !showAnswer
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
            }`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default ColorFlashcard
