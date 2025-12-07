import React, { useState, useEffect } from 'react';
import colorsData from './colors.json';

const ColorFlashcard = () => {
  const colors = colorsData;

  const [questionOrder, setQuestionOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showRanking, setShowRanking] = useState(false);

  // localStorageから統計データを取得
  const getStatistics = () => {
    const stats = {};
    
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('result:'))
        .forEach(key => {
          const data = JSON.parse(localStorage.getItem(key));
          if (!stats[data.id]) {
            stats[data.id] = {
              id: data.id,
              name: data.answer,
              correct: 0,
              incorrect: 0,
              total: 0
            };
          }
          stats[data.id].total++;
          if (data.userAnswer === '○') {
            stats[data.id].correct++;
          } else {
            stats[data.id].incorrect++;
          }
        });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }

    return Object.values(stats);
  };

  // 間違いが多い順にソート
  const getMistakeRanking = () => {
    const stats = getStatistics();
    return stats
      .filter(s => s.incorrect > 0)
      .sort((a, b) => {
        // 間違い数で降順
        if (b.incorrect !== a.incorrect) {
          return b.incorrect - a.incorrect;
        }
        // 間違い数が同じ場合は正答率で昇順
        const rateA = a.correct / a.total;
        const rateB = b.correct / b.total;
        return rateA - rateB;
      });
  };

  // 問題をランダムにシャッフル
  const shuffleQuestions = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setQuestionOrder(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setResults([]);
    setIsFinished(false);
  };

  // 初回ロード時にシャッフル
  useEffect(() => {
    shuffleQuestions();
  }, []);

  const currentQuestion = questionOrder[currentIndex];

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect) => {
    console.log(currentQuestion);
    const result = {
      id: currentQuestion.id,
      answer: currentQuestion.name,
      userAnswer: isCorrect ? '○' : '×',
      timestamp: new Date().toISOString()
    };

    const newResults = [...results, result];
    setResults(newResults);

    // localStorageに保存
    try {
      const key = `result:${Date.now()}_${currentQuestion.id}`;
      localStorage.setItem(key, JSON.stringify(result));
    } catch (error) {
      console.error('Error saving result:', error);
    }

    // 次の問題へ、または完了
    if (currentIndex < questionOrder.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    shuffleQuestions();
  };

  // localStorageのデータをクリア
  const handleClearHistory = () => {
    if (window.confirm('過去の学習履歴をすべて削除しますか？')) {
      try {
        // result:で始まるキーをすべて削除
        Object.keys(localStorage)
          .filter(key => key.startsWith('result:'))
          .forEach(key => localStorage.removeItem(key));
        alert('履歴を削除しました');
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  if (isFinished) {
    const mistakeRanking = getMistakeRanking();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-purple-800">
            お疲れ様でした！
          </h2>
          
          {/* タブ切り替えボタン */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowRanking(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                !showRanking
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              今回の結果
            </button>
            <button
              onClick={() => setShowRanking(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                showRanking
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              間違いランキング
            </button>
          </div>

          {!showRanking ? (
            /* 今回の結果 */
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">今回の結果</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                  >
                    <span className="font-medium text-gray-800">問題{result.id}: {result.answer}</span>
                    <span className={`text-2xl font-bold ${
                      result.userAnswer === '○' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.userAnswer}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-lg font-semibold text-gray-800">
                  正解数: {results.filter(r => r.userAnswer === '○').length} / {results.length}
                </p>
              </div>
            </div>
          ) : (
            /* 間違いランキング */
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                間違いが多い色ランキング
              </h3>
              {mistakeRanking.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  まだ学習データがありません
                </div>
              ) : (
                <div className="space-y-2">
                  {mistakeRanking.slice(0, 20).map((stat, index) => {
                    const color = colors.find(c => c.id === stat.id);
                    const correctRate = Math.round((stat.correct / stat.total) * 100);
                    return (
                      <div 
                        key={stat.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded border"
                      >
                        <div className="text-lg font-bold text-gray-600 w-8">
                          {index + 1}
                        </div>
                        <div 
                          className="w-12 h-12 rounded shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color?.colorcode }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {stat.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            正解率: {correctRate}% ({stat.correct}/{stat.total})
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            ×{stat.incorrect}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              再度問題を始める
            </button>
            
            <button
              onClick={handleClearHistory}
              className="w-full py-3 bg-gray-500 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              学習履歴をクリア
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center p-8">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl py-6 px-3 max-w-3xl w-full">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-2xl font-bold text-gray-700">
              第{currentIndex + 1}問
            </div>
            <div 
              className="w-24 h-24 rounded-lg shadow-lg"
              style={{ backgroundColor: currentQuestion.colorcode }}
            />
          </div>

          {showAnswer && (
            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">
                {currentQuestion.name}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">系統色名:</span>
                  <span className="text-gray-600">{currentQuestion.keito}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">マンセル値:</span>
                  <span className="text-gray-600">{currentQuestion.munsell}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">16進数:</span>
                  <span className="text-gray-600 font-mono">{currentQuestion.colorcode}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">RGB:</span>
                  <span className="text-gray-600 font-mono">{currentQuestion.rgb}</span>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <span className="font-semibold text-gray-700">概要と特徴:</span>
                  <p className="text-gray-600 mt-1 leading-relaxed">{currentQuestion.feature}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <button
            onClick={handleShowAnswer}
            disabled={showAnswer}
            className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors ${
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
            className={`px-12 py-4 text-2xl font-bold rounded-lg transition-colors ${
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
            className={`px-12 py-4 text-2xl font-bold rounded-lg transition-colors ${
              !showAnswer
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
            }`}
          >
            ×
          </button>
        </div>

        <div className="mt-6 text-center text-gray-600">
          進捗: {currentIndex + 1} / {questionOrder.length}
        </div>
      </div>
    </div>
  );
};

export default ColorFlashcard;