import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Clock, User, LogOut, Play, RotateCcw, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

// Konfigurasi Supabase - GANTI DENGAN CREDENTIALS KAMU
const supabaseUrl = 'https://xpdpbxzfxhixzmvcswsy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZHBieHpmeGhpeHptdmNzd3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTQwNTQsImV4cCI6MjA3OTI3MDA1NH0.2dpbe4Vk6PM1AY6PiIYGKmcZo5tcJxOD_4Jnras1mlg';
const supabase = createClient(supabaseUrl, supabaseKey);

const CrosswordGame = () => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
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
      console.log('Session check:', session);
      
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle();
        
        console.log('User data:', userData, 'Error:', error);
        
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
      console.log('Attempting login...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      
      if (authError) throw authError;
      
      console.log('Auth success:', authData);

      // Ambil user dari database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .maybeSingle();
      
      console.log('User data retrieved:', userData, 'Error:', userError);
      
      if (userError) throw userError;
      
      if (!userData) {
        // User belum ada di tabel users, buat baru
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            auth_id: authData.user.id,
            name: authData.user.email.split('@')[0],
            email: authData.user.email,
          }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        setUser(newUser);
      } else {
        setUser(userData);
      }
      
      setPage('menu');
      alert('Login berhasil!');
    } catch (error) {
      console.error('Login error:', error);
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
      console.log('Attempting registration...');
      
      // 1. Cek apakah email sudah terdaftar
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

      // 2. Buat auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });
      
      if (authError) throw authError;
      
      console.log('Auth user created:', authData);

      // 3. Insert ke tabel users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          auth_id: authData.user.id,
          name: registerForm.name,
          email: registerForm.email,
        }])
        .select()
        .single();

      if (userError) {
        console.error('Error insert user:', userError);
        throw userError;
      }

      console.log('User data inserted:', userData);
      alert('Registrasi berhasil! Silakan login.');
      setIsRegister(false);
      setRegisterForm({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Registration error:', error);
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
      console.log('Levels loaded:', data);
      setLevels(data || []);
      setPage('levels');
    } catch (error) {
      console.error('Error loading levels:', error);
      alert('Gagal memuat level: ' + error.message);
    }
  };

  const startLevel = async (level) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('level_id', level.id)
        .limit(5);
      
      if (error) throw error;
      console.log('Questions loaded:', data);
      
      if (!data || data.length === 0) {
        alert('Level ini belum ada soal. Silakan pilih level lain atau hubungi admin.');
        return;
      }
      
      setQuestions(data);
      setCurrentLevel(level);
      setAnswers({});
      setHintsUsed(0);
      setStartTime(new Date());
      setEndTime(null);
      setShowReview(false);
      setPage('game');
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Gagal memuat soal: ' + error.message);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value.toUpperCase() });
  };

  const useHint = (questionId) => {
    if (hintsUsed >= 3) {
      alert('Hint sudah habis!');
      return;
    }
    
    const question = questions.find(q => q.id === questionId);
    if (question && question.answer) {
      const currentAnswer = answers[questionId] || '';
      const correctAnswer = question.answer.toUpperCase();
      
      for (let i = 0; i < correctAnswer.length; i++) {
        if (!currentAnswer[i] || currentAnswer[i] !== correctAnswer[i]) {
          const newAnswer = currentAnswer.substring(0, i) + correctAnswer[i] + currentAnswer.substring(i + 1);
          setAnswers({ ...answers, [questionId]: newAnswer });
          setHintsUsed(hintsUsed + 1);
          break;
        }
      }
    }
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
    
    questions.forEach(q => {
      if (answers[q.id]?.toUpperCase() === q.answer.toUpperCase()) {
        correctCount++;
      }
    });

    const score = correctCount * 20;

    console.log('Submitting game:', {
      user_id: user.id,
      level_id: currentLevel.id,
      score,
      duration,
      hintsUsed,
      correctCount,
    });

    try {
      // Simpan game session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert([{
          user_id: user.id,
          level_id: currentLevel.id,
          score: score,
          duration: duration,
          hints_used: hintsUsed,
          correct_answers: correctCount,
          total_questions: questions.length,
        }])
        .select();

      if (sessionError) {
        console.error('Error saving session:', sessionError);
        throw sessionError;
      }
      
      console.log('Session saved:', sessionData);

      // Simpan ke leaderboard
      const { data: leaderData, error: leaderError } = await supabase
        .from('leaderboard')
        .insert([{
          user_id: user.id,
          level_id: currentLevel.id,
          score: score,
          duration: duration,
        }])
        .select();

      if (leaderError) {
        console.error('Error saving leaderboard:', leaderError);
        throw leaderError;
      }
      
      console.log('Leaderboard saved:', leaderData);
      
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Gagal menyimpan hasil game: ' + error.message);
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
      console.log('Leaderboard loaded:', data);
      setLeaderboard(data || []);
      setPage('leaderboard');
    } catch (error) {
      console.error('Error loading leaderboard:', error);
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <button 
                onClick={handleLogin}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className="w-full text-indigo-600 py-2 text-sm hover:underline"
              >
                Belum punya akun? Daftar di sini
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <button 
                onClick={handleRegister}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Daftar
              </button>
              <button
                onClick={() => {
                  setIsRegister(false);
                  setRegisterForm({ name: '', email: '', password: '' });
                }}
                className="w-full text-indigo-600 py-2 text-sm hover:underline"
              >
                Sudah punya akun? Login di sini
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut size={18} />
                Logout
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
  }

  // LEVEL SELECTION
  if (page === 'levels') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-indigo-600">Pilih Level</h2>
              <button
                onClick={() => setPage('menu')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Kembali
              </button>
            </div>

            {levels.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-xl mb-4">Belum ada level tersedia.</p>
                <p>Silakan hubungi admin untuk menambahkan level dan soal.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => startLevel(level)}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:shadow-lg transition"
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

  // GAME PAGE
  if (page === 'game' && !showReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-600">
                {currentLevel?.level_name}
              </h2>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-700">
                  <Lightbulb size={20} className="text-yellow-500" />
                  <span className="font-semibold">{3 - hintsUsed} Hint</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-indigo-600 mb-2">
                        {idx + 1}. {q.direction === 'across' ? 'MENDATAR' : 'MENURUN'}
                      </div>
                      <p className="text-gray-700">{q.clue}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        ({q.answer.length} huruf)
                      </p>
                    </div>
                    <button
                      onClick={() => useHint(q.id)}
                      disabled={hintsUsed >= 3}
                      className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      <Lightbulb size={18} />
                      Hint
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={q.answer.length}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg text-2xl font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`${'_'.repeat(q.answer.length)}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  if (confirm('Yakin ingin kembali? Progress akan hilang.')) {
                    setPage('levels');
                  }
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Kembali
              </button>
              <button
                onClick={submitGame}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg"
              >
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
    const correctCount = questions.filter(q => 
      answers[q.id]?.toUpperCase() === q.answer.toUpperCase()
    ).length;
    const score = correctCount * 20;
    const duration = Math.floor((endTime - startTime) / 1000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-indigo-600 mb-4">Hasil Permainan</h2>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Skor</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{correctCount}/{questions.length}</div>
                  <div className="text-sm text-gray-600">Benar</div>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{duration}s</div>
                  <div className="text-sm text-gray-600">Waktu</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-gray-700">Review Jawaban:</h3>
              {questions.map((q, idx) => {
                const isCorrect = answers[q.id]?.toUpperCase() === q.answer.toUpperCase();
                return (
                  <div key={q.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                      ) : (
                        <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-700 mb-1">
                          {idx + 1}. {q.clue}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Jawaban Kamu: </span>
                            <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {answers[q.id] || '(tidak dijawab)'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-gray-600">Jawaban Benar: </span>
                              <span className="font-bold text-green-600">{q.answer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setPage('levels')}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Pilih Level Lain
              </button>
              <button
                onClick={() => startLevel(currentLevel)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
              >
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