<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FixedMovement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'goal_id',
        'type',
        'amount',
        'frequency',
        'interval',
        'weekdays',
        'start_date',
        'end_date',
        'next_run',
        'last_run',
        'active',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'interval'   => 'integer',
        'weekdays'   => 'array',
        'start_date' => 'date',
        'end_date'   => 'date',
        'next_run'   => 'date',
        'last_run'   => 'date',
        'active'     => 'boolean',
    ];

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }
}
