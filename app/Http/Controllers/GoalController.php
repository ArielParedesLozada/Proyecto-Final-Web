<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoalRequest;
use App\Models\Goal;
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
}
