<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goal_id')->constrained('goals')->cascadeOnDelete();
            $table->enum('type', ['income', 'expense']);
            $table->boolean('is_fixed')->default(false); // false=variable, true=fijo
            $table->decimal('amount', 12, 2);
            $table->date('occurred_on')->default(DB::raw('CURRENT_DATE'));
            $table->timestamps();
            $table->softDeletes();
            $table->index(['goal_id', 'type', 'is_fixed']);
            $table->index(['user_id', 'occurred_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
