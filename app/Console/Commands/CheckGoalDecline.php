<?php

namespace App\Console\Commands;

use App\Models\Goal;
use App\Models\User;
use App\Mail\GoalDeclineEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class CheckGoalDecline extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'goals:check-decline';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar metas en declive y enviar notificaciones por email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando metas en declive...');

        // Obtener metas activas que no han expirado
        $activeGoals = Goal::where('status', 'active')
            ->where('target_date', '>=', Carbon::today())
            ->with('user', 'transactions')
            ->get();
        
        $declineCount = 0;
        $emailsSent = 0;

        foreach ($activeGoals as $goal) {
            $declineData = $this->analyzeGoalDecline($goal);
            
            if ($declineData['is_in_decline']) {
                $declineCount++;
                $this->info("⚠️  Meta en declive encontrada: {$goal->name} (Usuario: {$goal->user->email})");
                
                // Verificar si ya se envió una notificación recientemente (evitar spam)
                if (!$this->wasRecentlyNotified($goal)) {
                    try {
                        Mail::to($goal->user->email)->send(new GoalDeclineEmail(
                            $goal,
                            $goal->user,
                            $declineData['current_saved'],
                            $declineData['suggested_amount'],
                            $declineData['days_until_deadline']
                        ));
                        
                        $emailsSent++;
                        $this->info("✅ Email enviado a {$goal->user->email}");
                        
                        // Marcar que se envió la notificación
                        $this->markAsNotified($goal);
                        
                    } catch (\Exception $e) {
                        $this->error("❌ Error enviando email a {$goal->user->email}: " . $e->getMessage());
                    }
                } else {
                    $this->info("ℹ️  Ya se envió notificación reciente para esta meta");
                }
            }
        }

        $this->info("📊 Resumen:");
        $this->info("   - Metas analizadas: " . $activeGoals->count());
        $this->info("   - Metas en declive: {$declineCount}");
        $this->info("   - Emails enviados: {$emailsSent}");

        return Command::SUCCESS;
    }

    /**
     * Analizar si una meta está en declive
     */
    private function analyzeGoalDecline(Goal $goal)
    {
        $today = Carbon::today();
        $targetDate = Carbon::parse($goal->target_date);
        $daysUntilDeadline = $today->diffInDays($targetDate, false);
        
        // Solo analizar metas que están a 7 días o menos del deadline
        if ($daysUntilDeadline > 7) {
            return ['is_in_decline' => false];
        }

        // Calcular tiempo transcurrido desde la creación de la meta
        $goalCreatedAt = Carbon::parse($goal->created_at);
        $daysSinceCreation = $today->diffInDays($goalCreatedAt);
        
        // Si la meta se creó hace menos de 7 días, no analizar aún
        if ($daysSinceCreation < 7) {
            return ['is_in_decline' => false];
        }

        // Calcular monto sugerido para la fecha actual
        $totalDays = $goalCreatedAt->diffInDays($targetDate);
        $suggestedAmount = $totalDays > 0 ? 
            ($goal->target_amount * $daysSinceCreation) / $totalDays : 
            $goal->target_amount;

        // Calcular monto actual ahorrado
        $currentSaved = $goal->transactions()
            ->where('type', 'income')
            ->sum('amount');

        // Verificar si está en declive (ahorro actual < 80% del sugerido)
        $declineThreshold = 0.8; // 80% del objetivo sugerido
        $isInDecline = $currentSaved < ($suggestedAmount * $declineThreshold);

        return [
            'is_in_decline' => $isInDecline,
            'current_saved' => $currentSaved,
            'suggested_amount' => $suggestedAmount,
            'days_until_deadline' => max(0, $daysUntilDeadline),
            'progress_percentage' => $goal->target_amount > 0 ? 
                ($currentSaved / $goal->target_amount) * 100 : 0,
            'decline_percentage' => $suggestedAmount > 0 ? 
                (($suggestedAmount - $currentSaved) / $suggestedAmount) * 100 : 0
        ];
    }

    /**
     * Verificar si ya se envió una notificación reciente
     */
    private function wasRecentlyNotified(Goal $goal)
    {
        // Verificar en cache si se envió en las últimas 24 horas
        $cacheKey = "goal_decline_notification_{$goal->id}";
        return cache()->has($cacheKey);
    }

    /**
     * Marcar que se envió una notificación
     */
    private function markAsNotified(Goal $goal)
    {
        // Marcar en cache por 24 horas
        $cacheKey = "goal_decline_notification_{$goal->id}";
        cache()->put($cacheKey, true, now()->addHours(24));
    }
}
