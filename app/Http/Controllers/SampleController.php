<?php

namespace App\Http\Controllers;

use App\Models\Sample;
use Illuminate\Http\Request;

class SampleController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Sample::all()
        ]);
    }
}
