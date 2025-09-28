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
        // Tus comandos personalizados van aquí si quieres registrarlos manualmente
    ];

    /**
     * Define el schedule de comandos.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Corre todos los días a las 00:10
        $schedule->command('goals:expire')->dailyAt('00:10');
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
