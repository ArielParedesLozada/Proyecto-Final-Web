<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define los comandos Artisan que provee tu aplicación.
     */
    protected $commands = [
        \App\Console\Commands\RunFixedMovements::class,
        \App\Console\Commands\MarkExpiredGoals::class,
    ];

    /**
     * Define el schedule de comandos.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Corre todos los días a las 00:10
        $schedule->command('goals:expire')->dailyAt('00:01');
        $schedule->command('fixed:run')->hourly();
        // Verificar metas completadas cada hora
        $schedule->command('goals:check-completion')->hourly();
        
        // Verificar metas en declive diariamente a las 09:00
        $schedule->command('goals:check-decline')->dailyAt('09:00');
    }

    /**
     * Registra los comandos Artisan.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
