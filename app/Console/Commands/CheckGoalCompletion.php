<?php

namespace App\Console\Commands;

use App\Models\Goal;
use Illuminate\Console\Command;

class CheckGoalCompletion extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'goals:check-completion';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar y completar automáticamente las metas que han alcanzado su objetivo';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verificando metas para completar automáticamente...');

        // Obtener todas las metas activas
        $activeGoals = Goal::where('status', 'active')->get();
        
        $completedCount = 0;

        foreach ($activeGoals as $goal) {
            if ($goal->checkAndUpdateCompletion()) {
                $completedCount++;
                $this->info("✅ Meta completada: {$goal->name} ($" . number_format($goal->target_amount, 2) . ")");
            }
        }

        if ($completedCount > 0) {
            $this->info("🎉 Se completaron {$completedCount} metas automáticamente");
        } else {
            $this->info("ℹ️  No se encontraron metas para completar");
        }

        return Command::SUCCESS;
    }
}
