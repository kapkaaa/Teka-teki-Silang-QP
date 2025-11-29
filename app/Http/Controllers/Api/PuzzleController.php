<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Puzzle;
use App\Models\PuzzleWord;
use App\Models\PuzzleCell;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PuzzleController extends Controller
{
    public function index()
    {
        $puzzles = Puzzle::with(['words', 'cells'])->get();

        return response()->json([
            'success' => true,
            'message' => 'Puzzles retrieved successfully',
            'data' => $puzzles,
        ]);
    }

    public function show($id)
    {
        $puzzle = Puzzle::with(['words', 'cells'])->find($id);

        if (!$puzzle) {
            return response()->json([
                'success' => false,
                'message' => 'Puzzle not found',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Puzzle retrieved successfully',
            'data' => $puzzle,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'rows' => 'required|integer|min:3',
            'cols' => 'required|integer|min:3',
            'words' => 'required|array',
            'words.*.number' => 'required|integer',
            'words.*.answer' => 'required|string',
            'words.*.clue' => 'required|string',
            'words.*.direction' => 'required|in:across,down',
            'words.*.start_row' => 'required|integer|min:0',
            'words.*.start_col' => 'required|integer|min:0',
            'cells' => 'required|array',
            'cells.*.row' => 'required|integer|min:0',
            'cells.*.col' => 'required|integer|min:0',
            'cells.*.letter' => 'nullable|string|size:1',
        ]);

        DB::beginTransaction();

        try {
            // Create puzzle
            $puzzle = Puzzle::create([
                'title' => $validated['title'],
                'rows' => $validated['rows'],
                'cols' => $validated['cols'],
            ]);

            // Create words
            foreach ($validated['words'] as $wordData) {
                PuzzleWord::create([
                    'puzzle_id' => $puzzle->id,
                    'number' => $wordData['number'],
                    'answer' => strtoupper($wordData['answer']),
                    'clue' => $wordData['clue'],
                    'direction' => $wordData['direction'],
                    'start_row' => $wordData['start_row'],
                    'start_col' => $wordData['start_col'],
                ]);
            }

            // Create cells
            foreach ($validated['cells'] as $cellData) {
                PuzzleCell::create([
                    'puzzle_id' => $puzzle->id,
                    'row' => $cellData['row'],
                    'col' => $cellData['col'],
                    'letter' => isset($cellData['letter']) ? strtoupper($cellData['letter']) : null,
                ]);
            }

            DB::commit();

            $puzzle->load(['words', 'cells']);

            return response()->json([
                'success' => true,
                'message' => 'Puzzle created successfully',
                'data' => $puzzle,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create puzzle: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }
}