<?php

namespace App\Http\Controllers;

use App\Models\GoalNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalNotificationController extends Controller
{
    /**
     * Obtener notificaciones de metas
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        
        $query = GoalNotification::where('user_id', $userId);
        
        // Si se especifica 'all', obtener todas (leídas y no leídas), sino solo no leídas
        $all = filter_var($request->query('all', false), FILTER_VALIDATE_BOOLEAN);
        if (!$all) {
            $query->where('read', false);
        }
        
        $query->orderBy('created_at', 'desc');
        
        // Opcional: límite de notificaciones
        $limit = $request->query('limit', 50);
        if ($limit) {
            $query->limit($limit);
        }
        
        $notifications = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }
    
    /**
     * Marcar notificaciones como leídas
     */
    public function markAsRead(Request $request)
    {
        $userId = Auth::id();
        
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:goal_notifications,id',
        ]);
        
        GoalNotification::where('user_id', $userId)
            ->whereIn('id', $request->ids)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Notificaciones marcadas como leídas',
        ]);
    }
    
    /**
     * Obtener conteo de notificaciones no leídas
     */
    public function unreadCount()
    {
        $userId = Auth::id();
        
        $count = GoalNotification::where('user_id', $userId)
            ->where('read', false)
            ->count();
        
        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }
}

