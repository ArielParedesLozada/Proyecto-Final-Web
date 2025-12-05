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
        // Índices para la tabla goals (solo si no existen)
        if (!$this->indexExists('goals', 'goals_user_created_idx')) {
            Schema::table('goals', function (Blueprint $table) {
                $table->index(['user_id', 'created_at'], 'goals_user_created_idx');
            });
        }
        
        if (!$this->indexExists('goals', 'goals_user_target_date_idx')) {
            Schema::table('goals', function (Blueprint $table) {
                $table->index(['user_id', 'target_date'], 'goals_user_target_date_idx');
            });
        }
        
        if (!$this->indexExists('goals', 'goals_status_created_idx')) {
            Schema::table('goals', function (Blueprint $table) {
                $table->index(['status', 'created_at'], 'goals_status_created_idx');
            });
        }

        // Índices para la tabla transactions
        if (!$this->indexExists('transactions', 'transactions_user_occurred_idx')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->index(['user_id', 'occurred_on'], 'transactions_user_occurred_idx');
            });
        }
        
        if (!$this->indexExists('transactions', 'transactions_goal_occurred_idx')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->index(['goal_id', 'occurred_on'], 'transactions_goal_occurred_idx');
            });
        }
        
        if (!$this->indexExists('transactions', 'transactions_user_type_occurred_idx')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->index(['user_id', 'type', 'occurred_on'], 'transactions_user_type_occurred_idx');
            });
        }
        
        if (!$this->indexExists('transactions', 'transactions_occurred_type_idx')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->index(['occurred_on', 'type'], 'transactions_occurred_type_idx');
            });
        }

        // Índices para la tabla fixed_movements
        if (!$this->indexExists('fixed_movements', 'fixed_movements_user_created_idx')) {
            Schema::table('fixed_movements', function (Blueprint $table) {
                $table->index(['user_id', 'created_at'], 'fixed_movements_user_created_idx');
            });
        }
    }

    private function indexExists($table, $indexName)
    {
        $indexes = DB::select("SHOW INDEX FROM {$table}");
        return collect($indexes)->contains('Key_name', $indexName);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar índices de goals
        Schema::table('goals', function (Blueprint $table) {
            $table->dropIndex('goals_user_status_idx');
            $table->dropIndex('goals_user_created_idx');
            $table->dropIndex('goals_user_target_date_idx');
            $table->dropIndex('goals_status_created_idx');
        });

        // Eliminar índices de transactions
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_user_goal_idx');
            $table->dropIndex('transactions_user_occurred_idx');
            $table->dropIndex('transactions_goal_occurred_idx');
            $table->dropIndex('transactions_user_type_occurred_idx');
            $table->dropIndex('transactions_occurred_type_idx');
        });

        // Eliminar índices de fixed_movements
        Schema::table('fixed_movements', function (Blueprint $table) {
            $table->dropIndex('fixed_movements_user_active_idx');
            $table->dropIndex('fixed_movements_user_created_idx');
        });
    }
};
