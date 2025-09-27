<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoalController;

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

// Google OAuth routes
Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::get('/auth/google/url', [GoogleAuthController::class, 'getGoogleUrl']);

// Protected routes
Route::middleware('jwt.auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Test route to verify authentication
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/goals', [GoalController::class, 'index']);
    Route::get('/goals/{id}', [GoalController::class, 'show']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::put('/goals/{id}', [GoalController::class, 'update']);
    Route::delete('/goals/{id}', [GoalController::class, 'destroy']);
    Route::post('/goals/{goalId}/transactions', [GoalController::class, 'addTransaction']);
    Route::get('/goals/{goalId}/transactions', [GoalController::class, 'listTransactions']);
    Route::delete('/transactions/{id}', [GoalController::class, 'deleteTransaction']);
});
