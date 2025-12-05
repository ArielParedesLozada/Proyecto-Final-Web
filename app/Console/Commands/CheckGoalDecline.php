<?php

namespace App\Console\Commands;

use App\Models\Goal;
use App\Models\User;
use App\Models\GoalNotification;
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
        $mobileNotificationsCreated = 0;

        foreach ($activeGoals as $goal) {
            $declineData = $this->analyzeGoalDecline($goal);
            
            if ($declineData['is_in_decline']) {
                $declineCount++;
                $this->info("⚠️  Meta en declive encontrada: {$goal->name} (Usuario: {$goal->user->email})");
                
                // Verificar si ya se envió una notificación recientemente (evitar spam)
                if (!$this->wasRecentlyNotified($goal)) {
                    try {
                        // Enviar email para web (mantener funcionalidad existente)
                        Mail::to($goal->user->email)->send(new GoalDeclineEmail(
                            $goal,
                            $goal->user,
                            $declineData['current_saved'],
                            $declineData['expected_amount'],
                            $declineData['days_until_deadline']
                        ));
                        
                        $emailsSent++;
                        $this->info("✅ Email enviado a {$goal->user->email}");
                        
                        // Crear notificación para móvil
                        GoalNotification::create([
                            'user_id' => $goal->user_id,
                            'goal_id' => $goal->id,
                            'type' => 'goal_declining',
                            'goal_name' => $goal->name,
                            'current_saved' => $declineData['current_saved'],
                            'expected_amount' => $declineData['expected_amount'],
                            'days_until_deadline' => $declineData['days_until_deadline'],
                            'deficit' => $declineData['deficit'],
                            'progress_percentage' => $declineData['progress_percentage'],
                            'target_amount' => $goal->target_amount,
                        ]);
                        
                        $mobileNotificationsCreated++;
                        $this->info("📱 Notificación móvil creada para {$goal->user->email}");
                        
                        // Marcar que se envió la notificación
                        $this->markAsNotified($goal);
                        
                    } catch (\Exception $e) {
                        $this->error("❌ Error enviando notificación a {$goal->user->email}: " . $e->getMessage());
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
        $this->info("   - Notificaciones móviles creadas: {$mobileNotificationsCreated}");

        return Command::SUCCESS;
    }

    /**
     * Analizar si una meta está en declive
     * Según los requisitos:
     * - <= 7 días: iniciar vigilancia a mitad del tiempo
     * - 8-21 días: iniciar vigilancia una semana antes
     */
    private function analyzeGoalDecline(Goal $goal)
    {
        $today = Carbon::today();
        $targetDate = Carbon::parse($goal->target_date)->startOfDay();
        $goalCreatedAt = Carbon::parse($goal->created_at)->startOfDay();
        
        // Calcular duración total de la meta (desde creación hasta deadline)
        $totalDays = $goalCreatedAt->diffInDays($targetDate, false);
        // Días hasta el deadline (puede ser negativo si ya pasó)
        $daysUntilDeadline = $today->diffInDays($targetDate, false);
        // Días transcurridos desde la creación
        $daysSinceCreation = $goalCreatedAt->diffInDays($today, false);

        // Validaciones básicas
        if ($totalDays <= 0) {
            return ['is_in_decline' => false];
        }
        
        if ($daysUntilDeadline < 0) {
            return ['is_in_decline' => false];
        }

        // Determinar si es momento de iniciar vigilancia
        $shouldStartMonitoring = false;
        
        if ($totalDays <= 7) {
            // <= 7 días: iniciar vigilancia a mitad del tiempo
            $halfwayPoint = ceil($totalDays / 2);
            $shouldStartMonitoring = $daysSinceCreation >= $halfwayPoint;
        } elseif ($totalDays >= 8 && $totalDays <= 21) {
            // 8-21 días: iniciar vigilancia una semana antes
            $shouldStartMonitoring = $daysUntilDeadline <= 7;
        } else {
            // > 21 días: mantener lógica anterior (7 días antes)
            $shouldStartMonitoring = $daysUntilDeadline <= 7;
        }

        if (!$shouldStartMonitoring) {
            return ['is_in_decline' => false];
        }

        // Calcular monto esperado para la fecha actual (progreso esperado)
        // Proporción del tiempo transcurrido vs tiempo total
        $expectedAmount = ($goal->target_amount * $daysSinceCreation) / $totalDays;

        // Calcular monto actual ahorrado (progreso real)
        $currentSaved = (float) $goal->transactions()
            ->where('type', 'income')
            ->sum('amount');

        // Verificar si está en declive (progreso real < progreso esperado)
        $isInDecline = $currentSaved < $expectedAmount;

        if (!$isInDecline) {
            return ['is_in_decline' => false];
        }

        $deficit = $expectedAmount - $currentSaved;
        $progressPercentage = $goal->target_amount > 0 ? 
            ($currentSaved / $goal->target_amount) * 100 : 0;

        return [
            'is_in_decline' => true,
            'current_saved' => $currentSaved,
            'expected_amount' => $expectedAmount,
            'days_until_deadline' => max(0, $daysUntilDeadline),
            'progress_percentage' => $progressPercentage,
            'deficit' => $deficit,
        ];
    }

    /**
     * Verificar si ya se envió una notificación reciente
     * Verifica tanto en cache como en la base de datos para evitar duplicados
     */
    private function wasRecentlyNotified(Goal $goal)
    {
        // Verificar en cache si se envió en las últimas 24 horas
        $cacheKey = "goal_decline_notification_{$goal->id}";
        if (cache()->has($cacheKey)) {
            return true;
        }

        // Verificar en la base de datos si existe una notificación de declive en las últimas 24 horas
        $recentNotification = GoalNotification::where('goal_id', $goal->id)
            ->where('type', 'goal_declining')
            ->where('created_at', '>=', now()->subHours(24))
            ->exists();

        return $recentNotification;
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
