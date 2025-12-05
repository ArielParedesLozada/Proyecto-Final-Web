<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a {{ $appName }}!</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
        }
        .welcome-title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .user-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #6366f1;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .features {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-item {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .feature-item::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ $appName }}</div>
            <h1 class="welcome-title">¡Bienvenido! 🎉</h1>
        </div>

        <div class="content">
            <p>Hola <strong>{{ $user->first_name }} {{ $user->last_name }}</strong>,</p>
            
            <p>¡Nos complace darte la bienvenida a <strong>{{ $appName }}</strong>! Tu cuenta ha sido creada exitosamente y ya puedes comenzar a planificar tus metas financieras.</p>

            <div class="user-info">
                <h3>Información de tu cuenta:</h3>
                <p><strong>Nombre:</strong> {{ $user->first_name }} {{ $user->last_name }}</p>
                <p><strong>Email:</strong> {{ $user->email }}</p>
                <p><strong>Fecha de registro:</strong> {{ $user->created_at->format('d/m/Y H:i') }}</p>
            </div>

            <div class="features">
                <h3>¿Qué puedes hacer en {{ $appName }}?</h3>
                <div class="feature-item">Crear y gestionar metas de ahorro personalizadas</div>
                <div class="feature-item">Registrar tus ingresos y gastos diarios</div>
                <div class="feature-item">Visualizar estadísticas detalladas de tu progreso</div>
                <div class="feature-item">Recibir notificaciones sobre el cumplimiento de tus objetivos</div>
                <div class="feature-item">Acceder a tu dashboard personalizado desde cualquier dispositivo</div>
            </div>

            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para ayudarte a alcanzar tus objetivos financieros.</p>

            <p>¡Que tengas un excelente día!</p>
            <p><strong>El equipo de {{ $appName }}</strong></p>
        </div>

        <div class="footer">
            <p>Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
            <p>&copy; {{ date('Y') }} {{ $appName }}. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
