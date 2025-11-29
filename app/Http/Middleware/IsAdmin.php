<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            // Redirect ke home dengan pesan error
            return redirect('/')->with('error', 'Unauthorized access. Admin only!');
        }

        return $next($request);
    }
}