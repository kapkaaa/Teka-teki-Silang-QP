<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Puzzle;
use App\Models\PuzzleWord;
use App\Models\UserAnswer;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    public function submit(Request $request, $puzzleId)
    {
        $validated = $request->validate([
            'word_id' => 'required|exists:puzzle_words,id',
            'answer' => 'required|string',
        ]);

        $puzzle = Puzzle::find($puzzleId);

        if (!$puzzle) {
            return response()->json([
                'success' => false,
                'message' => 'Puzzle not found',
                'data' => null,
            ], 404);
        }

        $word = PuzzleWord::where('id', $validated['word_id'])
            ->where('puzzle_id', $puzzleId)
            ->first();

        if (!$word) {
            return response()->json([
                'success' => false,
                'message' => 'Word not found in this puzzle',
                'data' => null,
            ], 404);
        }

        $userAnswer = strtoupper(trim($validated['answer']));
        $correctAnswer = strtoupper(trim($word->answer));
        $isCorrect = $userAnswer === $correctAnswer;

        // Check if user already answered this word
        $existingAnswer = UserAnswer::where('user_id', $request->user()->id)
            ->where('puzzle_id', $puzzleId)
            ->where('word_id', $validated['word_id'])
            ->first();

        if ($existingAnswer) {
            $existingAnswer->update([
                'answer' => $userAnswer,
                'is_correct' => $isCorrect,
            ]);

            $answer = $existingAnswer;
        } else {
            $answer = UserAnswer::create([
                'user_id' => $request->user()->id,
                'puzzle_id' => $puzzleId,
                'word_id' => $validated['word_id'],
                'answer' => $userAnswer,
                'is_correct' => $isCorrect,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $isCorrect ? 'Correct answer!' : 'Incorrect answer',
            'data' => [
                'is_correct' => $isCorrect,
                'correct_answer' => $isCorrect ? null : $correctAnswer,
                'answer' => $answer,
            ],
        ]);
    }
}