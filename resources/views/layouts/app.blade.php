<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Crossword Admin')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="{{ route('admin.dashboard') }}" class="text-xl font-bold text-indigo-600">
                        <i class="fas fa-puzzle-piece"></i> Crossword Admin
                    </a>
                </div>
                
                @auth
                <div class="flex items-center space-x-4">
                    <a href="{{ route('admin.dashboard') }}" class="text-gray-700 hover:text-indigo-600">
                        <i class="fas fa-home"></i> Dashboard
                    </a>
                    <a href="{{ route('admin.puzzles') }}" class="text-gray-700 hover:text-indigo-600">
                        <i class="fas fa-puzzle-piece"></i> Puzzles
                    </a>
                    <a href="{{ route('admin.users') }}" class="text-gray-700 hover:text-indigo-600">
                        <i class="fas fa-users"></i> Users
                    </a>
                    <div class="border-l pl-4">
                        <span class="text-gray-600">{{ auth()->user()->username }}</span>
                        <form action="{{ route('logout') }}" method="POST" class="inline">
                            @csrf
                            <button type="submit" class="ml-2 text-red-600 hover:text-red-800">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </form>
                    </div>
                </div>
                @endauth
            </div>
        </div>
    </nav>

    <!-- Content -->
    <main class="max-w-7xl mx-auto py-6 px-4">
        @if(session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ session('error') }}
            </div>
        @endif

        @yield('content')
    </main>

    <script>
        // Auto hide alerts after 3 seconds
        setTimeout(() => {
            document.querySelectorAll('.bg-green-100, .bg-red-100').forEach(el => {
                el.style.transition = 'opacity 0.5s';
                el.style.opacity = '0';
                setTimeout(() => el.remove(), 500);
            });
        }, 3000);
    </script>
</body>
</html>