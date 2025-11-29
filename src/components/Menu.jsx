import React from 'react';
import { Trophy, Clock, User, LogOut, Play, RotateCcw, Lightbulb, Grid3x3 } from 'lucide-react';

const Menu = ({ user, handleLogout, loadLevels, loadLeaderboard, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">QuizPlay TTS</h1>
              <p className="text-gray-600 flex items-center gap-2 mt-2">
                <User size={18} /> {user?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={loadLevels}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-xl hover:shadow-lg transition flex flex-col items-center gap-4"
            >
              <Play size={48} />
              <span className="text-2xl font-bold">Mulai Main</span>
            </button>

            <button
              onClick={loadLeaderboard}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-8 rounded-xl hover:shadow-lg transition flex flex-col items-center gap-4"
            >
              <Trophy size={48} />
              <span className="text-2xl font-bold">Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;