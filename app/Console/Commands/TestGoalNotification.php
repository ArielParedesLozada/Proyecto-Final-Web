<?php

namespace App\Console\Commands;

use App\Models\Goal;
use App\Models\User;
use App\Mail\GoalCompletedEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestGoalNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'goals:test-notification {user_id} {goal_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enviar email de prueba de meta completada';

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

        $this->info("Enviando email de prueba a {$user->email}...");

        try {
            Mail::to($user->email)->send(new GoalCompletedEmail($goal, $user));
            $this->info("✅ Email enviado exitosamente");
        } catch (\Exception $e) {
            $this->error("❌ Error al enviar email: " . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
