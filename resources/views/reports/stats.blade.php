<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Reporte de Estadísticas</title>
  <style>
    body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 12px; color:#0f172a; }
    .title { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
    .muted { color:#475569; font-size: 12px; }
    .section { margin-top: 16px; }
    .card { border:1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 10px; }
    table { width:100%; border-collapse: collapse; }
    th, td { border:1px solid #e2e8f0; padding:6px; }
    th { background:#f8fafc; text-align:left; }
    .kpi { font-size: 14px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="title">Reporte de Estadísticas</div>
  <div class="muted">
    Rango:
    @if(!empty($params['start']) && !empty($params['end']))
      {{ $params['start'] }} — {{ $params['end'] }}
    @else
      Últimos 6 meses
    @endif
  </div>

  <div class="section">
    <div class="card">
      <strong>Estados de metas</strong>
      <table>
        <thead><tr><th>Estado</th><th>Cantidad</th></tr></thead>
        <tbody>
        @forelse($status as $row)
          <tr><td>{{ $row['status'] }}</td><td>{{ $row['value'] }}</td></tr>
        @empty
          <tr><td colspan="2">Sin datos en el rango.</td></tr>
        @endforelse
        </tbody>
      </table>
    </div>

    <div class="card">
      <strong>Ahorro real vs sugerido (mensual)</strong>
      <table>
        <thead><tr><th>Mes</th><th>Real</th><th>Sugerido</th></tr></thead>
        <tbody>
        @forelse($rvs as $m)
          <tr><td>{{ $m['month'] }}</td><td>{{ $m['real'] }}</td><td>{{ $m['suggested'] }}</td></tr>
        @empty
          <tr><td colspan="3">Sin datos.</td></tr>
        @endforelse
        </tbody>
      </table>
    </div>

    <div class="card">
      <strong>Cumplimiento mensual (%)</strong>
      <table>
        <thead><tr><th>Mes</th><th>Cumplimiento</th></tr></thead>
        <tbody>
        @forelse($comp as $m)
          <tr><td>{{ $m['month'] }}</td><td>{{ $m['completion'] }}%</td></tr>
        @empty
          <tr><td colspan="2">Sin datos.</td></tr>
        @endforelse
        </tbody>
      </table>
    </div>

    <div class="card">
      <strong>Categorías de metas</strong>
      <table>
        <thead><tr><th>Categoría</th><th>Cantidad</th></tr></thead>
        <tbody>
        @forelse($cats as $c)
          <tr><td>{{ $c['category'] }}</td><td>{{ $c['value'] }}</td></tr>
        @empty
          <tr><td colspan="2">Sin datos.</td></tr>
        @endforelse
        </tbody>
      </table>
    </div>

    <div class="card">
      <strong>Ingresos vs Gastos (mensual)</strong>
      <table>
        <thead><tr><th>Mes</th><th>Ingresos</th><th>Gastos</th></tr></thead>
        <tbody>
        @forelse($inex as $m)
          <tr><td>{{ $m['month'] }}</td><td>{{ $m['incomes'] }}</td><td>{{ $m['expenses'] }}</td></tr>
        @empty
          <tr><td colspan="3">Sin datos.</td></tr>
        @endforelse
        </tbody>
      </table>
    </div>

    <div class="card">
      <strong>Top 5 metas por avance</strong>
      <table>
        <thead><tr><th>Meta</th><th>Progreso (%)</th></tr></thead>
        <tbody>
        @forelse($top as $g)
          <tr><td>{{ $g['name'] }}</td><td>{{ $g['progress'] }}%</td></tr>
        @empty
          <tr><td colspan="2">Sin datos.</td></tr>
        @endforelse
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
