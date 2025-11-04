<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('goal_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goal_id')->constrained('goals')->cascadeOnDelete();
            
            $table->enum('type', ['goal_created', 'goal_completed']);
            $table->string('goal_name');
            
            // Para goal_created: información del ahorro sugerido
            $table->decimal('suggested_savings', 12, 2)->nullable();
            $table->string('savings_unit')->nullable(); // diario, semanal, mensual
            $table->decimal('target_amount', 12, 2)->nullable();
            $table->decimal('remaining_amount', 12, 2)->nullable();
            $table->string('remaining_period')->nullable(); // "7 días", "2 semanas", etc.
            
            // Para goal_completed: información de completado
            $table->decimal('completed_amount', 12, 2)->nullable();
            
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['user_id', 'read']);
            $table->index(['user_id', 'created_at']);
            $table->index(['goal_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_notifications');
    }
};

