<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\GoalNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class GoalController extends Controller
{
    private function loadGoalWithSums(int $goalId)
    {
        $goal = Goal::where('id', $goalId)
            ->where('user_id', Auth::id())
            ->withSum(['transactions as income_sum' => function ($q) {
                $q->where('type', 'income');
            }], 'amount')
            ->withSum(['transactions as expense_sum' => function ($q) {
                $q->where('type', 'expense');
            }], 'amount')
            ->firstOrFail();

        $goal->accumulated = (float) (($goal->income_sum ?? 0) - ($goal->expense_sum ?? 0));

        return $goal;
    }

    public function index(Request $request)
    {
        $userId = Auth::id();

        $perPage = (int) ($request->get('per_page', $request->get('pageSize', 6)));
        $perPage = min(max($perPage, 1), 50);

        $search       = trim((string) $request->get('search', ''));
        $categoria    = $request->get('categoria');         
        $estadoCsv    = (string) $request->get('estado', ''); 
        $estados      = array_filter(array_map('trim', explode(',', $estadoCsv)));
        $creadaDesde  = $request->get('creada_desde');    
        $venceHasta   = $request->get('vence_hasta');     
        $vence7dias   = filter_var($request->get('vence_7_dias', null), FILTER_VALIDATE_BOOLEAN);

        $query = Goal::where('user_id', $userId)
            ->when($search !== '', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->when($categoria, function ($q) use ($categoria) {
                $q->where('category', $categoria);
            })
            ->when(!empty($estados), function ($q) use ($estados) {
                $q->whereIn('status', $estados);
            }, function ($q) {
                $q->where('status', 'active');
            })
            ->when($creadaDesde, function ($q) use ($creadaDesde) {
                $q->whereDate('created_at', '>=', $creadaDesde);
            })
            ->when($venceHasta, function ($q) use ($venceHasta) {
                $q->whereDate('target_date', '<=', $venceHasta);
            })
            ->when($vence7dias, function ($q) {
                $hoy = Carbon::today()->toDateString();
                $limite = Carbon::today()->addDays(7)->toDateString();
                $q->where('status', 'active')
                    ->whereBetween('target_date', [$hoy, $limite]);
            })
            ->withSum(['transactions as income_sum' => function ($q) {
                $q->where('type', 'income');
            }], 'amount')
            ->withSum(['transactions as expense_sum' => function ($q) {
                $q->where('type', 'expense');
            }], 'amount')
            ->orderByDesc('created_at');

        $paginator = $query->paginate($perPage)->appends($request->query());

        $items = $paginator->getCollection()->map(function ($g) {
            $g->accumulated = (float) (($g->income_sum ?? 0) - ($g->expense_sum ?? 0));
            unset($g->income_sum, $g->expense_sum);
            return $g;
        });

        $paginator->setCollection($items);

        return response()->json([
            'message'     => 'OK',
            'data'        => $paginator->items(),
            'total'       => $paginator->total(),
            'per_page'    => $paginator->perPage(),
            'last_page'   => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'pagination'  => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    public function history(Request $request)
    {
        $userId = Auth::id();

        $perPage = (int) ($request->get('per_page', $request->get('pageSize', 6)));
        $perPage = min(max($perPage, 1), 50);

        $search       = trim((string) $request->get('search', ''));
        $categoria    = $request->get('categoria');         
        $estadoCsv    = (string) $request->get('estado', ''); 
        $estados      = array_filter(array_map('trim', explode(',', $estadoCsv)));
        $creadaDesde  = $request->get('creada_desde');    
        $venceHasta   = $request->get('vence_hasta');     
        $vence7dias   = filter_var($request->get('vence_7_dias', null), FILTER_VALIDATE_BOOLEAN);

        $query = Goal::where('user_id', $userId)
            ->when($search !== '', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->when($categoria, function ($q) use ($categoria) {
                $q->where('category', $categoria);
            })
            ->when(!empty($estados), function ($q) use ($estados) {
                $q->whereIn('status', $estados);
            })
            ->when($creadaDesde, function ($q) use ($creadaDesde) {
                $q->whereDate('created_at', '>=', $creadaDesde);
            })
            ->when($venceHasta, function ($q) use ($venceHasta) {
                $q->whereDate('target_date', '<=', $venceHasta);
            })
            ->when($vence7dias, function ($q) {
                $hoy = Carbon::today()->toDateString();
                $limite = Carbon::today()->addDays(7)->toDateString();
                $q->where('status', 'active')
                    ->whereBetween('target_date', [$hoy, $limite]);
            })
            ->withSum(['transactions as income_sum' => function ($q) {
                $q->where('type', 'income');
            }], 'amount')
            ->withSum(['transactions as expense_sum' => function ($q) {
                $q->where('type', 'expense');
            }], 'amount')
            ->orderByDesc('created_at');

        $paginator = $query->paginate($perPage)->appends($request->query());

        $items = $paginator->getCollection()->map(function ($g) {
            $g->accumulated = (float) (($g->income_sum ?? 0) - ($g->expense_sum ?? 0));
            unset($g->income_sum, $g->expense_sum);
            return $g;
        });

        $paginator->setCollection($items);

        return response()->json([
            'message'     => 'OK',
            'data'        => $paginator->items(),
            'total'       => $paginator->total(),
            'per_page'    => $paginator->perPage(),
            'last_page'   => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'pagination'  => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    public function show($id)
    {
        $goal = $this->loadGoalWithSums((int) $id);

        return response()->json([
            'message' => 'OK',
            'data'    => $goal,
        ]);
    }

    public function store(StoreGoalRequest $request)
    {
        $goal = Goal::create([
            'user_id'       => Auth::id(),
            'name'          => $request->name,
            'target_amount' => $request->target_amount,
            'target_date'   => $request->target_date,
            'category'      => $request->category,
            'description'   => $request->description,
            'status'        => 'active',
        ]);

        // Crear notificación de meta creada con ahorro sugerido
        $this->createGoalCreatedNotification($goal);

        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message' => 'Meta creada correctamente',
            'data'    => $goal
        ], 201);
    }

    private function createGoalCreatedNotification(Goal $goal)
    {
        $today = Carbon::today();
        $targetDate = Carbon::parse($goal->target_date);
        $diasRestantes = $today->diffInDays($targetDate, false);
        $montoRestante = $goal->target_amount;

        if ($diasRestantes <= 0 || $montoRestante <= 0) {
            return;
        }

        $ahorroSugerido = 0;
        $unidadTexto = 'mensual';
        $periodoTexto = '';

        if ($diasRestantes <= 7) {
            $ahorroSugerido = ceil($montoRestante / max(1, $diasRestantes));
            $unidadTexto = 'diario';
            $periodoTexto = $diasRestantes . ' ' . ($diasRestantes === 1 ? 'día' : 'días');
        } else if ($diasRestantes <= 30) {
            $semanasRestantes = ceil($diasRestantes / 7);
            $ahorroSugerido = ceil($montoRestante / $semanasRestantes);
            $unidadTexto = 'semanal';
            $periodoTexto = $semanasRestantes . ' ' . ($semanasRestantes === 1 ? 'semana' : 'semanas');
        } else {
            $mesesRestantes = $today->diffInMonths($targetDate) + 1;
            $mesesRestantes = max(1, (int) round($mesesRestantes));
            $ahorroSugerido = ceil($montoRestante / max(1, $mesesRestantes));
            $unidadTexto = 'mensual';
            $periodoTexto = $mesesRestantes . ' ' . ($mesesRestantes === 1 ? 'mes' : 'meses');
        }

        GoalNotification::create([
            'user_id' => $goal->user_id,
            'goal_id' => $goal->id,
            'type' => 'goal_created',
            'goal_name' => $goal->name,
            'suggested_savings' => $ahorroSugerido,
            'savings_unit' => $unidadTexto,
            'target_amount' => $goal->target_amount,
            'remaining_amount' => $montoRestante,
            'remaining_period' => $periodoTexto,
        ]);
    }

    private function createGoalCompletedNotification(Goal $goal, float $completedAmount)
    {
        // Verificar si ya existe una notificación de completado para esta meta
        $exists = GoalNotification::where('goal_id', $goal->id)
            ->where('type', 'goal_completed')
            ->exists();

        if ($exists) {
            return; // Ya existe, no crear duplicado
        }

        GoalNotification::create([
            'user_id' => $goal->user_id,
            'goal_id' => $goal->id,
            'type' => 'goal_completed',
            'goal_name' => $goal->name,
            'completed_amount' => $completedAmount,
        ]);
    }

    public function update(Request $request, $id)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($id);

        $goal->update($request->only([
            'name',
            'target_amount',
            'target_date',
            'category',
            'description',
            'status'
        ]));

        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message' => 'Meta actualizada correctamente',
            'data'    => $goal
        ]);
    }


    public function destroy($id)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($id);
        $goal->delete();

        return response()->json([
            'message' => 'Meta eliminada correctamente'
        ]);
    }

    public function addTransaction(StoreTransactionRequest $request, $goalId)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($goalId);

        $tx = Transaction::create([
            'user_id'     => Auth::id(),
            'goal_id'     => $goal->id,
            'type'        => $request->type,
            'is_fixed'    => $request->boolean('is_fixed'),
            'amount'      => $request->amount,
            'occurred_on' => now()->toDateString(),
        ]);

        $totals = Transaction::selectRaw("
            SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) as inc,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as exp
        ")->where('goal_id', $goal->id)->first();

        $accumulated = (float) (($totals->inc ?? 0) - ($totals->exp ?? 0));
        $progressPct = min(100, (int) round(($accumulated / max($goal->target_amount, 1)) * 100));

        $wasCompleted = $goal->status === 'completed';
        
        if (
            $progressPct >= 100
            && (is_null($goal->target_date) || now()->toDateString() <= $goal->target_date)
            && $goal->status !== 'completed'
        ) {
            $goal->status = 'completed';
            $goal->save();
            
            // Crear notificación de meta completada
            $this->createGoalCompletedNotification($goal, $accumulated);
        }

        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message'      => 'Movimiento registrado',
            'transaction'  => $tx,
            'goal'         => $goal,
            'accumulated'  => round($accumulated, 2),
            'progress_pct' => $progressPct
        ], 201);
    }

    public function listTransactions($goalId, Request $request)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($goalId);

        $query = Transaction::where('goal_id', $goal->id);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('occurred_on', [
                $request->start_date,
                $request->end_date
            ]);
        }

        if ($request->has('is_fixed')) {
            $isFixedValue = $request->is_fixed;
            $isFixedBool = filter_var($isFixedValue, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            
            \Illuminate\Support\Facades\Log::info('Filtering by is_fixed:', [
                'is_fixed_raw' => $isFixedValue, 
                'is_fixed_type' => gettype($isFixedValue),
                'is_fixed_bool' => $isFixedBool,
                'goal_id' => $goalId
            ]);
            
            $query->where('is_fixed', $isFixedBool);
        }

        $items = $query->orderByDesc('occurred_on')
            ->orderByDesc('id')
            ->get();

        $allTransactions = Transaction::where('goal_id', $goal->id)->get(['id', 'type', 'is_fixed', 'amount', 'occurred_on']);
        \Illuminate\Support\Facades\Log::info('All transactions for goal ' . $goalId . ':', $allTransactions->toArray());
        \Illuminate\Support\Facades\Log::info('Filtered transactions:', $items->toArray());

        return response()->json([
            'message' => 'Movimientos obtenidos',
            'data'    => $items
        ]);
    }

    public function deleteTransaction($id)
    {
        $tx = Transaction::where('user_id', Auth::id())->findOrFail($id);
        $goal = $tx->goal;
        $tx->delete();

        $totals = Transaction::selectRaw("
            SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) as inc,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as exp
        ")->where('goal_id', $goal->id)->first();

        $accumulated = (float) (($totals->inc ?? 0) - ($totals->exp ?? 0));
        $progressPct = min(100, (int) round(($accumulated / max($goal->target_amount, 1)) * 100));

        if ($goal->status === 'completed' && $progressPct < 100) {
            $goal->status = 'active';
            $goal->save();
        }

        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message'      => 'Movimiento eliminado',
            'goal'         => $goal,
            'accumulated'  => round($accumulated, 2),
            'progress_pct' => $progressPct
        ]);
    }
}
