<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crossword TTS - Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation {
            animation: float 3s ease-in-out infinite;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 min-h-screen">
    <!-- Navigation -->
    <nav class="absolute top-0 w-full px-8 py-6 flex justify-between items-center z-10">
        <div class="text-white text-2xl font-bold">
            <i class="fas fa-puzzle-piece"></i> Crossword TTS
        </div>
        <div class="space-x-4">
            <a href="{{ route('login') }}" class="text-white hover:text-gray-200 font-semibold">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
            <a href="{{ route('register') }}" class="bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
                Get Started
            </a>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="container mx-auto px-4 min-h-screen flex items-center">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <!-- Left Content -->
            <div class="text-white space-y-6">
                <div class="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                    <i class="fas fa-star text-yellow-300"></i> Admin Dashboard
                </div>
                
                <h1 class="text-5xl lg:text-6xl font-bold leading-tight">
                    Manage Your<br>
                    <span class="text-yellow-300">Crossword Puzzles</span><br>
                    With Ease
                </h1>
                
                <p class="text-xl text-gray-100 leading-relaxed">
                    Powerful admin panel to create, manage, and monitor your crossword puzzle games. 
                    Track users, manage content, and analyze performance all in one place.
                </p>
                
                <div class="flex space-x-4 pt-4">
                    <a href="{{ route('login') }}" class="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                        <i class="fas fa-sign-in-alt"></i> Login Now
                    </a>
                    <a href="#features" class="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition">
                        Learn More
                    </a>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-6 pt-8">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-yellow-300">∞</div>
                        <div class="text-sm text-gray-200">Unlimited Puzzles</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-yellow-300">⚡</div>
                        <div class="text-sm text-gray-200">Fast & Easy</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-yellow-300">📊</div>
                        <div class="text-sm text-gray-200">Analytics</div>
                    </div>
                </div>
            </div>

            <!-- Right Content - Animated Puzzle -->
            <div class="relative hidden lg:block">
                <div class="float-animation">
                    <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                        <!-- Mockup Crossword Grid -->
                        <div class="grid grid-cols-5 gap-2 mb-6">
                            @for($i = 0; $i < 25; $i++)
                                <div class="w-16 h-16 {{ $i % 7 == 0 ? 'bg-gray-800' : 'bg-white' }} rounded-lg flex items-center justify-center text-2xl font-bold text-gray-800">
                                    @if($i % 7 != 0)
                                        {{ chr(65 + ($i % 26)) }}
                                    @endif
                                </div>
                            @endfor
                        </div>
                        
                        <!-- Mockup Stats -->
                        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 space-y-2">
                            <div class="flex justify-between text-white">
                                <span><i class="fas fa-puzzle-piece"></i> Active Puzzles</span>
                                <span class="font-bold">24</span>
                            </div>
                            <div class="flex justify-between text-white">
                                <span><i class="fas fa-users"></i> Total Users</span>
                                <span class="font-bold">1,234</span>
                            </div>
                            <div class="flex justify-between text-white">
                                <span><i class="fas fa-check-circle"></i> Completed</span>
                                <span class="font-bold">5,678</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Floating Elements -->
                <div class="absolute -top-10 -right-10 bg-yellow-400 w-24 h-24 rounded-full opacity-20 blur-2xl"></div>
                <div class="absolute -bottom-10 -left-10 bg-pink-400 w-32 h-32 rounded-full opacity-20 blur-2xl"></div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="bg-white py-20">
        <div class="container mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
                <p class="text-xl text-gray-600">Everything you need to manage your crossword game</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl hover:shadow-xl transition">
                    <div class="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-puzzle-piece text-white text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-3">Puzzle Management</h3>
                    <p class="text-gray-600">
                        Create, edit, and delete puzzles with ease. Add words, clues, and manage grid layouts effortlessly.
                    </p>
                </div>

                <!-- Feature 2 -->
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl hover:shadow-xl transition">
                    <div class="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-users text-white text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-3">User Analytics</h3>
                    <p class="text-gray-600">
                        Track user performance, view statistics, and monitor engagement with detailed analytics.
                    </p>
                </div>

                <!-- Feature 3 -->
                <div class="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl hover:shadow-xl transition">
                    <div class="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-chart-line text-white text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-3">Leaderboard</h3>
                    <p class="text-gray-600">
                        Real-time leaderboard system to track top performers and encourage competition.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p class="text-xl text-gray-100 mb-8">Join now and start managing your crossword puzzles today!</p>
            <div class="flex justify-center space-x-4">
                <a href="{{ route('register') }}" class="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                    <i class="fas fa-user-plus"></i> Sign Up Free
                </a>
                <a href="{{ route('login') }}" class="bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="bg-gray-900 py-8">
        <div class="container mx-auto px-4 text-center text-gray-400">
            <p>&copy; 2024 Crossword TTS. All rights reserved.</p>
            <p class="mt-2">Made with <i class="fas fa-heart text-red-500"></i> for puzzle lovers</p>
        </div>
    </div>
</body>
</html>