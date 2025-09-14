<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login'); // ← default a login

// Páginas React (SPA)
Route::view('/login', 'app');
Route::view('/register', 'app');
Route::view('/forgot-password', 'app');
Route::view('/reset-password', 'app');
Route::view('/goals', 'app'); 
Route::view('/dashboard', 'app');
Route::view('/profile', 'app');

Route::view('/transactions', 'app');
Route::view('/statistics', 'app');
Route::view('/history', 'app'); // Nueva ruta para el historial

