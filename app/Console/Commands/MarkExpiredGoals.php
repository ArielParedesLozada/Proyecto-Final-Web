<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Goal;
use Carbon\Carbon;

class MarkExpiredGoals extends Command
{
    protected $signature = 'goals:expire';
    protected $description = 'Marcar como expired todas las metas activas cuya target_date ya pasó';

    public function handle(): int
    {
        $today = Carbon::today()->toDateString();

        $affected = Goal::where('status', 'active')
            ->whereDate('target_date', '<', $today)
            ->update(['status' => 'expired']);

        $this->info("Metas vencidas marcadas: {$affected}");
        return Command::SUCCESS;
    }
}
