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
}
