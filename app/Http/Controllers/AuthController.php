<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PasswordReset;
use App\Mail\WelcomeEmail;
use App\Mail\PasswordResetEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => ['required', 'string', 'max:60'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'string', 'email', 'max:191', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'profile_image_url' => ['nullable', 'string', 'max:255', 'url'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'profile_image_url' => $request->profile_image_url,
        ]);

        $token = JWTAuth::fromUser($user);

        // Enviar correo de bienvenida
        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        } catch (\Exception $e) {
            // Log el error pero no fallar el registro
            \Log::error('Error sending welcome email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado correctamente',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'profile_image_url' => $user->profile_image_url,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales invalidas'
                ], 401);
            }
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not create token'
            ], 500);
        }

        $user = User::where('email', $request->email)->first();

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'profile_image_url' => $user->profile_image_url,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate($request->token);

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not logout'
            ], 500);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'profile_image_url' => $user->profile_image_url,
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at,
                    ]
                ]
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalid'
            ], 401);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'first_name' => ['sometimes', 'required', 'string', 'max:60'],
                'last_name' => ['sometimes', 'required', 'string', 'max:80'],
                'email' => ['sometimes', 'required', 'string', 'email', 'max:191', 'unique:users,email,' . $user->id],
                'profile_image_url' => ['nullable', 'string', 'max:255', 'url'],
            ], [
                'first_name.required' => 'Los nombres son obligatorios',
                'first_name.max' => 'Los nombres no pueden tener más de 60 caracteres',
                'last_name.required' => 'Los apellidos son obligatorios',
                'last_name.max' => 'Los apellidos no pueden tener más de 80 caracteres',
                'email.required' => 'El correo electrónico es obligatorio',
                'email.email' => 'El formato del correo no es válido',
                'email.unique' => 'Este correo ya está registrado por otro usuario',
                'email.max' => 'El correo no puede tener más de 191 caracteres',
                'profile_image_url.url' => 'La URL de la imagen no es válida',
                'profile_image_url.max' => 'La URL de la imagen no puede tener más de 255 caracteres'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Por favor, revisa los siguientes errores:',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->update($request->only(['first_name', 'last_name', 'email', 'profile_image_url']));

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'profile_image_url' => $user->profile_image_url,
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at,
                    ]
                ]
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalid'
            ], 401);
        }
    }

    /**
     * Solicitar código de verificación para restablecer contraseña
     */
    public function requestPasswordReset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ], [
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'El formato del correo no es válido',
            'email.exists' => 'No existe una cuenta con este correo electrónico'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Por favor, revisa los siguientes errores:',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;

        try {
            // Crear código de verificación
            $passwordReset = PasswordReset::createCode($email);

            // Enviar correo con el código
            Mail::to($email)->send(new PasswordResetEmail(
                $passwordReset->code,
                $email,
                $passwordReset->expires_at
            ));

            return response()->json([
                'success' => true,
                'message' => 'Código de verificación enviado a tu correo electrónico',
                'data' => [
                    'email' => $email,
                    'expires_at' => $passwordReset->expires_at->format('H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error sending password reset email: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el correo. Intenta nuevamente.'
            ], 500);
        }
    }

    /**
     * Verificar código de restablecimiento
     */
    public function verifyResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ], [
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'El formato del correo no es válido',
            'code.required' => 'El código es obligatorio',
            'code.size' => 'El código debe tener 6 dígitos'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Por favor, revisa los siguientes errores:',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $code = $request->code;

        if (PasswordReset::verifyCode($email, $code)) {
            return response()->json([
                'success' => true,
                'message' => 'Código verificado correctamente'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Código inválido o expirado'
            ], 400);
        }
    }

    /**
     * Restablecer contraseña con código de verificación
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|confirmed|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'password_confirmation' => 'required'
        ], [
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'El formato del correo no es válido',
            'email.exists' => 'No existe una cuenta con este correo electrónico',
            'code.required' => 'El código es obligatorio',
            'code.size' => 'El código debe tener 6 dígitos',
            'password.required' => 'La contraseña es obligatoria',
            'password.confirmed' => 'Las contraseñas no coinciden',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'password.regex' => 'La contraseña debe incluir letras mayúsculas, minúsculas y al menos un número',
            'password_confirmation.required' => 'La confirmación de contraseña es obligatoria'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Por favor, revisa los siguientes errores:',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $code = $request->code;
        $password = $request->password;

        // Verificar el código
        if (!PasswordReset::verifyCode($email, $code)) {
            return response()->json([
                'success' => false,
                'message' => 'Código inválido o expirado'
            ], 400);
        }

        try {
            // Buscar el usuario
            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // Actualizar la contraseña
            $user->update([
                'password_hash' => Hash::make($password)
            ]);

            // Marcar el código como usado
            PasswordReset::markAsUsed($email, $code);

            return response()->json([
                'success' => true,
                'message' => 'Contraseña restablecida exitosamente'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error resetting password: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al restablecer la contraseña. Intenta nuevamente.'
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'password' => 'required|confirmed|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
                'password_confirmation' => 'required'
            ], [
                'current_password.required' => 'La contraseña actual es obligatoria',
                'password.required' => 'La nueva contraseña es obligatoria',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.regex' => 'La contraseña debe incluir letras mayúsculas, minúsculas y al menos un número',
                'password_confirmation.required' => 'La confirmación de contraseña es obligatoria'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Por favor, revisa los siguientes errores:',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            if (!Hash::check($data['current_password'], $user->password_hash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La contraseña actual no es correcta.'
                ], 422);
            }

            $user->password_hash = Hash::make($data['password']);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada correctamente.'
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalid'
            ], 401);
        }
    }

    /**
     * Obtener tiempo restante del código de verificación
     */
    public function getCodeTimeRemaining(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ], [
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'El formato del correo no es válido',
            'email.exists' => 'No existe una cuenta con este correo electrónico'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Por favor, revisa los siguientes errores:',
                'errors' => $validator->errors()
            ], 422);
        }

        $timeRemaining = PasswordReset::getTimeRemaining($request->email);
        
        \Log::info("Time remaining for email {$request->email}: {$timeRemaining} seconds");
        
        return response()->json([
            'success' => true,
            'time_remaining' => $timeRemaining,
            'expired' => $timeRemaining === 0
        ]);
    }
}
