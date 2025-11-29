@extends('layouts.app')

@section('title', 'Create New Puzzle')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.puzzles') }}" class="text-indigo-600 hover:underline">
        <i class="fas fa-arrow-left"></i> Back to Puzzles
    </a>
</div>

<div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Create New Puzzle</h1>

    <form action="{{ route('admin.puzzles.store') }}" method="POST">
        @csrf

        <div class="mb-4">
            <label class="block text-gray-700 font-semibold mb-2">Puzzle Title *</label>
            <input 
                type="text" 
                name="title" 
                value="{{ old('title') }}"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 @error('title') border-red-500 @enderror"
                placeholder="e.g., Daily Crossword - Easy"
                required
            >
            @error('title')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
            @enderror
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
                <label class="block text-gray-700 font-semibold mb-2">Rows (Height) *</label>
                <input 
                    type="number" 
                    name="rows" 
                    value="{{ old('rows', 10) }}"
                    min="3" 
                    max="20"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 @error('rows') border-red-500 @enderror"
                    required
                >
                @error('rows')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label class="block text-gray-700 font-semibold mb-2">Columns (Width) *</label>
                <input 
                    type="number" 
                    name="cols" 
                    value="{{ old('cols', 10) }}"
                    min="3" 
                    max="20"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 @error('cols') border-red-500 @enderror"
                    required
                >
                @error('cols')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-blue-800">
                <i class="fas fa-info-circle"></i> 
                After creating the puzzle, you'll be able to add words and clues.
            </p>
        </div>

        <div class="flex space-x-4">
            <button 
                type="submit" 
                class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
                <i class="fas fa-save"></i> Create Puzzle
            </button>
            <a 
                href="{{ route('admin.puzzles') }}" 
                class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
                Cancel
            </a>
        </div>
    </form>
</div>
@endsection