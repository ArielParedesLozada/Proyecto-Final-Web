<?php

return [
    /*
    |--------------------------------------------------------------------------
    | cURL SSL Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para manejar SSL en cURL para desarrollo local
    |
    */

    'ssl' => [
        'verify_peer' => env('CURL_SSL_VERIFY_PEER', false),
        'verify_host' => env('CURL_SSL_VERIFY_HOST', false),
        'timeout' => env('CURL_TIMEOUT', 30),
    ],

    'default_options' => [
        CURLOPT_SSL_VERIFYPEER => env('CURL_SSL_VERIFY_PEER', false),
        CURLOPT_SSL_VERIFYHOST => env('CURL_SSL_VERIFY_HOST', false),
        CURLOPT_TIMEOUT => env('CURL_TIMEOUT', 30),
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT => 'Laravel Socialite',
    ],
];
