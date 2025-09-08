<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SampleController;

Route::get('/', function () {
    return view('index'); // resources/views/index.blade.php
});

Route::get('/sample', [SampleController::class, 'index']);

// Páginas React (Login y placeholder Dashboard)
Route::view('/login', 'app');
Route::view('/dashboard', 'app');
Route::view('/register', 'app');
Route::view('/forgot-password', 'app');
Route::view('/reset-password', 'app');
Route::view('/goals', 'app'); 



