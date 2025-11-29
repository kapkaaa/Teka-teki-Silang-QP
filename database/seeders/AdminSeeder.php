<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create your admin account
        User::create([
            'username' => 'admin',
            'email' => 'admin@tts.com',
            'password' => Hash::make('admin123'),
        ]);

        echo "✅ Admin created: admin@tts.com / admin123\n";
    }
}