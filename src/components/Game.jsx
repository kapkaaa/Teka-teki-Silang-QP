import React, { useCallback, useRef, useEffect } from 'react';
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
  // Fokus pada sel terpilih saat berubah
  useEffect(() => {
    if (selectedCell) {
      const element = gridRefs.current[`${selectedCell.row}-${selectedCell.col}`];
      if (element) {
        element.focus();
      }
    }
  }, [selectedCell, gridRefs]);

  // Fungsi untuk menangani input dari keyboard virtual
  const handleInput = (e, row, col) => {
    const value = e.target.value;

    // Ambil karakter terakhir dari input (untuk kasus inputan langsung tanpa key-by-key)
    if (value.length > 0) {
      const char = value.slice(-1); // Ambil karakter terakhir
      if (/[a-zA-Z]/.test(char)) {
        const newAnswers = { ...userAnswers };
        newAnswers[`${row}-${col}`] = char.toUpperCase();
        setUserAnswers(newAnswers);

        // Kosongkan input field agar bisa menerima input berikutnya
        e.target.value = char;

        // Pindah ke kotak berikutnya
        let nextRow = row, nextCol = col;
        if (direction === 'across') nextCol++;
        else nextRow++;

        if (
          nextRow < grid.length &&
          nextCol < grid[0]?.length &&
          !grid[nextRow]?.[nextCol]?.isBlack
        ) {
          setSelectedCell({ row: nextRow, col: nextCol });
          setTimeout(() => {
            const nextElement = gridRefs.current[`${nextRow}-${nextCol}`];
            if (nextElement) {
              nextElement.value = ''; // Kosongkan nilai sebelum fokus
              nextElement.focus();
            }
          }, 0);
        }
      }
    } else {
      // Hapus jika kosong
      const newAnswers = { ...userAnswers };
      delete newAnswers[`${row}-${col}`];
      setUserAnswers(newAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8">
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-600 text-center">{currentLevel?.title}</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <Lightbulb size={16} className="text-yellow-500 sm:size-20" />
                <span className="font-semibold text-sm sm:text-base">{3 - hintsUsed} Hint</span>
              </div>
              <button
                onClick={useHint}
                disabled={hintsUsed >= 3}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 transition text-sm sm:text-base"
              >
                Gunakan Hint
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="overflow-x-auto">
              <div className="bg-gray-100 p-2 sm:p-4 rounded-lg inline-block min-w-max">
                {grid.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex">
                    {row.map((cell, colIdx) => (
                      <div key={`${rowIdx}-${colIdx}`} className="relative">
                        {cell.isBlack ? (
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-800 border border-gray-900" />
                        ) : (
                          <div className="relative">
                            {cell.number && (
                              <div className="absolute top-0 left-0 text-[0.6rem] sm:text-xs font-bold text-indigo-600 pl-0.5 pt-0.5 z-10">
                                {cell.number}
                              </div>
                            )}
                            <input
                              ref={(el) => gridRefs.current[`${rowIdx}-${colIdx}`] = el}
                              type="text"
                              maxLength="1"
                              value={userAnswers[`${rowIdx}-${colIdx}`] || ''}
                              onChange={(e) => handleInput(e, rowIdx, colIdx)}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                              onClick={() => handleCellClick(rowIdx, colIdx)}
                              className={`w-8 h-8 sm:w-12 sm:h-12 border-2 text-center text-base sm:text-xl font-bold uppercase focus:outline-none ${
                                selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                                  ? 'border-blue-500 bg-blue-100'
                                  : 'border-gray-300 hover:border-gray-400'
                              } ${
                                cell.acrossClue || cell.downClue
                                  ? 'bg-white'
                                  : 'bg-gray-50'
                              }`}
                              inputMode="text"
                              autoComplete="off"
                              autoCapitalize="characters"
                              autoCorrect="off"
                              spellCheck="false"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                <h3 className="text-lg sm:text-xl font-bold text-indigo-600 mb-3 sm:mb-4">Arah: {direction === 'across' ? 'Horizontal' : 'Vertikal'}</h3>
                <button
                  onClick={() => {
                    const newDirection = direction === 'across' ? 'down' : 'across';
                    // Jika ada sel terpilih, ganti arahnya
                    if (selectedCell) {
                      handleCellClick(selectedCell.row, selectedCell.col);
                    }
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mb-3 sm:mb-4 text-sm sm:text-base"
                >
                  Ganti Arah ({direction === 'across' ? 'Vertikal' : 'Horizontal'})
                </button>

                <button
                  onClick={submitGame}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
                >
                  Selesai & Periksa
                </button>

                <button
                  onClick={() => setPage('menu')}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition mt-2 text-sm sm:text-base"
                >
                  Kembali ke Menu
                </button>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                <h3 className="text-lg sm:text-xl font-bold text-indigo-600 mb-3 sm:mb-4">Soal Horizontal</h3>
                <div className="space-y-2 max-h-40 sm:max-h-64 overflow-y-auto pr-2">
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
                        <div key={q.id} className={`p-2 sm:p-3 rounded-lg border text-xs sm:text-sm ${
                          isCorrect ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
                        }`}>
                          <div className="font-bold">{q.number}. {q.clue}</div>
                          <div className="mt-1">Jawaban: {userWord}</div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                <h3 className="text-lg sm:text-xl font-bold text-indigo-600 mb-3 sm:mb-4">Soal Vertikal</h3>
                <div className="space-y-2 max-h-40 sm:max-h-64 overflow-y-auto pr-2">
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
                        <div key={q.id} className={`p-2 sm:p-3 rounded-lg border text-xs sm:text-sm ${
                          isCorrect ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
                        }`}>
                          <div className="font-bold">{q.number}. {q.clue}</div>
                          <div className="mt-1">Jawaban: {userWord}</div>
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