<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\Access\AccessController;
use App\Http\Controllers\Dashboard\DashboardController;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/recent-accesses', [DashboardController::class, 'recentAccesses']);
        Route::get('/chart-access', [DashboardController::class, 'chartAccessByDay']);
        Route::get('/chart-types', [DashboardController::class, 'chartByType']);
    });

    Route::prefix('access')->group(function () {
        Route::get('/logs', [AccessController::class, 'index']);
        Route::post('/validate', [AccessController::class, 'validateAccess']);
    });

    Route::apiResource('users', UserController::class);

    Route::post('/users/{id}/activate', [UserController::class, 'activate']);
    Route::post('/users/{id}/suspend', [UserController::class, 'suspend']);
});