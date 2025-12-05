<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PasswordReset extends Model
{
    protected $fillable = [
        'email',
        'code',
        'expires_at',
        'used'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean'
    ];

    /**
     * Generar un código de verificación de 6 dígitos
     */
    public static function generateCode(): string
    {
        return str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Crear un nuevo código de verificación
     */
    public static function createCode(string $email): self
    {
        // Invalidar códigos anteriores para este email
        self::where('email', $email)->update(['used' => true]);

        // Crear nuevo código
        return self::create([
            'email' => $email,
            'code' => self::generateCode(),
            'expires_at' => Carbon::now()->addMinutes(3), // Expira en 3 minutos
            'used' => false
        ]);
    }

    /**
     * Verificar si el código es válido
     */
    public static function verifyCode(string $email, string $code): bool
    {
        $passwordReset = self::where('email', $email)
            ->where('code', $code)
            ->where('used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        return $passwordReset !== null;
    }

    /**
     * Marcar código como usado
     */
    public static function markAsUsed(string $email, string $code): bool
    {
        return self::where('email', $email)
            ->where('code', $code)
            ->update(['used' => true]) > 0;
    }

    /**
     * Limpiar códigos expirados
     */
    public static function cleanExpiredCodes(): int
    {
        return self::where('expires_at', '<', Carbon::now())->delete();
    }

    /**
     * Obtener el tiempo restante del código en segundos
     */
    public static function getTimeRemaining(string $email): int
    {
        $now = Carbon::now();
        
        $passwordReset = self::where('email', $email)
            ->where('used', false)
            ->where('expires_at', '>', $now)
            ->first();

        if (!$passwordReset) {
            \Log::info("No valid password reset found for email: {$email}");
            return 0;
        }

        $expiresAt = $passwordReset->expires_at;
        
        \Log::info("Password reset found - Email: {$email}, Now: {$now}, Expires: {$expiresAt}");
        
        // Calcular segundos restantes hasta la expiración
        if ($expiresAt->isFuture()) {
            $secondsRemaining = $now->diffInSeconds($expiresAt, false);
            \Log::info("Seconds remaining: {$secondsRemaining}");
            return max(0, $secondsRemaining);
        }
        
        \Log::info("Code has expired");
        return 0;
    }
}
