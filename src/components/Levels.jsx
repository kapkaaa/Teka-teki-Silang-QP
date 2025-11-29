import React from 'react';
import { Trophy, Clock, User, LogOut, Play, RotateCcw, Lightbulb, Grid3x3 } from 'lucide-react';

const Levels = ({ levels, startLevel, loading, error, setPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-600">Pilih Level</h2>
            <button
              onClick={() => setPage('menu')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Kembali
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Memuat level...</div>
          ) : levels.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Belum ada level.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => startLevel(level)}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:shadow-lg transition"
                >
                  <div className="text-4xl font-bold mb-2">Level {level.level_number}</div>
                  <div className="text-lg">{level.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Levels;