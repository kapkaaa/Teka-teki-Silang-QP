<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PuzzleController;
use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\LeaderboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public puzzle routes (can view puzzles without auth)
Route::get('/puzzles', [PuzzleController::class, 'index']);
Route::get('/puzzles/{id}', [PuzzleController::class, 'show']);

// Leaderboard (public)
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => $request->user(),
        ]);
    });

    // Puzzle management
    Route::post('/puzzles', [PuzzleController::class, 'store']);

    // Answer submission
    Route::post('/puzzles/{id}/submit', [AnswerController::class, 'submit']);
});