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
        // Verificar si la tabla transactions existe antes de intentar actualizarla
        if (!Schema::hasTable('transactions')) {
            return;
        }
        
        // Verificar si la columna is_fixed existe
        if (!Schema::hasColumn('transactions', 'is_fixed')) {
            return;
        }
        
        // Actualizar transacciones existentes que no tienen is_fixed configurado
        // Por defecto, las transacciones existentes serán marcadas como 'variable' (false)
        DB::table('transactions')
            ->whereNull('is_fixed')
            ->update(['is_fixed' => false]);
            
        // También actualizar las que tienen NULL explícitamente
        DB::table('transactions')
            ->where('is_fixed', null)
            ->update(['is_fixed' => false]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hay necesidad de revertir esta migración
        // ya que solo estamos estableciendo valores por defecto
    }
};
