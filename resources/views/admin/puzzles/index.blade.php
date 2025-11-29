@extends('layouts.app')

@section('title', 'Manage Puzzles')

@section('content')
<div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-800">Manage Puzzles</h1>
    <a href="{{ route('admin.puzzles.create') }}" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
        <i class="fas fa-plus"></i> Create New Puzzle
    </a>
</div>

<div class="bg-white rounded-lg shadow-md">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Title</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Size</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Words</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                @forelse($puzzles as $puzzle)
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">#{{ $puzzle->id }}</td>
                    <td class="px-6 py-4 font-semibold">{{ $puzzle->title }}</td>
                    <td class="px-6 py-4">{{ $puzzle->rows }}x{{ $puzzle->cols }}</td>
                    <td class="px-6 py-4">
                        <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                            {{ $puzzle->words_count }} words
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex space-x-2">
                            <a href="{{ route('admin.puzzles.edit', $puzzle->id) }}" 
                               class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                            <form action="{{ route('admin.puzzles.delete', $puzzle->id) }}" 
                                  method="POST" 
                                  onsubmit="return confirm('Are you sure you want to delete this puzzle?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center">
                        <i class="fas fa-puzzle-piece text-gray-300 text-6xl mb-4"></i>
                        <p class="text-gray-500 text-lg">No puzzles found</p>
                        <a href="{{ route('admin.puzzles.create') }}" class="text-indigo-600 hover:underline">
                            Create your first puzzle
                        </a>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    
    @if($puzzles->hasPages())
    <div class="px-6 py-4 border-t">
        {{ $puzzles->links() }}
    </div>
    @endif
</div>
@endsection