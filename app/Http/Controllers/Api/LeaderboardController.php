<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function index()
    {
        $leaderboard = User::select('users.id', 'users.username', 'users.email')
            ->leftJoin('user_answers', 'users.id', '=', 'user_answers.user_id')
            ->selectRaw('COUNT(CASE WHEN user_answers.is_correct = true THEN 1 END) as correct_answers')
            ->selectRaw('COUNT(user_answers.id) as total_answers')
            ->groupBy('users.id', 'users.username', 'users.email')
            ->orderByDesc('correct_answers')
            ->orderByDesc('total_answers')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Leaderboard retrieved successfully',
            'data' => $leaderboard,
        ]);
    }
}