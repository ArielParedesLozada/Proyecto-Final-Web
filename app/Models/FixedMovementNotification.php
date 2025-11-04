<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedMovementNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_id',
        'fixed_movement_id',
        'goal_id',
        'type',
        'amount',
        'frequency',
        'goal_name',
        'read',
        'read_at',
    ];

    protected $casts = [
        'read' => 'boolean',
        'read_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function fixedMovement(): BelongsTo
    {
        return $this->belongsTo(FixedMovement::class);
    }

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}

