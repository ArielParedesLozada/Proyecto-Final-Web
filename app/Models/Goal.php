<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Mail\GoalCompletedEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class Goal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'target_date',
        'category',
        'description',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Calcular el monto total ahorrado en esta meta
     */
    public function getTotalSavedAttribute()
    {
        return $this->transactions()
            ->where('type', 'income')
            ->sum('amount');
    }

    /**
     * Verificar si la meta se ha completado automáticamente
     */
    public function checkAndUpdateCompletion()
    {
        if ($this->status === 'completed') {
            return false; // Ya está completada
        }

        $totalSaved = $this->total_saved;
        
        if ($totalSaved >= $this->target_amount) {
            // Marcar como completada
            $this->update(['status' => 'completed']);
            
            // Enviar email de notificación
            try {
                Mail::to($this->user->email)->send(new GoalCompletedEmail($this, $this->user));
            } catch (\Exception $e) {
                // Log el error pero no fallar la operación
                Log::error('Error sending goal completion email: ' . $e->getMessage());
            }
            
            return true; // Se completó automáticamente
        }

        return false;
    }

    protected static function booted()
    {
        static::deleting(function (Goal $goal) {
            if ($goal->isForceDeleting()) {
                // hard delete de la meta => hard delete de transacciones
                $goal->transactions()->withTrashed()->forceDelete();
            } else {
                // soft delete de la meta => soft delete de transacciones
                $goal->transactions()->delete();
            }
        });

        static::restoring(function (Goal $goal) {
            // restaurar transacciones si restauras la meta
            $goal->transactions()->withTrashed()->restore();
        });
        
        static::saving(function (Goal $goal) {
            // Solo verificar si la meta ha expirado
            if ($goal->status !== 'completed' && !empty($goal->target_date)) {
                $today = Carbon::today()->toDateString();
                if ($goal->target_date < $today) {
                    $goal->status = 'expired';
                }
            }
        });
    }
}
