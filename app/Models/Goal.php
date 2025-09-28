<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
            if ($goal->status === 'completed') {
                return;
            }
            if (!empty($goal->target_date)) {
                $today = Carbon::today()->toDateString();
                if ($goal->target_date < $today) {
                    $goal->status = 'expired';
                }
            }
        });
    }
}
