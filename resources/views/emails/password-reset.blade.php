<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de verificación - {{ $appName }}</title>
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
        .title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .code-container {
            background-color: #f8fafc;
            border: 2px dashed #6366f1;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #6366f1;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        .code-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 5px;
        }
        .warning-text {
            color: #92400e;
            font-size: 14px;
        }
        .info {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-item {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .info-item::before {
            content: "ℹ️";
            position: absolute;
            left: 0;
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
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .expires {
            color: #dc2626;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ $appName }}</div>
            <h1 class="title">🔐 Código de verificación</h1>
        </div>

        <div class="content">
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>{{ $appName }}</strong>.</p>
            
            <p>Para continuar con el proceso, utiliza el siguiente código de verificación:</p>

            <div class="code-container">
                <div class="code-label">Tu código de verificación es:</div>
                <div class="code">{{ $code }}</div>
                <div class="code-label">Válido por 3 minutos</div>
            </div>

            <div class="warning">
                <div class="warning-title">⚠️ Importante</div>
                <div class="warning-text">
                    Este código expira en <span class="expires">{{ $expiresAt->format('H:i') }}</span> ({{ $expiresAt->diffForHumans() }}).
                    Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                </div>
            </div>

            <div class="info">
                <h3>Instrucciones:</h3>
                <div class="info-item">Ingresa este código en la página de restablecimiento de contraseña</div>
                <div class="info-item">El código es válido por 3 minutos desde su envío</div>
                <div class="info-item">Solo puedes usar este código una vez</div>
                <div class="info-item">Si el código expira, solicita uno nuevo</div>
            </div>

            <p>Si tienes problemas para acceder a tu cuenta, contáctanos a través de nuestro soporte.</p>

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
