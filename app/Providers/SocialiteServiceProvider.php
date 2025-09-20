<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\SocialiteServiceProvider as BaseSocialiteServiceProvider;

class SocialiteServiceProvider extends BaseSocialiteServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        parent::register();
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Configurar SSL para desarrollo
        $this->configureSSL();
    }

    /**
     * Configurar SSL para desarrollo local
     */
    private function configureSSL()
    {
        // Configurar opciones globales de cURL para desarrollo
        curl_setopt_array(curl_init(), [
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_RETURNTRANSFER => true,
        ]);

        // Configurar contexto HTTP/HTTPS
        if (function_exists('stream_context_set_default')) {
            stream_context_set_default([
                'http' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'timeout' => 30,
                ],
                'https' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'timeout' => 30,
                ]
            ]);
        }
    }
}