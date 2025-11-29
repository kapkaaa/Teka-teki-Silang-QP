<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PuzzleWord extends Model
{
    use HasFactory;
    public $timestamps = false;  // <— tambahkan ini

    protected $fillable = [
        'puzzle_id',
        'number',
        'answer',
        'clue',
        'direction',
        'start_row',
        'start_col',
    ];

    protected $casts = [
        'number' => 'integer',
        'start_row' => 'integer',
        'start_col' => 'integer',
    ];

    public function puzzle()
    {
        return $this->belongsTo(Puzzle::class);
    }

    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class, 'word_id');
    }
}