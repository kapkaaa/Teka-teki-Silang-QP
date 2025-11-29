<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Puzzle;
use App\Models\PuzzleWord;
use App\Models\PuzzleCell;

class PuzzleSeeder extends Seeder
{
    public function run(): void
    {
        // Create a simple 5x5 crossword puzzle
        $puzzle = Puzzle::create([
            'title' => 'Simple Crossword',
            'rows' => 5,
            'cols' => 5,
        ]);

        // Words for the puzzle
        $words = [
            [
                'number' => 1,
                'answer' => 'CAT',
                'clue' => 'A common household pet',
                'direction' => 'across',
                'start_row' => 0,
                'start_col' => 0,
            ],
            [
                'number' => 2,
                'answer' => 'DOG',
                'clue' => 'Man\'s best friend',
                'direction' => 'across',
                'start_row' => 2,
                'start_col' => 0,
            ],
            [
                'number' => 3,
                'answer' => 'COD',
                'clue' => 'Type of fish',
                'direction' => 'down',
                'start_row' => 0,
                'start_col' => 0,
            ],
            [
                'number' => 4,
                'answer' => 'ART',
                'clue' => 'Creative expression',
                'direction' => 'down',
                'start_row' => 0,
                'start_col' => 1,
            ],
        ];

        foreach ($words as $wordData) {
            PuzzleWord::create([
                'puzzle_id' => $puzzle->id,
                'number' => $wordData['number'],
                'answer' => $wordData['answer'],
                'clue' => $wordData['clue'],
                'direction' => $wordData['direction'],
                'start_row' => $wordData['start_row'],
                'start_col' => $wordData['start_col'],
            ]);
        }

        // Generate cells based on words
        // This is a simplified version - in a real app, you'd calculate intersections
        $cellsData = [
            // CAT (across)
            ['row' => 0, 'col' => 0, 'letter' => 'C'],
            ['row' => 0, 'col' => 1, 'letter' => 'A'],
            ['row' => 0, 'col' => 2, 'letter' => 'T'],
            
            // DOG (across)
            ['row' => 2, 'col' => 0, 'letter' => 'D'],
            ['row' => 2, 'col' => 1, 'letter' => 'O'],
            ['row' => 2, 'col' => 2, 'letter' => 'G'],
            
            // COD (down) - C already exists
            ['row' => 1, 'col' => 0, 'letter' => 'O'],
            // D already exists
            
            // ART (down) - A already exists
            ['row' => 1, 'col' => 1, 'letter' => 'R'],
            ['row' => 2, 'col' => 1, 'letter' => 'T'],
            
            // Black cells (null letter)
            ['row' => 0, 'col' => 3, 'letter' => null],
            ['row' => 0, 'col' => 4, 'letter' => null],
            ['row' => 1, 'col' => 2, 'letter' => null],
            ['row' => 1, 'col' => 3, 'letter' => null],
            ['row' => 1, 'col' => 4, 'letter' => null],
            ['row' => 2, 'col' => 3, 'letter' => null],
            ['row' => 2, 'col' => 4, 'letter' => null],
            ['row' => 3, 'col' => 0, 'letter' => null],
            ['row' => 3, 'col' => 1, 'letter' => null],
            ['row' => 3, 'col' => 2, 'letter' => null],
            ['row' => 3, 'col' => 3, 'letter' => null],
            ['row' => 3, 'col' => 4, 'letter' => null],
            ['row' => 4, 'col' => 0, 'letter' => null],
            ['row' => 4, 'col' => 1, 'letter' => null],
            ['row' => 4, 'col' => 2, 'letter' => null],
            ['row' => 4, 'col' => 3, 'letter' => null],
            ['row' => 4, 'col' => 4, 'letter' => null],
        ];

        foreach ($cellsData as $cellData) {
            PuzzleCell::create([
                'puzzle_id' => $puzzle->id,
                'row' => $cellData['row'],
                'col' => $cellData['col'],
                'letter' => $cellData['letter'],
            ]);
        }
    }
}