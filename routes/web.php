<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthWebController;
use App\Http\Controllers\Admin\AdminController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/', function () {
    return view('auth/login');
});

// Auth routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthWebController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthWebController::class, 'login']);
    Route::get('/register', [AuthWebController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthWebController::class, 'register']);
});

Route::post('/logout', [AuthWebController::class, 'logout'])->name('logout');

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    
    // Puzzle management
    Route::get('/puzzles', [AdminController::class, 'puzzles'])->name('puzzles');
    Route::get('/puzzles/create', [AdminController::class, 'createPuzzle'])->name('puzzles.create');
    Route::post('/puzzles', [AdminController::class, 'storePuzzle'])->name('puzzles.store');
    Route::get('/puzzles/{id}/edit', [AdminController::class, 'editPuzzle'])->name('puzzles.edit');
    Route::put('/puzzles/{id}', [AdminController::class, 'updatePuzzle'])->name('puzzles.update');
    Route::delete('/puzzles/{id}', [AdminController::class, 'deletePuzzle'])->name('puzzles.delete');
    
    // Word management
    Route::post('/puzzles/{id}/words', [AdminController::class, 'addWord'])->name('puzzles.words.add');
    Route::delete('/puzzles/{puzzleId}/words/{wordId}', [AdminController::class, 'deleteWord'])->name('puzzles.words.delete');
    
    // User management
    Route::get('/users', [AdminController::class, 'users'])->name('users');
});