<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use GuzzleHttp\Client;

class GoogleAuthController extends Controller
{

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }


    public function handleGoogleCallback()
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
                
                if ($googleUser->avatar && $user->profile_image_url !== $googleUser->avatar) {
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

            return redirect()->away(
                'http://localhost:8000/auth/google/callback?token=' . $token . '&user=' . urlencode(json_encode([
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'profile_image_url' => $user->profile_image_url,
                    'provider' => $user->provider,
                ]))
            );

        } catch (\Exception $e) {
            return redirect()->away(
                'http://localhost:8000/login?error=' . urlencode('Error al autenticar con Google: ' . $e->getMessage())
            );
        }
    }

    public function getGoogleUrl()
    {
        try {
            $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
            
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
            return Socialite::driver('google')->stateless()->user();
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
}