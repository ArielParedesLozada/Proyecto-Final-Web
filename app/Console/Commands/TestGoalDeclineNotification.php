<?php

namespace App\Console\Commands;

use App\Models\Goal;
use App\Models\User;
use App\Mail\GoalDeclineEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class TestGoalDeclineNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'goals:test-decline-notification {user_id} {goal_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enviar email de prueba de meta en declive';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $goalId = $this->argument('goal_id');

        $user = User::find($userId);
        $goal = Goal::find($goalId);

        if (!$user) {
            $this->error("Usuario con ID {$userId} no encontrado");
            return Command::FAILURE;
        }

        if (!$goal) {
            $this->error("Meta con ID {$goalId} no encontrada");
            return Command::FAILURE;
        }

        if ($goal->user_id !== $user->id) {
            $this->error("La meta no pertenece al usuario especificado");
            return Command::FAILURE;
        }

        // Simular datos de declive para la prueba
        $currentSaved = $goal->target_amount * 0.3; // 30% del objetivo
        $suggestedAmount = $goal->target_amount * 0.7; // 70% del objetivo
        $daysUntilDeadline = 5; // 5 días restantes

        $this->info("📧 Enviando email de prueba de declive...");
        $this->info("👤 Usuario: {$user->email}");
        $this->info("🎯 Meta: {$goal->name}");
        $this->info("💰 Objetivo: $" . number_format($goal->target_amount, 0, ',', '.'));
        $this->info("💵 Ahorrado actual: $" . number_format($currentSaved, 0, ',', '.'));
        $this->info("📊 Sugerido: $" . number_format($suggestedAmount, 0, ',', '.'));
        $this->info("⏰ Días restantes: {$daysUntilDeadline}");

        try {
            Mail::to($user->email)->send(new GoalDeclineEmail(
                $goal,
                $user,
                $currentSaved,
                $suggestedAmount,
                $daysUntilDeadline
            ));
            
            $this->info("✅ Email de prueba enviado exitosamente");
            $this->info("📬 Revisa la bandeja de entrada de {$user->email}");
            
        } catch (\Exception $e) {
            $this->error("❌ Error al enviar email: " . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
