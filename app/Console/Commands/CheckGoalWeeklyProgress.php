<?php

namespace App\Console\Commands;

use App\Models\Goal;
use App\Models\GoalNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckGoalWeeklyProgress extends Command
{
    protected $signature = 'goals:weekly-progress';

    protected $description = 'Enviar recordatorios semanales sobre el ahorro de metas activas';

    public function handle(): int
    {
        $this->info('📆 Revisando recordatorios semanales de metas...');

        $today = Carbon::today();
        $goals = Goal::where('status', 'active')
            ->where('target_date', '>=', $today)
            ->with('user', 'transactions')
            ->get();

        $notificationsCreated = 0;

        foreach ($goals as $goal) {
            if (!$this->isEligible($goal, $today)) {
                continue;
            }

            if ($this->wasRecentlyNotified($goal)) {
                $this->line("⏭️  Meta {$goal->name} ya recibió un recordatorio recientemente");
                continue;
            }

            $progressInfo = $this->calculateProgress($goal);

            if ($progressInfo === null) {
                continue;
            }

            GoalNotification::create([
                'user_id' => $goal->user_id,
                'goal_id' => $goal->id,
                'type' => 'goal_weekly_progress',
                'goal_name' => $goal->name,
                'target_amount' => $progressInfo['target_amount'],
                'current_saved' => $progressInfo['current_saved'],
                'remaining_amount' => $progressInfo['remaining_amount'],
                'progress_percentage' => $progressInfo['progress_percentage'],
            ]);

            $notificationsCreated++;
            $this->info("🔔 Recordatorio semanal creado para {$goal->user->email} ({$goal->name})");
        }

        $this->info("✅ Recordatorios enviados: {$notificationsCreated}");

        return Command::SUCCESS;
    }

    private function isEligible(Goal $goal, Carbon $today): bool
    {
        $createdAt = Carbon::parse($goal->created_at)->startOfDay();
        $targetDate = Carbon::parse($goal->target_date)->startOfDay();

        $durationDays = $createdAt->diffInDays($targetDate, false);
        if ($durationDays < 14) {
            return false;
        }

        $daysSinceCreation = $createdAt->diffInDays($today, false);
        if ($daysSinceCreation < 7) {
            return false;
        }

        return true;
    }

    private function wasRecentlyNotified(Goal $goal): bool
    {
        return GoalNotification::where('goal_id', $goal->id)
            ->where('type', 'goal_weekly_progress')
            ->where('created_at', '>=', now()->subDays(6))
            ->exists();
    }

    private function calculateProgress(Goal $goal): ?array
    {
        $targetAmount = (float) $goal->target_amount;
        if ($targetAmount <= 0) {
            return null;
        }

        $currentSaved = (float) $goal->transactions()
            ->where('type', 'income')
            ->sum('amount');

        $progressPercentage = $targetAmount > 0
            ? ($currentSaved / $targetAmount) * 100
            : 0.0;

        if ($progressPercentage >= 90) {
            return null;
        }

        $remainingAmount = max(0, $targetAmount - $currentSaved);

        return [
            'current_saved' => round($currentSaved, 2),
            'target_amount' => $targetAmount,
            'remaining_amount' => round($remainingAmount, 2),
            'progress_percentage' => round($progressPercentage, 2),
        ];
    }
}


