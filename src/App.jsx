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

// Components
import Login from './components/Login';
import Menu from './components/Menu';
import Levels from './components/Levels';
import Game from './components/Game';
import Review from './components/Review';
import Leaderboard from './components/Leaderboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // Penanganan untuk keyboard fisik
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
        setTimeout(() => {
          const nextElement = gridRefs.current[`${nextRow}-${nextCol}`];
          if (nextElement) {
            nextElement.value = ''; // Kosongkan nilai sebelum fokus
            nextElement.focus();
          }
        }, 0);
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
        setTimeout(() => {
          const prevElement = gridRefs.current[`${prevRow}-${prevCol}`];
          if (prevElement) {
            prevElement.value = ''; // Kosongkan nilai sebelum fokus
            prevElement.focus();
          }
        }, 0);
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
        setTimeout(() => {
          const nextElement = gridRefs.current[`${newRow}-${newCol}`];
          if (nextElement) {
            nextElement.value = ''; // Kosongkan nilai sebelum fokus
            nextElement.focus();
          }
        }, 0);
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
      // Ambil dari view yang sudah di-aggregasi
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
      <Login
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        isRegister={isRegister}
        setIsRegister={setIsRegister}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        error={error}
        loading={loading}
      />
    );
  }

  if (page === 'menu') {
    return (
      <Menu
        user={user}
        handleLogout={handleLogout}
        loadLevels={loadLevels}
        loadLeaderboard={loadLeaderboard}
        error={error}
      />
    );
  }

  if (page === 'levels') {
    return (
      <Levels
        levels={levels}
        startLevel={startLevel}
        loading={loading}
        error={error}
        setPage={setPage}
      />
    );
  }

  if (page === 'game' && !showReview) {
    return (
      <Game
        grid={grid}
        userAnswers={userAnswers}
        selectedCell={selectedCell}
        direction={direction}
        currentLevel={currentLevel}
        hintsUsed={hintsUsed}
        error={error}
        gridRefs={gridRefs}
        handleKeyDown={handleKeyDown}
        handleCellClick={handleCellClick}
        useHint={useHint}
        submitGame={submitGame}
        questions={questions}
        setPage={setPage}
      />
    );
  }

  if (page === 'game' && showReview) {
    return (
      <Review
        questions={questions}
        userAnswers={userAnswers}
        startTime={startTime}
        endTime={endTime}
        currentLevel={currentLevel}
        setPage={setPage}
        startLevel={startLevel}
      />
    );
  }

  if (page === 'leaderboard') {
    return (
      <Leaderboard
        leaderboard={leaderboard}
        loading={loading}
        error={error}
        setPage={setPage}
      />
    );
  }

  return null;
};

export default CrosswordGame;