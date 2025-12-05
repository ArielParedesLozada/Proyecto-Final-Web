<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Tymon\JWTAuth\Facades\JWTAuth;
use GuzzleHttp\Client;

class GoogleAuthController extends Controller
{

    public function redirectToGoogle(Request $request)
    {
        $state = $this->makeStatePayload($request->query('redirect_to'));

        $params = $this->extractGoogleParams($request);
        $params['state'] = $state;

        return $this->googleDriver()
            ->stateless()
            ->with($params)
            ->redirect();
    }


    public function handleGoogleCallback(Request $request)
    {
        try {
            $this->configureSSLForDevelopment();

            $googleUser = $this->getGoogleUserAlternative();

            $user = User::where('email', $googleUser->email)->first();
            
            if (!$user) {
                $user = User::where('google_id', $googleUser->id)->first();
            }

            if ($user) {
                $updateData = [];
                
                if (!$user->google_id) {
                    $updateData['google_id'] = $googleUser->id;
                }
                
                if (!$user->provider || $user->provider !== 'google') {
                    $updateData['provider'] = 'google';
                }
                
                $hasCustomPhoto = !empty($user->profile_image_url) && 
                                  $user->profile_image_url !== $googleUser->avatar &&
                                  !str_contains($user->profile_image_url, 'googleusercontent.com') &&
                                  !str_contains($user->profile_image_url, 'googleapis.com');
                
                if ($googleUser->avatar && !$hasCustomPhoto && $user->profile_image_url !== $googleUser->avatar) {
                    $updateData['profile_image_url'] = $googleUser->avatar;
                }
                
                if (!empty($updateData)) {
                    $user->update($updateData);
                }
            } else {
                $nameParts = explode(' ', $googleUser->name, 2);
                $firstName = $nameParts[0];
                $lastName = isset($nameParts[1]) ? $nameParts[1] : '';

                $user = User::create([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'provider' => 'google',
                    'profile_image_url' => $googleUser->avatar,
                    'email_verified_at' => now(), 
                    'password_hash' => null, 
                ]);
            }

            $token = JWTAuth::fromUser($user);

            $redirectUrl = $this->resolveRedirectUrl($request);

            return redirect()->away(
                $this->appendQuery($redirectUrl, [
                    'token' => $token,
                    'user' => urlencode(json_encode([
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'profile_image_url' => $user->profile_image_url,
                        'provider' => $user->provider,
                    ])),
                ])
            );

        } catch (\Exception $e) {
            $redirectUrl = $this->resolveRedirectUrl($request);

            return redirect()->away(
                $this->appendQuery($redirectUrl, [
                    'error' => urlencode('Error al autenticar con Google: ' . $e->getMessage()),
                ])
            );
        }
    }

    public function getGoogleUrl()
    {
        try {
            $request = request();
            $state = $this->makeStatePayload($request->query('redirect_to'));

            $params = $this->extractGoogleParams($request);
            $params['state'] = $state;

            $url = $this->googleDriver()
                ->stateless()
                ->with($params)
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'success' => true,
                'url' => $url
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener URL de Google OAuth: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener URL de Google OAuth: ' . $e->getMessage()
            ], 500);
        }
    }

    private function configureSSLForDevelopment()
    {
        putenv('CURL_SSL_VERIFYPEER=false');
        putenv('CURL_SSL_VERIFYHOST=false');
        
        curl_setopt_array(curl_init(), [
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_RETURNTRANSFER => true,
        ]);
        
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

    private function getGoogleUserAlternative()
    {
        try {
            return $this->googleDriver()->stateless()->user();
        } catch (\Exception $e) {
            $code = request()->get('code');
            $state = request()->get('state');
            
            if (!$code) {
                throw new \Exception('Código de autorización no encontrado');
            }

            $client = new Client([
                'verify' => false,
                'timeout' => 30,
            ]);

            $tokenResponse = $client->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'redirect_uri' => config('services.google.redirect'),
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                ]
            ]);

            $tokenData = json_decode($tokenResponse->getBody(), true);
            $accessToken = $tokenData['access_token'];

            $userResponse = $client->get('https://www.googleapis.com/oauth2/v2/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ]
            ]);

            $userData = json_decode($userResponse->getBody(), true);

            return (object) [
                'id' => $userData['id'],
                'email' => $userData['email'],
                'name' => $userData['name'],
                'avatar' => $userData['picture'],
                'picture' => $userData['picture'],
            ];
        }
    }

    private function makeStatePayload(?string $redirectTo): string
    {
        $payload = [
            'redirect_to' => $this->sanitizeRedirect($redirectTo) ?? $this->defaultRedirectUrl(),
            'ts' => now()->timestamp,
        ];

        return base64_encode(json_encode($payload));
    }

    private function resolveRedirectUrl(Request $request): string
    {
        $redirect = $this->sanitizeRedirect($request->query('redirect_to'));

        if (!$redirect && $request->has('state')) {
            $state = base64_decode($request->query('state'), true);
            if ($state) {
                $data = json_decode($state, true);
                if (is_array($data)) {
                    $redirect = $this->sanitizeRedirect($data['redirect_to'] ?? null);
                }
            }
        }

        return $redirect ?: $this->defaultRedirectUrl();
    }

    private function sanitizeRedirect(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $parts = parse_url($url);
        if (!$parts || empty($parts['scheme'])) {
            return null;
        }

        $scheme = strtolower($parts['scheme']);

        if (in_array($scheme, ['mobile', 'exp', 'expo'], true)) {
            return $url;
        }

        if (in_array($scheme, ['http', 'https'], true)) {
            $frontendBase = rtrim(Config::get('app.frontend_url', Config::get('app.url', 'http://localhost')), '/');
            if (Str::startsWith($url, $frontendBase)) {
                return $url;
            }
        }

        return null;
    }

    private function defaultRedirectUrl(): string
    {
        $frontendBase = rtrim(Config::get('app.frontend_url', Config::get('app.url', 'http://localhost')), '/');

        return $frontendBase . '/auth/google/callback';
    }

    private function appendQuery(string $url, array $params): string
    {
        $params = array_filter($params, fn ($value) => $value !== null && $value !== '');

        if (empty($params)) {
            return $url;
        }

        $separator = Str::contains($url, '?') ? '&' : '?';

        $queryString = collect($params)
            ->map(fn ($value, $key) => $key . '=' . $value)
            ->implode('&');

        return $url . $separator . $queryString;
    }

    private function googleDriver(): GoogleProvider
    {
        /** @var GoogleProvider $driver */
        $driver = Socialite::driver('google');
        return $driver;
    }

    private function extractGoogleParams(Request $request): array
    {
        $allowed = ['prompt', 'access_type', 'login_hint', 'include_granted_scopes', 'hd'];

        $params = [];
        foreach ($allowed as $key) {
            $value = $request->query($key);
            if (!is_null($value) && $value !== '') {
                $params[$key] = $value;
            }
        }

        return $params;
    }
}