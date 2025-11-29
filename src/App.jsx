import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Trophy,
  Clock,
  User,
  LogOut,
  Play,
  RotateCcw,
  Lightbulb,
  Grid3x3,
} from 'lucide-react';

// 🔐 HANYA URL YANG BOLEH ADA DI FRONTEND
// Supabase anon key TIDAK PERLU — client otomatis pakai session
const supabaseUrl = 'https://xpdpbxzfxhixzmvcswsy.supabase.co';
const supabasAnoneKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZHBieHpmeGhpeHptdmNzd3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTQwNTQsImV4cCI6MjA3OTI3MDA1NH0.2dpbe4Vk6PM1AY6PiIYGKmcZo5tcJxOD_4Jnras1mlg';
// JANGAN SIMPAN supabaseKey DI SINI! Supabase client pakai session dari auth

const supabase = createClient(supabaseUrl, supabasAnoneKey);

const CrosswordGame = () => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [grid, setGrid] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [direction, setDirection] = useState('across');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const gridRefs = useRef({});

  // Cek user saat mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Tunggu 1 detik agar trigger sempat jalan (opsional, tapi aman)
        await new Promise(r => setTimeout(r, 1000));
        
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single(); // pakai .single() karena auth_id UNIQUE
    
        if (userData) {
          setUser(userData);
          setPage('menu');
        } else {
          setError('User tidak ditemukan. Silakan coba login lagi.');
        }
      }
    };
    checkUser();
  }, []);

  // Handler login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setError('Email dan password harus diisi!');
      return;
    }
    setLoading(true);
    setError('');
  
    try {
      // CUKUP INI SAJA!
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
  
      if (authError) throw authError;
  
      // Setelah login sukses, ambil user dari public.users
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Tunggu sebentar agar trigger sempat jalan (jika user baru)
        await new Promise(r => setTimeout(r, 800));
        
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
  
        if (fetchError || !userData) {
          setError('User tidak ditemukan. Silakan coba lagi.');
          return;
        }
  
        setUser(userData);
        setPage('menu');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  // Handler register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError('Semua field harus diisi!');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('Password minimal 6 karakter!');
      return;
    }
    setLoading(true);
    setError('');
  
    try {
      // CUKUP INI SAJA!
      const { error: authError } = await supabase.auth.signUp({
        email: registerForm.email.trim(),
        password: registerForm.password,
        options: {
          data: { username: registerForm.name } // kirim ke raw_user_meta_data
        }
      });
  
      if (authError) throw authError;
  
      alert('Registrasi berhasil! Silakan login.');
      setIsRegister(false);
      setRegisterForm({ name: '', email: '', password: '' });
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage('login');
  };

  const loadLevels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('id, title, rows, cols')
        .order('id', { ascending: true });

      if (error) throw error;

      const levelsWithNumber = data.map((puzzle, idx) => ({
        ...puzzle,
        level_number: idx + 1,
        level_name: `Level ${idx + 1}`,
      }));

      setLevels(levelsWithNumber);
      setPage('levels');
    } catch (err) {
      setError('Gagal memuat level: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startLevel = async (level) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('puzzle_words')
        .select('*')
        .eq('puzzle_id', level.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('Level ini belum ada soal.');
        return;
      }

      const adaptedQuestions = data.map(q => ({
        id: q.id,
        answer: q.answer.trim().toUpperCase(),
        clue: q.clue,
        direction: q.direction.toLowerCase(),
        position_x: q.start_col - 1,
        position_y: q.start_row - 1,
        number: q.number
      }));

      // Bangun grid: mulai dengan SEMUA SEL PUTIH (isBlack: false), lalu hitamkan yang tidak dipakai
      const grid = Array(level.rows).fill().map(() => 
        Array(level.cols).fill().map(() => ({
          isBlack: false, // default putih
          letter: '',
          number: null,
          acrossClue: null,
          downClue: null
        }))
      );

      // Tandai sel yang digunakan oleh kata
      const usedCells = new Set();
      adaptedQuestions.forEach(q => {
        for (let i = 0; i < q.answer.length; i++) {
          const row = q.direction === 'down' ? q.position_y + i : q.position_y;
          const col = q.direction === 'across' ? q.position_x + i : q.position_x;
          if (row < level.rows && col < level.cols) {
            usedCells.add(`${row}-${col}`);
            grid[row][col].letter = q.answer[i];
            if (i === 0) {
              grid[row][col].number = q.number;
              if (q.direction === 'across') grid[row][col].acrossClue = q.id;
              else grid[row][col].downClue = q.id;
            }
          }
        }
      });

      // Sel yang TIDAK digunakan → jadi hitam
      for (let r = 0; r < level.rows; r++) {
        for (let c = 0; c < level.cols; c++) {
          if (!usedCells.has(`${r}-${c}`)) {
            grid[r][c].isBlack = true;
          }
        }
      }

      setQuestions(adaptedQuestions);
      setGrid(grid);
      setCurrentLevel(level);
      setUserAnswers({});
      setHintsUsed(0);
      setStartTime(new Date());
      setEndTime(null);
      setShowReview(false);
      setSelectedCell(null);
      setDirection('across');
      setPage('game');
    } catch (err) {
      setError('Gagal memuat soal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (row, col) => {
    if (grid[row]?.[col]?.isBlack) return;

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyDown = useCallback((e, row, col) => {
    if (!grid[row] || !grid[row][col] || grid[row][col].isBlack) return;

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      const newAnswers = { ...userAnswers };
      newAnswers[`${row}-${col}`] = e.key.toUpperCase();
      setUserAnswers(newAnswers);

      let nextRow = row, nextCol = col;
      if (direction === 'across') nextCol++;
      else nextRow++;

      if (
        nextRow < grid.length &&
        nextCol < grid[0]?.length &&
        !grid[nextRow]?.[nextCol]?.isBlack
      ) {
        setSelectedCell({ row: nextRow, col: nextCol });
        setTimeout(() => gridRefs.current[`${nextRow}-${nextCol}`]?.focus(), 0);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const newAnswers = { ...userAnswers };
      delete newAnswers[`${row}-${col}`];
      setUserAnswers(newAnswers);

      let prevRow = row, prevCol = col;
      if (direction === 'across') prevCol--;
      else prevRow--;

      if (
        prevRow >= 0 &&
        prevCol >= 0 &&
        !grid[prevRow]?.[prevCol]?.isBlack
      ) {
        setSelectedCell({ row: prevRow, col: prevCol });
        setTimeout(() => gridRefs.current[`${prevRow}-${prevCol}`]?.focus(), 0);
      }
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let newRow = row, newCol = col;
      if (e.key === 'ArrowRight') newCol++;
      else if (e.key === 'ArrowLeft') newCol--;
      else if (e.key === 'ArrowDown') newRow++;
      else if (e.key === 'ArrowUp') newRow--;

      if (
        newRow >= 0 &&
        newRow < grid.length &&
        newCol >= 0 &&
        newCol < grid[0]?.length &&
        !grid[newRow]?.[newCol]?.isBlack
      ) {
        setSelectedCell({ row: newRow, col: newCol });
        setTimeout(() => gridRefs.current[`${newRow}-${newCol}`]?.focus(), 0);
      }
    }
  }, [direction, grid, userAnswers]);

  const useHint = () => {
    if (hintsUsed >= 3) {
      setError('Hint sudah habis!');
      return;
    }
    if (!selectedCell) {
      setError('Pilih kotak terlebih dahulu!');
      return;
    }

    const currentWord = questions.find(q => {
      if (q.direction === direction) {
        if (direction === 'across') {
          return (
            selectedCell.row === q.position_y &&
            selectedCell.col >= q.position_x &&
            selectedCell.col < q.position_x + q.answer.length
          );
        } else {
          return (
            selectedCell.col === q.position_x &&
            selectedCell.row >= q.position_y &&
            selectedCell.row < q.position_y + q.answer.length
          );
        }
      }
      return false;
    });

    if (!currentWord) {
      setError('Tidak ada kata di posisi ini!');
      return;
    }

    const answer = currentWord.answer.toUpperCase();
    let usedHint = false;
    for (let i = 0; i < answer.length; i++) {
      const row = direction === 'down' ? currentWord.position_y + i : currentWord.position_y;
      const col = direction === 'across' ? currentWord.position_x + i : currentWord.position_x;
      const key = `${row}-${col}`;
      if (userAnswers[key] !== answer[i]) {
        const newAnswers = { ...userAnswers };
        newAnswers[key] = answer[i];
        setUserAnswers(newAnswers);
        setHintsUsed(hintsUsed + 1);
        usedHint = true;
        break;
      }
    }

    if (!usedHint) {
      setError('Semua huruf sudah benar!');
    }
  };

  const submitGame = async () => {
    if (!user || !user.id || !currentLevel?.id) {
      setError('User tidak dikenali. Silakan login ulang.');
      setPage('login');
      return;
    }

    const endTimeObj = new Date();
    setEndTime(endTimeObj);
    const duration = Math.floor((endTimeObj - startTime) / 1000);
    let correctWords = 0;
    const userAnswersList = [];

    for (const q of questions) {
      let userWord = '';
      for (let i = 0; i < q.answer.length; i++) {
        const row = q.direction === 'down' ? q.position_y + i : q.position_y;
        const col = q.direction === 'across' ? q.position_x + i : q.position_x;
        userWord += userAnswers[`${row}-${col}`] || '';
      }

      const isCorrect = userWord === q.answer;
      if (isCorrect) correctWords++;
      userAnswersList.push({
        user_id: user.id,
        puzzle_id: currentLevel.id,
        word_id: q.id,
        answer: userWord,
        is_correct: isCorrect,
      });
    }

    try {
      const { error } = await supabase.from('user_answers').insert(userAnswersList);
      if (error) throw error;
      setShowReview(true);
    } catch (err) {
      setError('Gagal menyimpan jawaban: ' + err.message);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Ambil dari view yang sudah di-agregasi
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('username, total_correct')
        .limit(10); // Ambil top 10
  
      if (error) throw error;
  
      // Format sesuai kebutuhan UI
      const leaderboardData = data.map((item, idx) => ({
        id: idx,
        username: item.username || 'Anonymous',
        total_correct: item.total_correct || 0
      }));
  
      setLeaderboard(leaderboardData);
      setPage('leaderboard');
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Gagal memuat leaderboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // === RENDERING ===

  if (page === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">QuizPlay</h1>
            <p className="text-gray-600">Teka Teki Silang</p>
          </div>

          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">{error}</div>}
          
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="w-full text-indigo-600 py-2 text-sm hover:underline"
              >
                Belum punya akun? Daftar di sini
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Daftar'}
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="w-full text-indigo-600 py-2 text-sm hover:underline"
              >
                Sudah punya akun? Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Sisa halaman (menu, levels, game, review, leaderboard) tetap seperti sebelumnya
  // Tapi tambahkan {error && <div className="text-red-500">{error}</div>} di tiap halaman

  if (page === 'menu') {
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
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-xl hover:shadow-lg transition flex flex-col items-center gap-4 disabled:opacity-50"
              >
                <Play size={48} />
                <span className="text-2xl font-bold">Mulai Main</span>
              </button>

              <button
                onClick={loadLeaderboard}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-8 rounded-xl hover:shadow-lg transition flex flex-col items-center gap-4 disabled:opacity-50"
              >
                <Trophy size={48} />
                <span className="text-2xl font-bold">Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'levels') {
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
  }

  if (page === 'game' && !showReview) {
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
                                    ? direction === 'across' 
                                      ? 'bg-blue-200 border-blue-500'
                                      : 'bg-green-200 border-green-500'
                                    : 'bg-white border-gray-400'
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
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">📝 MENDATAR</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {questions.filter(q => q.direction === 'across').map((q) => (
                      <div key={q.id} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <span className="font-bold text-indigo-600">{q.number}.</span> {q.clue}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">📝 MENURUN</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {questions.filter(q => q.direction === 'down').map((q) => (
                      <div key={q.id} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <span className="font-bold text-purple-600">{q.number}.</span> {q.clue}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setPage('levels')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Kembali
              </button>
              <button
                onClick={submitGame}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Selesai & Lihat Hasil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'game' && showReview) {
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
  }

  if (page === 'leaderboard') {
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
  }

  return null;
};

export default CrosswordGame;