<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class StatsController extends Controller
{

    private function getRange(Request $request): array
    {
        $start = $request->query('start');
        $end   = $request->query('end');

        if ($start && $end) {
            try {
                $s = Carbon::createFromFormat('Y-m-d', $start)->startOfDay();
                $e = Carbon::createFromFormat('Y-m-d', $end)->endOfDay();
                if ($e->lt($s)) return [null, null];
                return [$s, $e];
            } catch (\Throwable $th) {
                return [null, null];
            }
        }
        return [null, null];
    }

    private function getMonthsRange(?Carbon $start, ?Carbon $end): array
    {
        if (!$start || !$end) {
            $end = Carbon::now()->endOfMonth();
            $start = (clone $end)->subMonths(5)->startOfMonth();
        } else {
            $start = (clone $start)->startOfMonth();
            $end   = (clone $end)->endOfMonth();
        }
        $period = CarbonPeriod::create($start, '1 month', $end);
        $months = [];
        foreach ($period as $m) {
            $months[] = $m->format('Y-m');
        }
        return $months;
    }

    private function mapMonthEndCarbon(array $months): array
    {
        $map = [];
        foreach ($months as $ym) {
            [$y, $m] = explode('-', $ym);
            $map[$ym] = Carbon::createMidnightDate((int)$y, (int)$m, 1)->endOfMonth();
        }
        return $map;
    }

    private function loadAccumulatedByGoal(?Carbon $start, ?Carbon $end): array
    {
        $userId = Auth::id();

        $q = Transaction::selectRaw("
                goal_id,
                SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) as inc,
                SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as exp
            ")
            ->where('user_id', $userId);

        if ($start && $end) {
            $q->whereBetween('occurred_on', [$start->toDateString(), $end->toDateString()]);
        }

        $q->groupBy('goal_id');

        $rows = $q->get();
        $map  = [];
        foreach ($rows as $r) {
            $map[$r->goal_id] = (float) (($r->inc ?? 0) - ($r->exp ?? 0));
        }
        return $map;
    }

    public function goalsStatusDistribution(Request $request)
    {
        [$start, $end] = $this->getRange($request);
        $userId = Auth::id();

        $q = Goal::selectRaw('status, COUNT(*) as c')
            ->where('user_id', $userId);

        if ($start && $end) {
            $q->whereBetween('created_at', [$start, $end]);
        }

        $q->groupBy('status');
        $rows = $q->get();

        $counts = [
            'active'    => 0,
            'completed' => 0,
            'expired'   => 0,
        ];

        foreach ($rows as $r) {
            $key = $r->status;
            if (isset($counts[$key])) {
                $counts[$key] = (int) $r->c;
            }
        }

        $data = [
            ['status' => 'Activa',       'value' => $counts['active']],
            ['status' => 'Completada',   'value' => $counts['completed']],
            ['status' => 'Vencida',      'value' => $counts['expired']],
        ];

        return response()->json(['data' => $data]);
    }


    public function monthlyRealVsSuggested(Request $request)
    {
        [$start, $end] = $this->getRange($request);
        $userId = Auth::id();
        $goalId = $request->query('goal_id');

        $months = $this->getMonthsRange($start, $end);
        $result = array_fill_keys($months, ['real' => 0.0, 'suggested' => 0.0]);

        $tx = Transaction::selectRaw("DATE_FORMAT(occurred_on, '%Y-%m') as ym,
                SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) inc,
                SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) exp")
            ->where('user_id', $userId);

        if ($goalId) $tx->where('goal_id', $goalId);
        if ($start && $end) $tx->whereBetween('occurred_on', [$start->toDateString(), $end->toDateString()]);

        $tx->groupBy('ym');
        foreach ($tx->get() as $r) {
            if (!isset($result[$r->ym])) continue;
            $result[$r->ym]['real'] = (float) (($r->inc ?? 0) - ($r->exp ?? 0));
        }

        $gq = Goal::where('user_id', $userId);
        if ($goalId) $gq->where('id', $goalId);
        $goals = $gq->get(['id', 'target_amount', 'created_at', 'target_date']);

        foreach ($goals as $g) {
            if (!$g->target_date) continue;
            $startMonth = Carbon::parse($g->created_at)->startOfMonth();
            $endMonth   = Carbon::createFromFormat('Y-m-d', $g->target_date)->endOfMonth();

            $s = $start ? max($startMonth, $start->copy()->startOfMonth()) : $startMonth;
            $e = $end   ? min($endMonth,   $end->copy()->endOfMonth())     : $endMonth;

            if ($e->lt($s)) continue;

            $period = CarbonPeriod::create($s, '1 month', $e);
            $monthsCount = iterator_count($period);
            if ($monthsCount <= 0) continue;

            $period = CarbonPeriod::create($s, '1 month', $e);
            $perMonth = $g->target_amount / $monthsCount;

            foreach ($period as $m) {
                $ym = $m->format('Y-m');
                if (!isset($result[$ym])) continue;
                $result[$ym]['suggested'] += (float) $perMonth;
            }
        }

        $data = [];
        foreach ($months as $ym) {
            $data[] = [
                'month'     => $ym,
                'real'      => round($result[$ym]['real'], 2),
                'suggested' => round($result[$ym]['suggested'], 2),
            ];
        }
        return response()->json(['data' => $data]);
    }

    public function monthlyCompletion(Request $request)
    {
        [$start, $end] = $this->getRange($request);
        $userId = Auth::id();

        $months = $this->getMonthsRange($start, $end);
        if (empty($months)) return response()->json(['data' => []]);

        $monthEnds = $this->mapMonthEndCarbon($months);
        $goals = Goal::where('user_id', $userId)->get(['id', 'target_amount']);

        $firstMonthStart = Carbon::createFromFormat('Y-m', $months[0])->startOfMonth();
        $lastMonthEnd    = Carbon::createFromFormat('Y-m', $months[count($months) - 1])->endOfMonth();

        $tx = Transaction::select('goal_id', 'occurred_on', 'type', 'amount')
            ->where('user_id', $userId)
            ->whereBetween('occurred_on', [$firstMonthStart->toDateString(), $lastMonthEnd->toDateString()])
            ->orderBy('occurred_on')
            ->get();

        $cumByGoal = [];
        $monthData = [];

        foreach ($months as $ym) {
            $monthEnd = $monthEnds[$ym];

            foreach ($tx as $row) {
                if (Carbon::parse($row->occurred_on)->gt($monthEnd)) break;
                $g = (int)$row->goal_id;
                if (!isset($cumByGoal[$g])) $cumByGoal[$g] = 0.0;
                $cumByGoal[$g] += ($row->type === 'income' ? (float)$row->amount : -(float)$row->amount);
            }

            $sumPct = 0.0;
            $count = 0;
            foreach ($goals as $g) {
                if ($g->target_amount <= 0) continue;
                $acc = $cumByGoal[$g->id] ?? 0.0;
                $pct = min(100, max(0, round(($acc / $g->target_amount) * 100)));
                $sumPct += $pct;
                $count++;
            }
            $avg = $count > 0 ? round($sumPct / $count, 2) : 0.0;
            $monthData[] = ['month' => $ym, 'completion' => $avg];
        }

        return response()->json(['data' => $monthData]);
    }

    public function categoryDistribution(Request $request)
    {
        [$start, $end] = $this->getRange($request);
        $userId = Auth::id();

        $q = Goal::selectRaw('category, COUNT(*) as c')
            ->where('user_id', $userId);

        if ($start && $end) {
            $q->whereBetween('created_at', [$start, $end]);
        }

        $q->groupBy('category');
        $rows = $q->get();

        $mapCat = [
            'emergency_fund' => 'Emergencia',
            'education'      => 'Educación',
            'vacation'       => 'Vacaciones',
            'home'           => 'Hogar',
            'car'            => 'Vehículo',
            'wedding'        => 'Boda',
            'business'       => 'Negocio',
            'retirement'     => 'Jubilación',
            'health'         => 'Salud',
            'others'         => 'Otros',
        ];

        $data = [];
        foreach ($rows as $r) {
            $data[] = [
                'category' => $mapCat[$r->category] ?? 'Otros',
                'value'    => (int) $r->c,
            ];
        }
        return response()->json(['data' => $data]);
    }

    public function monthlyIncomeExpense(Request $request)
    {
        [$start, $end] = $this->getRange($request);
        $userId = Auth::id();

        $months = $this->getMonthsRange($start, $end);
        $res = array_fill_keys($months, ['incomes' => 0.0, 'expenses' => 0.0]);

        $q = Transaction::selectRaw("DATE_FORMAT(occurred_on, '%Y-%m') as ym,
                SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) inc,
                SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) exp")
            ->where('user_id', $userId);

        if ($start && $end) $q->whereBetween('occurred_on', [$start->toDateString(), $end->toDateString()]);

        $q->groupBy('ym');
        foreach ($q->get() as $r) {
            if (!isset($res[$r->ym])) continue;
            $res[$r->ym]['incomes']  = (float) ($r->inc ?? 0);
            $res[$r->ym]['expenses'] = (float) ($r->exp ?? 0);
        }

        $data = [];
        foreach ($months as $ym) {
            $data[] = [
                'month'    => $ym,
                'incomes'  => round($res[$ym]['incomes'], 2),
                'expenses' => round($res[$ym]['expenses'], 2),
            ];
        }
        return response()->json(['data' => $data]);
    }

    public function topGoalsProgress(Request $request)
    {
        [$start, $end] = $this->getRange($request);
        $userId = Auth::id();

        $goals = Goal::where('user_id', $userId)->get(['id', 'name', 'target_amount']);
        $accum = $this->loadAccumulatedByGoal($start, $end);

        $rows = [];
        foreach ($goals as $g) {
            $acc = $accum[$g->id] ?? 0.0;
            $pct = $g->target_amount > 0 ? min(100, round(($acc / $g->target_amount) * 100)) : 0;
            $rows[] = ['name' => $g->name, 'progress' => $pct];
        }

        usort($rows, fn($a, $b) => $b['progress'] <=> $a['progress']);
        $data = array_slice($rows, 0, 5);

        return response()->json(['data' => $data]);
    }

    public function dashboardSummary(Request $request)
    {
        $userId = Auth::id();
        
        $end = Carbon::now();
        $start = (clone $end)->subMonths(11)->startOfMonth();
        $params12m = [
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
        ];

        $goals = Goal::where('user_id', $userId)
            ->withSum(['transactions as income_sum' => function ($q) {
                $q->where('type', 'income');
            }], 'amount')
            ->withSum(['transactions as expense_sum' => function ($q) {
                $q->where('type', 'expense');
            }], 'amount')
            ->get();

        $totalAhorrado = Transaction::where('user_id', $userId)
            ->whereBetween('occurred_on', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("
                SUM(CASE WHEN type='income' THEN amount ELSE 0 END) - 
                SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total
            ")
            ->value('total') ?? 0;

        $goalsActive = $goals->where('status', 'active')->map(function ($goal) {
            $accumulated = (float) (($goal->income_sum ?? 0) - ($goal->expense_sum ?? 0));
            return [
                'id' => $goal->id,
                'name' => $goal->name,
                'current' => max(0, min($goal->target_amount, $accumulated)),
                'target' => $goal->target_amount,
                'updatedAt' => $goal->updated_at,
            ];
        })->sortBy('name')->values();

        $goalsCompleted = $goals->where('status', 'completed')
            ->map(function ($goal) {
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'finishedAt' => $goal->updated_at ? $goal->updated_at->toDateString() : '',
                    'deadline' => $goal->target_date,
                    'updatedAt' => $goal->updated_at,
                ];
            })
            ->sortByDesc('updatedAt')
            ->take(20)
            ->values();

        $currentMonth = Carbon::now()->format('Y-m');
        $monthlyData = $this->calculateMonthlySuggested($goals, $currentMonth);
        
        $statusDistribution = $goals->groupBy('status')->map->count();
        $metasActivas = $statusDistribution->get('active', 0);

        return response()->json([
            'data' => [
                'totalAhorrado' => max(0, round($totalAhorrado)),
                'metaMensualSugerida' => round($monthlyData['suggested']),
                'progresoMensual' => $monthlyData['progress'],
                'metasActivas' => $metasActivas,
                'goalsActive' => $goalsActive,
                'goalsCompleted' => $goalsCompleted,
            ]
        ]);
    }

    private function calculateMonthlySuggested($goals, $currentMonth)
    {
        $suggested = 0;
        $real = 0;

        foreach ($goals as $goal) {
            if (!$goal->target_date) continue;

            $createdMonth = Carbon::parse($goal->created_at)->format('Y-m');
            $targetMonth = Carbon::parse($goal->target_date)->format('Y-m');

            if ($currentMonth >= $createdMonth && $currentMonth <= $targetMonth) {
                $monthsCount = Carbon::parse($goal->created_at)->diffInMonths(Carbon::parse($goal->target_date)) + 1;
                if ($monthsCount > 0) {
                    $suggested += $goal->target_amount / $monthsCount;
                }
            }

            $monthStart = Carbon::parse($currentMonth . '-01')->startOfMonth();
            $monthEnd = Carbon::parse($currentMonth . '-01')->endOfMonth();
            
            $monthlyTransactions = Transaction::where('goal_id', $goal->id)
                ->whereBetween('occurred_on', [$monthStart->toDateString(), $monthEnd->toDateString()])
                ->selectRaw("
                    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) - 
                    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total
                ")
                ->value('total') ?? 0;

            $real += $monthlyTransactions;
        }

        $progress = $suggested > 0 ? round(($real / $suggested) * 100) : 0;

        return [
            'suggested' => $suggested,
            'real' => $real,
            'progress' => $progress,
        ];
    }
}
