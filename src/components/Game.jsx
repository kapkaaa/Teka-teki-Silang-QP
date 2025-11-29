import React, { useCallback, useRef } from 'react';
import { Trophy, Clock, User, LogOut, Play, RotateCcw, Lightbulb, Grid3x3 } from 'lucide-react';

const Game = ({ 
  grid, 
  userAnswers, 
  selectedCell, 
  direction, 
  currentLevel, 
  hintsUsed, 
  error, 
  gridRefs, 
  handleKeyDown, 
  handleCellClick, 
  useHint, 
  submitGame, 
  questions,
  setPage
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-600">{currentLevel?.title}</h2>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <Lightbulb size={20} className="text-yellow-500" />
                <span className="font-semibold">{3 - hintsUsed} Hint</span>
              </div>
              <button
                onClick={useHint}
                disabled={hintsUsed >= 3}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 transition"
              >
                Gunakan Hint
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-100 p-4 rounded-lg inline-block">
                {grid.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex">
                    {row.map((cell, colIdx) => (
                      <div key={`${rowIdx}-${colIdx}`} className="relative">
                        {cell.isBlack ? (
                          <div className="w-12 h-12 bg-gray-800 border border-gray-900" />
                        ) : (
                          <div className="relative">
                            {cell.number && (
                              <div className="absolute top-0 left-0 text-xs font-bold text-indigo-600 pl-1 pt-0.5 z-10">
                                {cell.number}
                              </div>
                            )}
                            <input
                              ref={(el) => gridRefs.current[`${rowIdx}-${colIdx}`] = el}
                              type="text"
                              maxLength="1"
                              value={userAnswers[`${rowIdx}-${colIdx}`] || ''}
                              onChange={() => {}}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                              onClick={() => handleCellClick(rowIdx, colIdx)}
                              className={`w-12 h-12 border-2 text-center text-xl font-bold uppercase focus:outline-none ${
                                selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                                  ? 'border-blue-500 bg-blue-100'
                                  : 'border-gray-300 hover:border-gray-400'
                              } ${
                                cell.acrossClue || cell.downClue
                                  ? 'bg-white'
                                  : 'bg-gray-50'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-indigo-600 mb-4">Arah: {direction === 'across' ? 'Horizontal' : 'Vertikal'}</h3>
                <button
                  onClick={() => {
                    const newDirection = direction === 'across' ? 'down' : 'across';
                    // Jika ada sel terpilih, ganti arahnya
                    if (selectedCell) {
                      handleCellClick(selectedCell.row, selectedCell.col);
                    }
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mb-4"
                >
                  Ganti Arah ({direction === 'across' ? 'Vertikal' : 'Horizontal'})
                </button>
                
                <button
                  onClick={submitGame}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Selesai & Periksa
                </button>
                
                <button
                  onClick={() => setPage('menu')}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition mt-2"
                >
                  Kembali ke Menu
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-indigo-600 mb-4">Soal Horizontal</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {questions
                    .filter(q => q.direction === 'across')
                    .sort((a, b) => a.number - b.number)
                    .map(q => {
                      const userWord = questions
                        .find(word => word.id === q.id)
                        ?.answer.split('')
                        .map((_, i) => userAnswers[`${q.position_y}-${q.position_x + i}`] || '_')
                        .join('');
                      
                      const isCorrect = userWord?.replace(/_/g, '') === q.answer;
                      
                      return (
                        <div key={q.id} className={`p-3 rounded-lg border ${
                          isCorrect ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
                        }`}>
                          <div className="font-bold">{q.number}. {q.clue}</div>
                          <div className="text-sm mt-1">Jawaban: {userWord}</div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-indigo-600 mb-4">Soal Vertikal</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {questions
                    .filter(q => q.direction === 'down')
                    .sort((a, b) => a.number - b.number)
                    .map(q => {
                      const userWord = questions
                        .find(word => word.id === q.id)
                        ?.answer.split('')
                        .map((_, i) => userAnswers[`${q.position_y + i}-${q.position_x}`] || '_')
                        .join('');
                      
                      const isCorrect = userWord?.replace(/_/g, '') === q.answer;
                      
                      return (
                        <div key={q.id} className={`p-3 rounded-lg border ${
                          isCorrect ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
                        }`}>
                          <div className="font-bold">{q.number}. {q.clue}</div>
                          <div className="text-sm mt-1">Jawaban: {userWord}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;