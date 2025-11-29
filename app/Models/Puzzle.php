<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Puzzle extends Model
{
    use HasFactory;
    public $timestamps = false;  // <— tambahkan ini

    protected $fillable = [
        'title',
        'rows',
        'cols',
    ];

    protected $casts = [
        'rows' => 'integer',
        'cols' => 'integer',
    ];

    public function words()
    {
        return $this->hasMany(PuzzleWord::class);
    }

    public function cells()
    {
        return $this->hasMany(PuzzleCell::class);
    }

    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class);
    }
}