@extends('layouts.app')

@section('title', 'Edit Puzzle')

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.puzzles') }}" class="text-indigo-600 hover:underline">
        <i class="fas fa-arrow-left"></i> Back to Puzzles
    </a>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Puzzle Info -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Puzzle Information</h2>
        
        <form action="{{ route('admin.puzzles.update', $puzzle->id) }}" method="POST">
            @csrf
            @method('PUT')

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Title</label>
                <input 
                    type="text" 
                    name="title" 
                    value="{{ old('title', $puzzle->title) }}"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                >
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Rows</label>
                    <input 
                        type="number" 
                        name="rows" 
                        value="{{ old('rows', $puzzle->rows) }}"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="3" 
                        max="20"
                        required
                    >
                </div>

                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Columns</label>
                    <input 
                        type="number" 
                        name="cols" 
                        value="{{ old('cols', $puzzle->cols) }}"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="3" 
                        max="20"
                        required
                    >
                </div>
            </div>

            <button 
                type="submit" 
                class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
                <i class="fas fa-save"></i> Update Puzzle Info
            </button>
        </form>
    </div>

    <!-- Add Word Form -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Add New Word</h2>
        
        <form action="{{ route('admin.puzzles.words.add', $puzzle->id) }}" method="POST">
            @csrf

            <div class="mb-3">
                <label class="block text-gray-700 font-semibold mb-2">Number</label>
                <input 
                    type="number" 
                    name="number" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="1"
                    required
                >
            </div>

            <div class="mb-3">
                <label class="block text-gray-700 font-semibold mb-2">Answer (Word)</label>
                <input 
                    type="text" 
                    name="answer" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="CAT"
                    required
                >
            </div>

            <div class="mb-3">
                <label class="block text-gray-700 font-semibold mb-2">Clue</label>
                <textarea 
                    name="clue" 
                    rows="2"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="A common household pet"
                    required
                ></textarea>
            </div>

            <div class="mb-3">
                <label class="block text-gray-700 font-semibold mb-2">Direction</label>
                <select 
                    name="direction" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                >
                    <option value="across">Across (→)</option>
                    <option value="down">Down (↓)</option>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Start Row</label>
                    <input 
                        type="number" 
                        name="start_row" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                        min="0"
                        required
                    >
                </div>

                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Start Col</label>
                    <input 
                        type="number" 
                        name="start_col" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                        min="0"
                        required
                    >
                </div>
            </div>

            <button 
                type="submit" 
                class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
                <i class="fas fa-plus"></i> Add Word
            </button>
        </form>
    </div>
</div>

<!-- Words List -->
<div class="bg-white rounded-lg shadow-md p-6 mt-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Words in This Puzzle</h2>
    
    @if($puzzle->words->count() > 0)
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">#</th>
                        <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Answer</th>
                        <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Clue</th>
                        <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Direction</th>
                        <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Position</th>
                        <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    @foreach($puzzle->words as $word)
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3">{{ $word->number }}</td>
                        <td class="px-4 py-3 font-bold text-indigo-600">{{ $word->answer }}</td>
                        <td class="px-4 py-3">{{ Str::limit($word->clue, 50) }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded text-sm {{ $word->direction === 'across' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800' }}">
                                {{ $word->direction }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600">
                            ({{ $word->start_row }}, {{ $word->start_col }})
                        </td>
                        <td class="px-4 py-3">
                            <form action="{{ route('admin.puzzles.words.delete', [$puzzle->id, $word->id]) }}" 
                                  method="POST" 
                                  onsubmit="return confirm('Delete this word?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @else
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-font text-6xl mb-4 text-gray-300"></i>
            <p>No words added yet. Add your first word above!</p>
        </div>
    @endif
</div>
@endsection