<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Puzzle;
use App\Models\PuzzleWord;
use App\Models\PuzzleCell;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_puzzles' => Puzzle::count(),
            'total_users' => User::where('role', 'user')->count(),
            'total_words' => PuzzleWord::count(),
            'recent_puzzles' => Puzzle::latest()->take(5)->get(),
        ];

        return view('admin.dashboard', compact('stats'));
    }

    public function puzzles()
    {
        $puzzles = Puzzle::withCount('words')->latest()->paginate(10);
        return view('admin.puzzles.index', compact('puzzles'));
    }

    public function createPuzzle()
    {
        return view('admin.puzzles.create');
    }

    public function storePuzzle(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'rows' => 'required|integer|min:3|max:20',
            'cols' => 'required|integer|min:3|max:20',
        ]);

        $puzzle = Puzzle::create($validated);

        return redirect()->route('admin.puzzles.edit', $puzzle->id)
            ->with('success', 'Puzzle created successfully! Now add words.');
    }

    public function editPuzzle($id)
    {
        $puzzle = Puzzle::with(['words', 'cells'])->findOrFail($id);
        return view('admin.puzzles.edit', compact('puzzle'));
    }

    public function updatePuzzle(Request $request, $id)
    {
        $puzzle = Puzzle::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'rows' => 'required|integer|min:3|max:20',
            'cols' => 'required|integer|min:3|max:20',
        ]);

        $puzzle->update($validated);

        return redirect()->route('admin.puzzles.edit', $puzzle->id)
            ->with('success', 'Puzzle updated successfully!');
    }

    public function deletePuzzle($id)
    {
        $puzzle = Puzzle::findOrFail($id);
        $puzzle->delete();

        return redirect()->route('admin.puzzles')
            ->with('success', 'Puzzle deleted successfully!');
    }

    public function addWord(Request $request, $puzzleId)
    {
        $validated = $request->validate([
            'number' => 'required|integer',
            'answer' => 'required|string|max:50',
            'clue' => 'required|string',
            'direction' => 'required|in:across,down',
            'start_row' => 'required|integer|min:0',
            'start_col' => 'required|integer|min:0',
        ]);

        $validated['puzzle_id'] = $puzzleId;
        $validated['answer'] = strtoupper($validated['answer']);

        PuzzleWord::create($validated);

        // Auto generate cells for this word
        $this->generateCellsForWord($puzzleId, $validated);

        return redirect()->route('admin.puzzles.edit', $puzzleId)
            ->with('success', 'Word added successfully!');
    }

    public function deleteWord($puzzleId, $wordId)
    {
        $word = PuzzleWord::where('puzzle_id', $puzzleId)->findOrFail($wordId);
        $word->delete();

        return redirect()->route('admin.puzzles.edit', $puzzleId)
            ->with('success', 'Word deleted successfully!');
    }

    private function generateCellsForWord($puzzleId, $wordData)
    {
        $answer = $wordData['answer'];
        $row = $wordData['start_row'];
        $col = $wordData['start_col'];
        $direction = $wordData['direction'];

        for ($i = 0; $i < strlen($answer); $i++) {
            $currentRow = $direction === 'down' ? $row + $i : $row;
            $currentCol = $direction === 'across' ? $col + $i : $col;

            // Check if cell already exists
            $existingCell = PuzzleCell::where('puzzle_id', $puzzleId)
                ->where('row', $currentRow)
                ->where('col', $currentCol)
                ->first();

            if (!$existingCell) {
                PuzzleCell::create([
                    'puzzle_id' => $puzzleId,
                    'row' => $currentRow,
                    'col' => $currentCol,
                    'letter' => $answer[$i],
                ]);
            }
        }
    }

    public function users()
    {
        $users = User::withCount([
            'answers',
            'answers as correct_answers_count' => function($query) {
                $query->where('is_correct', true);
            }
        ])->paginate(15);

        return view('admin.users.index', compact('users'));
    }
}