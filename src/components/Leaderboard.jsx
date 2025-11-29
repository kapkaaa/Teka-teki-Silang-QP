import React from 'react';
import { Trophy } from 'lucide-react';

const Leaderboard = ({ leaderboard, loading, error, setPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-600 flex items-center gap-3">
              <Trophy className="text-yellow-500" size={36} />
              Leaderboard
            </h2>
            <button
              onClick={() => setPage('menu')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Kembali
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Memuat leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Belum ada data.</div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                    idx === 1 ? 'bg-gray-200' :
                    idx === 2 ? 'bg-orange-200' :
                    'bg-gray-100'
                  }`}
                >
                  <div className="text-2xl font-bold w-12 text-center">{idx + 1}</div>
                  <div className="flex-1 font-bold">{entry.username}</div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{entry.total_correct}</div>
                    <div className="text-sm text-gray-600">Jawaban Benar</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;