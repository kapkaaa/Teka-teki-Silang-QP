import React from 'react';
import { RotateCcw } from 'lucide-react';

const Review = ({ 
  questions, 
  userAnswers, 
  startTime, 
  endTime, 
  currentLevel, 
  setPage, 
  startLevel 
}) => {
  let totalWords = questions.length;
  let correctWords = 0;
  for (const q of questions) {
    let userWord = '';
    for (let i = 0; i < q.answer.length; i++) {
      const row = q.direction === 'down' ? q.position_y + i : q.position_y;
      const col = q.direction === 'across' ? q.position_x + i : q.position_x;
      userWord += userAnswers[`${row}-${col}`] || '';
    }
    if (userWord === q.answer.toUpperCase()) correctWords++;
  }
  const score = totalWords > 0 ? Math.floor((correctWords / totalWords) * 100) : 0;
  const duration = Math.floor((endTime - startTime) / 1000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-indigo-600 mb-8 text-center">Hasil Permainan</h2>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{score}</div>
              <div className="text-gray-600">Skor</div>
            </div>
            <div className="bg-green-100 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{correctWords}/{totalWords}</div>
              <div className="text-gray-600">Kata Benar</div>
            </div>
            <div className="bg-purple-100 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{duration}s</div>
              <div className="text-gray-600">Waktu</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setPage('levels')}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Pilih Level Lain
            </button>
            <button
              onClick={() => startLevel(currentLevel)}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <RotateCcw size={20} className="inline mr-2" />
              Main Lagi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;