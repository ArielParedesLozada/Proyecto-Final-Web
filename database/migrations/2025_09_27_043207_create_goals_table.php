<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->decimal('target_amount', 12, 2);
            $table->date('target_date'); 
            $table->enum('category', [
                'emergency_fund',
                'education',
                'vacation',
                'home',
                'car',
                'wedding',
                'business',
                'retirement',
                'health',
                'others'
            ])->default('others');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'completed', 'expired'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
