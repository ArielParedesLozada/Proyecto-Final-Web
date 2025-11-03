<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoalNotification extends Model
{
    protected $fillable = [
        'user_id',
        'goal_id',
        'type',
        'goal_name',
        'suggested_savings',
        'savings_unit',
        'target_amount',
        'remaining_amount',
        'remaining_period',
        'completed_amount',
        'read',
        'read_at',
    ];

    protected $casts = [
        'suggested_savings' => 'decimal:2',
        'target_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'completed_amount' => 'decimal:2',
        'read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }
}

