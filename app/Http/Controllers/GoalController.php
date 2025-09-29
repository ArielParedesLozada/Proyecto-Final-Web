<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Goal;
use App\Models\Transaction;
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

        // ingresos - gastos (como float)
        $goal->accumulated = (float) (($goal->income_sum ?? 0) - ($goal->expense_sum ?? 0));

        return $goal;
    }

    /**
     * Listar metas del usuario autenticado (con filtros)
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $perPage = (int) ($request->get('per_page', $request->get('pageSize', 6)));
        $perPage = min(max($perPage, 1), 50);

        // filtros
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
                // Por defecto, solo mostrar metas activas si no se especifica estado
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

    /**
     * Listar historial de metas (todas las metas sin filtro por defecto)
     */
    public function history(Request $request)
    {
        $userId = Auth::id();

        $perPage = (int) ($request->get('per_page', $request->get('pageSize', 6)));
        $perPage = min(max($perPage, 1), 50);

        // filtros
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

    /**
     * Mostrar detalle de una meta
     */
    public function show($id)
    {
        $goal = $this->loadGoalWithSums((int) $id);

        return response()->json([
            'message' => 'OK',
            'data'    => $goal,
        ]);
    }

    /**
     * Crear una meta nueva
     */
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

        // Devolver enriquecida (con accumulated)
        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message' => 'Meta creada correctamente',
            'data'    => $goal
        ], 201);
    }

    /**
     * Actualizar una meta
     */
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

        // Devolver enriquecida (con accumulated)
        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message' => 'Meta actualizada correctamente',
            'data'    => $goal
        ]);
    }

    /**
     * Eliminar una meta 
     */
    public function destroy($id)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($id);
        $goal->delete();

        return response()->json([
            'message' => 'Meta eliminada correctamente'
        ]);
    }

    /**
     * Agregar Ingreso/Gasto
     */
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

        // Recalcular progreso (ingresos - gastos)
        $totals = Transaction::selectRaw("
            SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) as inc,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as exp
        ")->where('goal_id', $goal->id)->first();

        $accumulated = (float) (($totals->inc ?? 0) - ($totals->exp ?? 0));
        $progressPct = min(100, (int) round(($accumulated / max($goal->target_amount, 1)) * 100));

        // Si llegó a 100% antes o en la fecha, completa (considera target_date null)
        if (
            $progressPct >= 100
            && (is_null($goal->target_date) || now()->toDateString() <= $goal->target_date)
            && $goal->status !== 'completed'
        ) {
            $goal->status = 'completed';
            $goal->save();
        }

        // Devolver meta enriquecida para que el front no rebote
        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message'      => 'Movimiento registrado',
            'transaction'  => $tx,
            'goal'         => $goal,
            'accumulated'  => round($accumulated, 2),
            'progress_pct' => $progressPct
        ], 201);
    }

    /**
     * Listar movimientos de una meta
     */
    public function listTransactions($goalId, Request $request)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($goalId);

        $query = Transaction::where('goal_id', $goal->id);

        // Filtro por fechas
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('occurred_on', [
                $request->start_date,
                $request->end_date
            ]);
        }

        // Filtro por tipo de transacción (fijo/variable)
        if ($request->has('is_fixed')) {
            $query->where('is_fixed', $request->is_fixed);
        }

        $items = $query->orderByDesc('occurred_on')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'message' => 'Movimientos obtenidos',
            'data'    => $items
        ]);
    }

    /**
     * Eliminar movimiento y recalcular
     */
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

        // Si estaba completed y bajó de 100, vuelve a active
        if ($goal->status === 'completed' && $progressPct < 100) {
            $goal->status = 'active';
            $goal->save();
        }

        // Devolver meta enriquecida para actualizar UI
        $goal = $this->loadGoalWithSums($goal->id);

        return response()->json([
            'message'      => 'Movimiento eliminado',
            'goal'         => $goal,
            'accumulated'  => round($accumulated, 2),
            'progress_pct' => $progressPct
        ]);
    }
}
