<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf; 
use App\Http\Controllers\StatsController;

class StatsPdfController extends Controller
{
    public function download(Request $request)
    {
        // Reusa tus métodos existentes para armar los datos
        $stats = app(StatsController::class);

        $params = $request->only(['start', 'end']);
        $status  = $stats->goalsStatusDistribution($request)->getData(true)['data'] ?? [];
        $rvs     = $stats->monthlyRealVsSuggested($request)->getData(true)['data'] ?? [];
        $comp    = $stats->monthlyCompletion($request)->getData(true)['data'] ?? [];
        $cats    = $stats->categoryDistribution($request)->getData(true)['data'] ?? [];
        $inex    = $stats->monthlyIncomeExpense($request)->getData(true)['data'] ?? [];
        $top     = $stats->topGoalsProgress($request)->getData(true)['data'] ?? [];

        $pdf = PDF::loadView('reports.stats', compact('params', 'status', 'rvs', 'comp', 'cats', 'inex', 'top'))
            ->setPaper('a4', 'landscape');

        $filename = 'estadisticas_metas.pdf';
        return $pdf->download($filename);
    }
}
