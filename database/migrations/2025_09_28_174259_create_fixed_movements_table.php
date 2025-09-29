<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fixed_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goal_id')->constrained('goals')->cascadeOnDelete();

            $table->enum('type', ['income', 'expense']);

            $table->decimal('amount', 12, 2);

            $table->enum('frequency', ['daily', 'weekly', 'monthly'])->default('monthly');
            $table->unsignedSmallInteger('interval')->default(1); 

            $table->json('weekdays')->nullable();

            // ventana de vigencia
            $table->date('start_date')->nullable(); 
            $table->date('end_date')->nullable();   // opcional

            // control de ejecución
            $table->date('next_run');               
            $table->date('last_run')->nullable();   

            $table->boolean('active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'goal_id']);
            $table->index(['active', 'next_run']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fixed_movements');
    }
};
