<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PuzzleCell extends Model
{
    use HasFactory;
    public $timestamps = false;  // <— tambahkan ini

    protected $fillable = [
        'puzzle_id',
        'row',
        'col',
        'letter',
    ];

    protected $casts = [
        'row' => 'integer',
        'col' => 'integer',
    ];

    public function puzzle()
    {
        return $this->belongsTo(Puzzle::class);
    }
}