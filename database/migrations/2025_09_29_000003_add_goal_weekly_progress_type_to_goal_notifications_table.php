<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        
        DB::statement("ALTER TABLE goal_notifications MODIFY COLUMN type ENUM('goal_created', 'goal_completed', 'goal_declining', 'goal_weekly_progress') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE goal_notifications MODIFY COLUMN type ENUM('goal_created', 'goal_completed', 'goal_declining') NOT NULL");
    }
};


