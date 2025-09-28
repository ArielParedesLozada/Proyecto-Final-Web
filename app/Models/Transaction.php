<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'goal_id',
        'type',
        'is_fixed',
        'amount',
        'occurred_on'
    ];

    protected $casts = [
        'is_fixed' => 'boolean',
        'occurred_on' => 'date',
    ];

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    protected static function booted()
    {
        // Verificar si una meta se completa después de agregar una transacción
        static::created(function (Transaction $transaction) {
            if ($transaction->type === 'income') {
                // Solo verificar para transacciones de ingreso (ahorro)
                $transaction->goal->checkAndUpdateCompletion();
            }
        });

        // Verificar si una meta se completa después de actualizar una transacción
        static::updated(function (Transaction $transaction) {
            if ($transaction->type === 'income') {
                $transaction->goal->checkAndUpdateCompletion();
            }
        });
    }
}
