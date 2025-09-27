<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Goal;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

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
     * Listar metas del usuario autenticado
     */
    public function index(Request $request)
    {
        $userId  = Auth::id();
        $perPage = (int) $request->get('pageSize', 6);
        $perPage = min(max($perPage, 1), 50);

        $query = Goal::where('user_id', $userId)
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
            'message' => 'OK',
            'data'    => $paginator->items(),
            'total'   => $paginator->total(),  
            'pagination' => [
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
    public function listTransactions($goalId)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($goalId);

        $items = Transaction::where('goal_id', $goal->id)
            ->orderByDesc('occurred_on')
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
