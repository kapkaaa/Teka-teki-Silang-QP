@extends('layouts.app')

@section('title', 'Admin Dashboard')

@section('content')
<div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
    <p class="text-gray-600">Welcome back, {{ auth()->user()->username }}!</p>
</div>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Total Puzzles</p>
                <h3 class="text-3xl font-bold text-indigo-600">{{ $stats['total_puzzles'] }}</h3>
            </div>
            <div class="bg-indigo-100 p-4 rounded-full">
                <i class="fas fa-puzzle-piece text-indigo-600 text-2xl"></i>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Total Users</p>
                <h3 class="text-3xl font-bold text-green-600">{{ $stats['total_users'] }}</h3>
            </div>
            <div class="bg-green-100 p-4 rounded-full">
                <i class="fas fa-users text-green-600 text-2xl"></i>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Total Words</p>
                <h3 class="text-3xl font-bold text-purple-600">{{ $stats['total_words'] }}</h3>
            </div>
            <div class="bg-purple-100 p-4 rounded-full">
                <i class="fas fa-font text-purple-600 text-2xl"></i>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-gray-500 text-sm">Quick Actions</p>
                <a href="{{ route('admin.puzzles.create') }}" class="text-blue-600 hover:underline text-sm">
                    + New Puzzle
                </a>
            </div>
            <div class="bg-blue-100 p-4 rounded-full">
                <i class="fas fa-plus text-blue-600 text-2xl"></i>
            </div>
        </div>
    </div>
</div>

<!-- Recent Puzzles -->
<div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Recent Puzzles</h2>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Title</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Size</th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($stats['recent_puzzles'] as $puzzle)
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">{{ $puzzle->title }}</td>
                    <td class="px-4 py-3">{{ $puzzle->rows }}x{{ $puzzle->cols }}</td>
                    <td class="px-4 py-3">
                        <a href="{{ route('admin.puzzles.edit', $puzzle->id) }}" class="text-indigo-600 hover:underline">
                            Edit
                        </a>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                        No puzzles yet. <a href="{{ route('admin.puzzles.create') }}" class="text-indigo-600">Create one now!</a>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection