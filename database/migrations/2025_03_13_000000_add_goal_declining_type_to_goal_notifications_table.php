<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE goal_notifications MODIFY COLUMN type ENUM('goal_created', 'goal_completed', 'goal_declining') NOT NULL");
        
        Schema::table('goal_notifications', function (Blueprint $table) {
            $table->decimal('current_saved', 12, 2)->nullable()->after('completed_amount');
            $table->decimal('expected_amount', 12, 2)->nullable()->after('current_saved');
            $table->integer('days_until_deadline')->nullable()->after('expected_amount');
            $table->decimal('deficit', 12, 2)->nullable()->after('days_until_deadline');
            $table->decimal('progress_percentage', 5, 2)->nullable()->after('deficit');
        });
    }

    public function down(): void
    {
        Schema::table('goal_notifications', function (Blueprint $table) {
            $table->dropColumn([
                'current_saved',
                'expected_amount',
                'days_until_deadline',
                'deficit',
                'progress_percentage',
            ]);
        });
        
        DB::statement("ALTER TABLE goal_notifications MODIFY COLUMN type ENUM('goal_created', 'goal_completed') NOT NULL");
    }
};

