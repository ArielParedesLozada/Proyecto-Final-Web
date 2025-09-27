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
    /**
     * Listar metas del usuario autenticado
     */
    public function index()
    {
        $goals = Goal::where('user_id', Auth::id())->get();

        return response()->json([
            'message' => 'Metas obtenidas correctamente',
            'data'    => $goals
        ]);
    }

    /**
     * Mostrar detalle de una meta
     */
    public function show($id)
    {
        $goal = Goal::where('user_id', Auth::id())->findOrFail($id);

        return response()->json([
            'message' => 'Meta obtenida correctamente',
            'data'    => $goal
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

    // Agregar Ingreso/Gasto
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

        $accumulated = ($totals->inc ?? 0) - ($totals->exp ?? 0);
        $progressPct = min(100, (int) round(($accumulated / max($goal->target_amount, 1)) * 100));

        // Si llegó a 100% antes o en la fecha, completa
        if ($progressPct >= 100 && now()->toDateString() <= $goal->target_date && $goal->status !== 'completed') {
            $goal->status = 'completed';
            $goal->save();
        }

        return response()->json([
            'message'      => 'Movimiento registrado',
            'transaction'  => $tx,
            'goal'         => $goal->fresh(),
            'accumulated'  => round($accumulated, 2),
            'progress_pct' => $progressPct
        ], 201);
    }

    // Listar movimientos de una meta
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

    // Eliminar movimiento y recalcular
    public function deleteTransaction($id)
    {
        $tx = Transaction::where('user_id', Auth::id())->findOrFail($id);
        $goal = $tx->goal;
        $tx->delete();

        $totals = Transaction::selectRaw("
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) as inc,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as exp
    ")->where('goal_id', $goal->id)->first();

        $accumulated = ($totals->inc ?? 0) - ($totals->exp ?? 0);
        $progressPct = min(100, (int) round(($accumulated / max($goal->target_amount, 1)) * 100));

        // Si estaba complete y bajó de 100, vuelve a active
        if ($goal->status === 'completed' && $progressPct < 100) {
            $goal->status = 'active';
            $goal->save();
        }

        return response()->json([
            'message'      => 'Movimiento eliminado',
            'accumulated'  => round($accumulated, 2),
            'progress_pct' => $progressPct
        ]);
    }
}
