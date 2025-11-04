<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FixedMovement;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\FixedMovementNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RunFixedMovements extends Command
{
    protected $signature = 'fixed:run';
    protected $description = 'Genera transacciones de movimientos fijos cuya next_run <= hoy';

    public function handle()
    {
        $today = Carbon::today();

        $rows = FixedMovement::where('active', true)
            ->whereDate('next_run', '<=', $today->toDateString())
            ->orderBy('next_run')
            ->get();

        foreach ($rows as $fm) {
            $goal = Goal::find($fm->goal_id);
            if (!$goal) continue;

            if (in_array($goal->status, ['completed', 'expired'])) {
                $this->moveNext($fm); 
                continue;
            }

            if ($fm->start_date && $today->lt(Carbon::parse($fm->start_date))) {
                $this->moveNext($fm, /*forceTodayBase*/ true);
                continue;
            }
            if ($fm->end_date && $today->gt(Carbon::parse($fm->end_date))) {
                $fm->active = false;
                $fm->save();
                continue;
            }

            DB::transaction(function () use ($fm, $today, $goal) {
                // Verificar si ya existe una transacción para este movimiento fijo en esta fecha
                // Esto previene duplicados si el comando se ejecuta múltiples veces
                $existingTransaction = Transaction::where('user_id', $fm->user_id)
                    ->where('goal_id', $fm->goal_id)
                    ->where('is_fixed', true)
                    ->where('occurred_on', $fm->next_run)
                    ->where('amount', $fm->amount)
                    ->where('type', $fm->type)
                    ->first();
                
                if ($existingTransaction) {
                    // Ya existe una transacción para este movimiento fijo en esta fecha
                    // Solo actualizar next_run sin crear otra transacción
                    $fm->last_run = $fm->next_run;
                    $fm->next_run = $this->computeNextRun($fm, Carbon::parse($fm->next_run))->toDateString();
                    $fm->save();
                    return;
                }
                
                $transaction = Transaction::create([
                    'user_id'     => $fm->user_id,
                    'goal_id'     => $fm->goal_id,
                    'type'        => $fm->type,
                    'is_fixed'    => true,
                    'amount'      => $fm->amount,
                    'occurred_on' => $fm->next_run, 
                ]);
                
                // Crear notificación para el móvil
                FixedMovementNotification::create([
                    'user_id'           => $fm->user_id,
                    'transaction_id'    => $transaction->id,
                    'fixed_movement_id' => $fm->id,
                    'goal_id'           => $fm->goal_id,
                    'type'              => $fm->type,
                    'amount'            => $fm->amount,
                    'frequency'         => $fm->frequency,
                    'goal_name'         => $goal->name,
                ]);
                
                $fm->last_run = $fm->next_run;
                $fm->next_run = $this->computeNextRun($fm, Carbon::parse($fm->next_run))->toDateString();
                $fm->save();
            });
        }

        $this->info('fixed:run completado');
        return Command::SUCCESS;
    }

    private function computeNextRun(FixedMovement $fm, Carbon $base): Carbon
    {
        $interval = max(1, (int) $fm->interval);

        return match ($fm->frequency) {
            'daily'   => $base->copy()->addDays($interval),
            'weekly'  => $this->nextWeeklyAfter($base, $fm->weekdays ?? [], $interval),
            'monthly' => $this->addMonthsSafe($base, $interval),
            default   => $base->copy()->addMonth(),
        };
    }

    private function moveNext(FixedMovement $fm, bool $forceTodayBase = false): void
    {
        $base = $forceTodayBase ? Carbon::today() : Carbon::parse($fm->next_run);
        $fm->next_run = $this->computeNextRun($fm, $base)->toDateString();
        $fm->save();
    }

    private function nextWeeklyAfter(Carbon $from, array $days, int $interval): Carbon
    {
        $days = count($days) ? array_map('intval', $days) : [(int)$from->dayOfWeek];
        sort($days);

        $candidate = $from->copy()->addDay(); 
        for ($i = 0; $i < 14; $i++) {
            $dow = (int)$candidate->dayOfWeek;
            if (in_array($dow, $days, true)) {
                return $candidate;
            }
            $candidate->addDay();
        }
        return $from->copy()->addWeeks($interval);
    }

    private function addMonthsSafe(Carbon $date, int $months): Carbon
    {
        $target = $date->copy()->addMonthsNoOverflow($months);
        return $target;
    }
}
