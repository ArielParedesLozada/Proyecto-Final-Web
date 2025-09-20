<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password reset routes
Route::post('/password/reset-request', [AuthController::class, 'requestPasswordReset']);
Route::post('/password/verify-code', [AuthController::class, 'verifyResetCode']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Protected routes
Route::middleware('jwt.auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Test route to verify authentication
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
