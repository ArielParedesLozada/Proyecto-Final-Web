<?php

namespace App\Http\Controllers;

use App\Models\FixedMovement;
use App\Models\Goal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class FixedMovementController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        $q = FixedMovement::where('user_id', $userId)->orderByDesc('id');

        if ($request->filled('goal_id')) {
            $q->where('goal_id', $request->query('goal_id'));
        }

        return response()->json([
            'data' => $q->get(),
        ]);
    }

    public function store(Request $request)
    {
        $userId = Auth::id();

        $data = $request->validate([
            'goal_id'    => ['required', 'exists:goals,id'],
            'type'       => ['required', Rule::in(['income', 'expense'])],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'frequency'  => ['nullable', Rule::in(['daily', 'weekly', 'monthly'])],
            'interval'   => ['nullable', 'integer', 'min:1'],
            'weekdays'   => ['nullable', 'array'],
            'weekdays.*' => ['integer', 'between:0,6'],
            'start_date' => ['nullable', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
            'active'     => ['nullable', 'boolean'],
            'apply_now'  => ['nullable', 'boolean'],
        ]);

        $goal = Goal::where('user_id', $userId)->findOrFail($data['goal_id']);

        $freq     = $data['frequency'] ?? 'monthly';
        $interval = $data['interval'] ?? 1;

        $start   = !empty($data['start_date']) ? Carbon::parse($data['start_date']) : Carbon::today();
        $nextRun = $this->computeFirstRun($freq, $interval, $data['weekdays'] ?? null, $start);

        $fm = FixedMovement::create([
            'user_id'    => $userId,
            'goal_id'    => $goal->id,
            'type'       => $data['type'],
            'amount'     => $data['amount'],
            'frequency'  => $freq,
            'interval'   => $interval,
            'weekdays'   => $freq === 'weekly' ? ($data['weekdays'] ?? null) : null,
            'start_date' => $start->toDateString(),
            'end_date'   => $data['end_date'] ?? null,
            'next_run'   => $nextRun->toDateString(),
            'active'     => $data['active'] ?? true,
        ]);

        if (!empty($data['apply_now'])) {
            Transaction::create([
                'user_id'     => $userId,
                'goal_id'     => $goal->id,
                'type'        => $data['type'],    
                'is_fixed'    => true,
                'amount'      => $data['amount'],
                'occurred_on' => Carbon::today()->toDateString(),
            ]);
        }

        return response()->json(['data' => $fm], 201);
    }


    public function update(Request $request, $id)
    {
        $userId = Auth::id();
        $fm = FixedMovement::where('user_id', $userId)->findOrFail($id);

        $data = $request->validate([
            // NO permitimos cambiar goal_id ni type (política del negocio)
            'amount'    => ['nullable', 'numeric', 'min:0.01'],
            'frequency' => ['nullable', Rule::in(['daily', 'weekly', 'monthly'])],
            'interval'  => ['nullable', 'integer', 'min:1'],
            'weekdays'  => ['nullable', 'array'],
            'weekdays.*' => ['integer', 'between:0,6'],
            'start_date' => ['nullable', 'date'],
            'end_date'  => ['nullable', 'date', 'after_or_equal:start_date'],
            'active'    => ['nullable', 'boolean'],
            'reseed_next_run' => ['nullable', 'boolean'],
        ]);

        $fm->fill($data);

        if (($data['frequency'] ?? null) !== null && $data['frequency'] !== 'weekly') {
            $fm->weekdays = null;
        }

        if (!empty($data['reseed_next_run'])) {
            $startBase = !empty($data['start_date']) ? Carbon::parse($data['start_date']) : ($fm->start_date ?? Carbon::today());
            $fm->next_run = $this->computeFirstRun(
                $fm->frequency,
                max(1, (int) $fm->interval),
                $fm->frequency === 'weekly' ? ($fm->weekdays ?? []) : null,
                Carbon::today()->max(Carbon::parse($startBase))
            )->toDateString();
        }

        $fm->save();

        return response()->json(['data' => $fm]);
    }

    public function destroy($id)
    {
        $userId = Auth::id();
        $fm = FixedMovement::where('user_id', $userId)->findOrFail($id);
        $fm->delete();

        return response()->json(['ok' => true]);
    }

    public function pause($id)
    {
        $userId = Auth::id();
        $fm = FixedMovement::where('user_id', $userId)->findOrFail($id);
        $fm->active = false;
        $fm->save();

        return response()->json(['data' => $fm]);
    }

    public function resume($id)
    {
        $userId = Auth::id();
        $fm = FixedMovement::where('user_id', $userId)->findOrFail($id);
        $fm->active = true;
        $fm->save();

        return response()->json(['data' => $fm]);
    }


    private function computeFirstRun(string $frequency, int $interval, ?array $weekdays, Carbon $start): Carbon
    {
        $start = $start->copy()->startOfDay();

        return match ($frequency) {
            'daily'   => $start,
            'weekly'  => $this->nextWeeklyDate($start, $weekdays),
            'monthly' => $start, // primera corrida en start
            default   => $start,
        };
    }

    private function nextWeeklyDate(Carbon $from, ?array $weekdays): Carbon
    {
        $days = $weekdays && count($weekdays) ? array_map('intval', $weekdays) : [(int)$from->dayOfWeek];
        sort($days);

        $dow = (int)$from->dayOfWeek;
        foreach ($days as $d) {
            if ($d === $dow) return $from->copy();
            if ($d > $dow)   return $from->copy()->next($d);
        }

        $first = $days[0];
        return $from->copy()->next($first)->addWeek();
    }
}
