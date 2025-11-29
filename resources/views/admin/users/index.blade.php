@extends('layouts.app')

@section('title', 'Manage Users')

@section('content')
<div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800">Manage Users</h1>
    <p class="text-gray-600">View all registered users and their statistics</p>
</div>

<div class="bg-white rounded-lg shadow-md">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Username</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total Answers</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Correct Answers</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Accuracy</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Joined</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($users as $user)
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">#{{ $user->id }}</td>
                    <td class="px-6 py-4 font-semibold">{{ $user->username }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ $user->email }}</td>
                    <td class="px-6 py-4">
                        @if($user->role === 'admin')
                            <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                                <i class="fas fa-crown"></i> Admin
                            </span>
                        @else
                            <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                User
                            </span>
                        @endif
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {{ $user->answers_count }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {{ $user->correct_answers_count }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        @if($user->answers_count > 0)
                            @php
                                $accuracy = ($user->correct_answers_count / $user->answers_count) * 100;
                            @endphp
                            <span class="font-semibold {{ $accuracy >= 80 ? 'text-green-600' : ($accuracy >= 50 ? 'text-yellow-600' : 'text-red-600') }}">
                                {{ number_format($accuracy, 1) }}%
                            </span>
                        @else
                            <span class="text-gray-400">N/A</span>
                        @endif
                    </td>
                    <td class="px-6 py-4 text-gray-600">
                        {{ $user->created_at->format('M d, Y') }}
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center">
                        <i class="fas fa-users text-gray-300 text-6xl mb-4"></i>
                        <p class="text-gray-500 text-lg">No users found</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    @if($users->hasPages())
    <div class="px-6 py-4 border-t">
        {{ $users->links() }}
    </div>
    @endif
</div>

<!-- User Stats Summary -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm mb-2">Total Users</h3>
        <p class="text-3xl font-bold text-indigo-600">{{ $users->total() }}</p>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm mb-2">Active Today</h3>
        <p class="text-3xl font-bold text-green-600">
            {{ $users->filter(fn($u) => $u->created_at->isToday())->count() }}
        </p>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-500 text-sm mb-2">This Week</h3>
        <p class="text-3xl font-bold text-purple-600">
            {{ $users->filter(fn($u) => $u->created_at->isCurrentWeek())->count() }}
        </p>
    </div>
</div>
@endsection