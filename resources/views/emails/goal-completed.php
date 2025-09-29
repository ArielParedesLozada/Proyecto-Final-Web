<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Meta Completada!</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .celebration {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .title {
            color: #059669;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .goal-info {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .goal-name {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 12px;
        }
        .goal-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
        }
        .detail-item {
            text-align: center;
        }
        .detail-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .detail-value {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
        }
        .message {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
        }
        .message-text {
            font-size: 16px;
            color: #92400e;
            font-weight: 500;
        }
        .cta-button {
            display: inline-block;
            background: #059669;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .stats {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .stats-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 12px;
            text-align: center;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="celebration">🎉</div>
            <h1 class="title">¡Felicitaciones!</h1>
            <p class="subtitle">Has completado exitosamente tu meta de ahorro</p>
        </div>

        <div class="goal-info">
            <div class="goal-name"><?php echo e($goal->name); ?></div>
            <div class="goal-details">
                <div class="detail-item">
                    <div class="detail-label">Meta Objetivo</div>
                    <div class="detail-value">$<?php echo number_format($goal->target_amount, 0, ',', '.'); ?></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Ahorrado</div>
                    <div class="detail-value">$<?php echo number_format($totalSaved, 0, ',', '.'); ?></div>
                </div>
            </div>
        </div>

        <div class="message">
            <p class="message-text">
                ¡Increíble trabajo! Has demostrado una gran disciplina financiera al completar esta meta. 
                Este logro es un paso importante hacia tu estabilidad financiera.
            </p>
        </div>

        <div class="stats">
            <div class="stats-title">Resumen de tu logro</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value"><?php 
                        $categoryTranslations = [
                            'emergency_fund' => 'Fondo de Emergencia',
                            'education' => 'Educación',
                            'vacation' => 'Vacaciones',
                            'home' => 'Hogar',
                            'car' => 'Automóvil',
                            'wedding' => 'Boda',
                            'business' => 'Negocio',
                            'retirement' => 'Jubilación',
                            'health' => 'Salud',
                            'others' => 'Otros'
                        ];
                        echo $categoryTranslations[$goal->category] ?? ucfirst(str_replace('_', ' ', $goal->category));
                    ?></div>
                    <div class="stat-label">Categoría</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value"><?php echo e($completionDate); ?></div>
                    <div class="stat-label">Fecha de Completado</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">100%</div>
                    <div class="stat-label">Progreso</div>
                </div>
            </div>
        </div>

        <div style="text-align: center;">
            <a href="<?php echo config('app.url'); ?>/goals" class="cta-button">
                Ver mis metas
            </a>
        </div>

        <div class="footer">
            <p>Este es un logro importante. ¡Sigue así con tus próximas metas financieras!</p>
            <p><strong>FinSave</strong> - Tu compañero en el ahorro inteligente</p>
        </div>
    </div>
</body>
</html>
