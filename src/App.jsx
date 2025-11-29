import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Clock, User, LogOut, Play, RotateCcw, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

const supabaseUrl = 'https://xpdpbxzfxhixzmvcswsy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZHBieHpmeGhpeHptdmNzd3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTQwNTQsImV4cCI6MjA3OTI3MDA1NH0.2dpbe4Vk6PM1AY6PiIYGKmcZo5tcJxOD_4Jnras1mlg';
const supabase = createClient(supabaseUrl, supabaseKey);

const CrosswordGame = () => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [grid, setGrid] = useState([]);
  const [clues, setClues] = useState({ across: [], down: [] });
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

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle();
        
        if (userData) {
          setUser(userData);
          setPage('menu');
        }
      }
    } catch (error) {
      console.error('Check user error:', error);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      alert('Email dan password harus diisi!');
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      
      if (authError) throw authError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .maybeSingle();
      
      if (!userData) {
        const { data: newUser } = await supabase
          .from('users')
          .insert([{
            auth_id: authData.user.id,
            name: authData.user.email.split('@')[0],
            email: authData.user.email,
          }])
          .select()
          .single();
        setUser(newUser);
      } else {
        setUser(userData);
      }
      
      setPage('menu');
      alert('Login berhasil!');
    } catch (error) {
      alert('Login gagal: ' + error.message);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      alert('Semua field harus diisi!');
      return;
    }

    if (registerForm.password.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', registerForm.email)
        .maybeSingle();
      
      if (existingUser) {
        alert('Email sudah terdaftar! Silakan login.');
        setIsRegister(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });
      
      if (authError) throw authError;

      if (authData.user) {
        await supabase
          .from('users')
          .insert([{
            auth_id: authData.user.id,
            name: registerForm.name,
            email: registerForm.email,
          }]);
      }

      alert('Registrasi berhasil! Silakan login.');
      setIsRegister(false);
      setRegisterForm({ name: '', email: '', password: '' });
    } catch (error) {
      alert('Registrasi gagal: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage('login');
  };

  const loadLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('level_number');
      
      if (error) throw error;
      setLevels(data || []);
      setPage('levels');
    } catch (error) {
      alert('Gagal memuat level: ' + error.message);
    }
  };

  const generateGrid = (questions) => {
    // Find the minimum bounding box for all words
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    questions.forEach(q => {
      const x = q.position_x || 0;
      const y = q.position_y || 0;
      const len = q.answer.length;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      
      if (q.direction === 'across') {
        maxX = Math.max(maxX, x + len - 1);
        maxY = Math.max(maxY, y);
      } else {
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y + len - 1);
      }
    });
    
    // Add padding
    const padding = 0;
    const gridWidth = maxX - minX + 1 + padding * 2;
    const gridHeight = maxY - minY + 1 + padding * 2;
    const offsetX = minX - padding;
    const offsetY = minY - padding;
    
    // Create grid with exact size needed
    const newGrid = Array(gridHeight).fill(null).map(() => 
      Array(gridWidth).fill(null).map(() => ({ 
        letter: '', 
        isBlack: true, 
        number: null,
        correctLetter: '',
        acrossClue: null,
        downClue: null
      }))
    );

    // Place all words in grid
    questions.forEach(q => {
      const x = (q.position_x || 0) - offsetX;
      const y = (q.position_y || 0) - offsetY;
      const answer = q.answer.toUpperCase();

      if (q.direction === 'across') {
        for (let i = 0; i < answer.length; i++) {
          if (x + i < gridWidth && y < gridHeight) {
            newGrid[y][x + i].correctLetter = answer[i];
            newGrid[y][x + i].isBlack = false;
          }
        }
      } else {
        for (let i = 0; i < answer.length; i++) {
          if (x < gridWidth && y + i < gridHeight) {
            newGrid[y + i][x].correctLetter = answer[i];
            newGrid[y + i][x].isBlack = false;
          }
        }
      }
    });

    // Assign numbers to starting positions
    let clueNumber = 1;
    const numberMap = {};

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (newGrid[y][x].isBlack) continue;

        let needsNumber = false;

        // Check if this is the start of an across word
        const isAcrossStart = !newGrid[y][x].isBlack && 
          (x === 0 || newGrid[y][x - 1].isBlack) &&
          (x + 1 < gridWidth && !newGrid[y][x + 1].isBlack);

        // Check if this is the start of a down word
        const isDownStart = !newGrid[y][x].isBlack &&
          (y === 0 || newGrid[y - 1][x].isBlack) &&
          (y + 1 < gridHeight && !newGrid[y + 1][x].isBlack);

        if (isAcrossStart || isDownStart) {
          needsNumber = true;
        }

        if (needsNumber) {
          newGrid[y][x].number = clueNumber;
          const origX = x + offsetX;
          const origY = y + offsetY;
          numberMap[`${origY},${origX}`] = clueNumber;
          clueNumber++;
        }
      }
    }

    // Create clue lists with correct numbers
    const acrossClues = [];
    const downClues = [];

    questions.forEach(q => {
      const x = q.position_x || 0;
      const y = q.position_y || 0;
      const answer = q.answer.toUpperCase();
      const key = `${y},${x}`;
      const number = numberMap[key] || 0;

      if (q.direction === 'across') {
        acrossClues.push({ 
          number: number, 
          clue: q.clue, 
          answer: answer, 
          id: q.id,
          x: x - offsetX,
          y: y - offsetY
        });
      } else {
        downClues.push({ 
          number: number, 
          clue: q.clue, 
          answer: answer, 
          id: q.id,
          x: x - offsetX,
          y: y - offsetY
        });
      }
    });

    // Sort clues by number
    acrossClues.sort((a, b) => a.number - b.number);
    downClues.sort((a, b) => a.number - b.number);const startLevel = async (level) => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('level_id', level.id);
        
        if (error) throw error;
        if (!data || data.length === 0) {
          alert('Level ini belum ada soal.');
          return;
        }
    
        // ✅ OVERRIDE POSISI DAN DIREKSI SESUAI GRID YANG DIINGINKAN
        const correctedQuestions = data.map(q => {
          if (q.answer === 'JAKARTA') {
            return { ...q, position_x: 1, position_y: 2, direction: 'across' };
          }
          if (q.answer === 'MERKURIUS') {
            return { ...q, position_x: 0, position_y: 9, direction: 'across' };
          }
          if (q.answer === 'SOEKARNO') {
            return { ...q, position_x: 0, position_y: 0, direction: 'down' };
          }
          if (q.answer === 'KANGURU') {
            return { ...q, position_x: 0, position_y: 1, direction: 'down' };
          }
          if (q.answer === 'PINK') {
            return { ...q, position_x: 5, position_y: 5, direction: 'down' };
          }
          return q;
        });
    
        setCurrentLevel(level);
        generateGrid(correctedQuestions); // ✅ pakai data yang sudah diperbaiki
        setHintsUsed(0);
        setStartTime(new Date());
        setEndTime(null);
        setShowReview(false);
        setSelectedCell(null);
        setDirection('across');
        setPage('game');
      } catch (error) {
        alert('Gagal memuat soal: ' + error.message);
      }
    };

    setGrid(newGrid);
    setClues({ across: acrossClues, down: downClues });
  };

  const startLevel = async (level) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('level_id', level.id);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        alert('Level ini belum ada soal.');
        return;
      }
      
      setCurrentLevel(level);
      generateGrid(data);
      setHintsUsed(0);
      setStartTime(new Date());
      setEndTime(null);
      setShowReview(false);
      setSelectedCell(null);
      setDirection('across');
      setPage('game');
    } catch (error) {
      alert('Gagal memuat soal: ' + error.message);
    }
  };

  const handleCellClick = (row, col) => {
    if (grid[row][col].isBlack) return;
    
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setDirection(direction === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyPress = (e, row, col) => {
    if (grid[row][col].isBlack) return;

    const key = e.key.toUpperCase();
    
    if (/^[A-Z]$/.test(key)) {
      const newGrid = grid.map(r => r.map(c => ({...c})));
      newGrid[row][col].letter = key;
      setGrid(newGrid);

      // Move to next cell
      if (direction === 'across') {
        if (col + 1 < grid[0].length && !grid[row][col + 1].isBlack) {
          setSelectedCell({ row, col: col + 1 });
        }
      } else {
        if (row + 1 < grid.length && !grid[row + 1][col].isBlack) {
          setSelectedCell({ row: row + 1, col });
        }
      }
    } else if (e.key === 'Backspace') {
      const newGrid = grid.map(r => r.map(c => ({...c})));
      newGrid[row][col].letter = '';
      setGrid(newGrid);

      // Move to previous cell
      if (direction === 'across') {
        if (col - 1 >= 0 && !grid[row][col - 1].isBlack) {
          setSelectedCell({ row, col: col - 1 });
        }
      } else {
        if (row - 1 >= 0 && !grid[row - 1][col].isBlack) {
          setSelectedCell({ row: row - 1, col });
        }
      }
    }
  };

  const useHint = () => {
    if (hintsUsed >= 3) {
      alert('Hint sudah habis!');
      return;
    }

    if (!selectedCell) {
      alert('Pilih sel terlebih dahulu!');
      return;
    }

    const { row, col } = selectedCell;
    const newGrid = grid.map(r => r.map(c => ({...c})));
    newGrid[row][col].letter = newGrid[row][col].correctLetter;
    setGrid(newGrid);
    setHintsUsed(hintsUsed + 1);
  };

  const submitGame = async () => {
    if (!user || !user.id) {
      alert('User tidak terdeteksi. Silakan login ulang.');
      setPage('login');
      return;
    }

    const end = new Date();
    setEndTime(end);
    
    const duration = Math.floor((end - startTime) / 1000);
    let correctCount = 0;
    let totalCells = 0;

    grid.forEach(row => {
      row.forEach(cell => {
        if (!cell.isBlack && cell.correctLetter) {
          totalCells++;
          if (cell.letter === cell.correctLetter) {
            correctCount++;
          }
        }
      });
    });

    const score = Math.floor((correctCount / totalCells) * 100);

    try {
      await supabase.from('game_sessions').insert([{
        user_id: user.id,
        level_id: currentLevel.id,
        score: score,
        duration: duration,
        hints_used: hintsUsed,
        correct_answers: correctCount,
        total_questions: totalCells,
      }]);

      await supabase.from('leaderboard').insert([{
        user_id: user.id,
        level_id: currentLevel.id,
        score: score,
        duration: duration,
      }]);
    } catch (error) {
      console.error('Error saving game:', error);
    }

    setShowReview(true);
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          *,
          users (name),
          levels (level_name)
        `)
        .order('score', { ascending: false })
        .order('duration', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      setLeaderboard(data || []);
      setPage('leaderboard');
    } catch (error) {
      alert('Gagal memuat leaderboard: ' + error.message);
    }
  };

  // LOGIN PAGE
  if (page === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">QuizPlay</h1>
            <p className="text-gray-600">Teka Teki Silang Edukatif</p>
          </div>

          {!isRegister ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
                Login
              </button>
              <button onClick={() => setIsRegister(true)} className="w-full text-indigo-600 py-2 text-sm hover:underline">
                Belum punya akun? Daftar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              <button onClick={handleRegister} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
                Daftar
              </button>
              <button onClick={() => setIsRegister(false)} className="w-full text-indigo-600 py-2 text-sm hover:underline">
                Sudah punya akun? Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN MENU
  if (page === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">QuizPlay TTS</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-2">
                  <User size={18} />
                  {user?.name || 'User'}
                </p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                <LogOut size={18} />
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={loadLevels} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-xl hover:shadow-lg flex flex-col items-center gap-4">
                <Play size={48} />
                <span className="text-2xl font-bold">Mulai Main</span>
              </button>

              <button onClick={loadLeaderboard} className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-8 rounded-xl hover:shadow-lg flex flex-col items-center gap-4">
                <Trophy size={48} />
                <span className="text-2xl font-bold">Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LEVEL SELECTION
  if (page === 'levels') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-indigo-600">Pilih Level</h2>
              <button onClick={() => setPage('menu')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Kembali
              </button>
            </div>

            {levels.length === 0 ? (
              <div className="text-center text-gray-500 py-12">Belum ada level</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => startLevel(level)}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">Level {level.level_number}</div>
                    <div className="text-lg">{level.level_name}</div>
                    <div className="text-sm mt-2 opacity-90">{level.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GAME PAGE WITH GRID
  if (page === 'game' && !showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-600">{currentLevel?.level_name}</h2>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" size={20} />
                  <span className="font-semibold">{3 - hintsUsed} Hint</span>
                </div>
                <button onClick={useHint} disabled={hintsUsed >= 3} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300">
                  Gunakan Hint
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* GRID */}
              <div className="lg:col-span-2">
                <div className="inline-block bg-gray-100 p-4 rounded-lg">
                  {grid.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex">
                      {row.map((cell, colIdx) => (
                        <div
                          key={colIdx}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                          className={`w-8 h-8 border border-gray-400 flex items-center justify-center relative cursor-pointer
                            ${cell.isBlack ? 'bg-gray-800' : 'bg-white'}
                            ${selectedCell?.row === rowIdx && selectedCell?.col === colIdx ? 'ring-2 ring-blue-500' : ''}
                          `}
                        >
                          {cell.number && !cell.isBlack && (
                            <span className="absolute top-0 left-0 text-xs font-bold text-gray-600">{cell.number}</span>
                          )}
                          {!cell.isBlack && (
                            <input
                              type="text"
                              maxLength={1}
                              value={cell.letter}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                if (/^[A-Z]?$/.test(val)) {
                                  const newGrid = grid.map(r => r.map(c => ({...c})));
                                  newGrid[rowIdx][colIdx].letter = val;
                                  setGrid(newGrid);
                                }
                              }}
                              onKeyDown={(e) => handleKeyPress(e, rowIdx, colIdx)}
                              className="w-full h-full text-center font-bold text-lg bg-transparent border-none outline-none uppercase"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* CLUES */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h3 className="font-bold text-lg mb-2 text-indigo-600">Mendatar</h3>
                  {clues.across.map(clue => (
                    <div key={clue.number} className="mb-2 text-sm">
                      <span className="font-bold">{clue.number}.</span> {clue.clue}
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-purple-600">Menurun</h3>
                  {clues.down.map(clue => (
                    <div key={clue.number} className="mb-2 text-sm">
                      <span className="font-bold">{clue.number}.</span> {clue.clue}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setPage('levels')} className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Kembali
              </button>
              <button onClick={submitGame} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                Selesai & Lihat Hasil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW PAGE
  if (page === 'game' && showReview) {
    let correctCount = 0;
    let totalCells = 0;

    grid.forEach(row => {
      row.forEach(cell => {
        if (!cell.isBlack && cell.correctLetter) {
          totalCells++;
          if (cell.letter === cell.correctLetter) {
            correctCount++;
          }
        }
      });
    });

    const score = Math.floor((correctCount / totalCells) * 100);
    const duration = Math.floor((endTime - startTime) / 1000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Hasil Permainan</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">Skor</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{correctCount}/{totalCells}</div>
                <div className="text-sm text-gray-600">Benar</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{duration}s</div>
                <div className="text-sm text-gray-600">Waktu</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-4">Grid Jawaban:</h3>
              <div className="inline-block bg-gray-100 p-4 rounded-lg">
                {grid.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex">
                    {row.map((cell, colIdx) => (
                      <div
                        key={colIdx}
                        className={`w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold relative
                          ${cell.isBlack ? 'bg-gray-800' : 
                            cell.letter === cell.correctLetter ? 'bg-green-200' : 
                            cell.letter ? 'bg-red-200' : 'bg-white'}
                        `}
                      >
                        {cell.number && !cell.isBlack && (
                          <span className="absolute top-0 left-0 text-xs">{cell.number}</span>
                        )}
                        {!cell.isBlack && cell.correctLetter}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setPage('levels')} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                Pilih Level Lain
              </button>
              <button onClick={() => startLevel(currentLevel)} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2">
                <RotateCcw size={20} />
                Main Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LEADERBOARD PAGE
  if (page === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
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

            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                    idx === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                    idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                    'bg-gray-100'
                  }`}
                >
                  <div className={`text-2xl font-bold w-12 text-center ${idx > 2 ? 'text-gray-600' : ''}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${idx > 2 ? 'text-gray-800' : ''}`}>
                      {entry.users?.name || 'Unknown'}
                    </div>
                    <div className={`text-sm ${idx > 2 ? 'text-gray-600' : 'opacity-90'}`}>
                      {entry.levels?.level_name || 'Level'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${idx > 2 ? 'text-indigo-600' : ''}`}>
                      {entry.score} poin
                    </div>
                    <div className={`text-sm flex items-center gap-1 justify-end ${idx > 2 ? 'text-gray-600' : 'opacity-90'}`}>
                      <Clock size={14} />
                      {entry.duration}s
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                Belum ada data leaderboard. Mulai bermain untuk masuk leaderboard!
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