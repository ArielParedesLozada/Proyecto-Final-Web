<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meta en Declive - Alerta</title>
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
        .alert-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .title {
            color: #dc2626;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .alert-box {
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        .alert-text {
            color: #dc2626;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .alert-subtext {
            color: #991b1b;
            font-size: 14px;
        }
        .goal-info {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .goal-name {
            font-size: 20px;
            font-weight: bold;
            color: #0369a1;
            margin-bottom: 16px;
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
            color: #0369a1;
        }
        .detail-value.deficit {
            color: #dc2626;
        }
        .progress-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .progress-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 12px;
            text-align: center;
        }
        .progress-bar {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            margin-bottom: 12px;
            position: relative;
            width: 100%;
        }
        .progress-fill {
            background: #dc2626;
            height: 100%;
            border-radius: 10px;
            min-width: 2px;
            display: block;
        }
        .progress-text {
            text-align: center;
            font-size: 14px;
            color: #6b7280;
        }
        .recommendations {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .recommendations h3 {
            color: #92400e;
            font-size: 18px;
            margin-bottom: 12px;
            text-align: center;
        }
        .recommendations ul {
            color: #92400e;
            padding-left: 20px;
        }
        .recommendations li {
            margin-bottom: 8px;
        }
        .cta-button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .cta-button:hover {
            background: #b91c1c;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .urgency {
            background: #dc2626;
            color: white;
            padding: 12px;
            border-radius: 6px;
            text-align: center;
            font-weight: bold;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .goal-details {
                grid-template-columns: 1fr;
            }
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">⚠️</div>
            <h1 class="title">¡Alerta de Meta en Declive!</h1>
            <p class="subtitle">Tu meta de ahorro necesita atención urgente</p>
        </div>

        <div class="alert-box">
            <div class="alert-text">Tu ahorro está por debajo del objetivo sugerido</div>
            <div class="alert-subtext">Tienes <?php echo e($daysUntilDeadline); ?> días para recuperar el ritmo</div>
        </div>

        <div class="goal-info">
            <div class="goal-name"><?php echo e($goal->name); ?></div>
            <div class="goal-details">
                <div class="detail-item">
                    <div class="detail-label">Meta Objetivo</div>
                    <div class="detail-value">$<?php echo number_format($goal->target_amount, 0, ',', '.'); ?></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Ahorrado Actual</div>
                    <div class="detail-value">$<?php echo number_format($currentSaved, 0, ',', '.'); ?></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sugerido para Hoy</div>
                    <div class="detail-value">$<?php echo number_format($suggestedAmount, 0, ',', '.'); ?></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Déficit</div>
                    <div class="detail-value deficit">$<?php echo number_format($deficit, 0, ',', '.'); ?></div>
                </div>
            </div>
        </div>

        <div class="progress-section">
            <div class="progress-title">Progreso Actual</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: <?php echo min(100, max(2, $progressPercentage)); ?>%"></div>
            </div>
            <div class="progress-text"><?php echo number_format($progressPercentage, 1); ?>% completado</div>
        </div>

        <?php if ($daysUntilDeadline <= 7): ?>
        <div class="urgency">
            🚨 URGENTE: Solo quedan <?php echo e($daysUntilDeadline); ?> días para completar tu meta
        </div>
        <?php endif; ?>

        <div class="recommendations">
            <h3>💡 Recomendaciones para recuperar el ritmo:</h3>
            <ul>
                <li>Revisa tus gastos mensuales y reduce los no esenciales</li>
                <li>Considera aumentar la frecuencia de tus aportes</li>
                <li>Busca fuentes adicionales de ingresos temporales</li>
                <li>Revisa si puedes ajustar la fecha objetivo de tu meta</li>
                <li>Establece recordatorios semanales para hacer aportes</li>
            </ul>
        </div>

        <div class="footer">
            <p>Esta alerta se envió el <?php echo e($alertDate); ?> porque tu progreso está por debajo del objetivo sugerido.</p>
            <p><strong>FinSave</strong> - Te ayudamos a mantenerte en el camino hacia tus objetivos financieros</p>
        </div>
    </div>
</body>
</html>
