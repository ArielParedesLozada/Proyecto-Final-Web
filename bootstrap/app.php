<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule; 

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'jwt.auth' => \App\Http\Middleware\JWTMiddleware::class,
        ]);

        $middleware->appendToGroup('web', [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->appendToGroup('api', [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })

    ->withCommands([
        \App\Console\Commands\RunFixedMovements::class, 
        \App\Console\Commands\MarkExpiredGoals::class,  
    ])

    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('fixed:run')->everyFiveMinutes();

        $schedule->command('goals:expire')->everyFiveMinutes();
        $schedule->command('goals:check-decline')->everyFiveMinutes();
        $schedule->command('goals:weekly-progress')->weeklyOn(1, '09:00');

    })

    ->create();
