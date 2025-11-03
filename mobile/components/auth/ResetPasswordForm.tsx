import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { Button, PasswordInput, Toast } from '../ui';
import { verifyResetCode, resetPassword, getCodeTimeRemaining, requestPasswordReset } from '../../services/auth';
import { router } from 'expo-router';

interface ResetPasswordFormProps {
  email: string;
  onBack: () => void;
}

export default function ResetPasswordForm({ email, onBack }: ResetPasswordFormProps) {
  const theme = useTheme();
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const [serverError, setServerError] = useState(''); 
  const [success, setSuccess] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');

  useEffect(() => {
    if (serverError) {
      setToastMessage(serverError);
      setToastType('error');
      setToastVisible(true);
      const timer = setTimeout(() => {
        setServerError('');
        setToastVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [serverError]);

  useEffect(() => {
    if (success) {
      setToastMessage(success);
      setToastType('success');
      setToastVisible(true);
      const timer = setTimeout(() => {
        setSuccess('');
        setToastVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (codeVerified) {
      const timer = setTimeout(() => {
        setCodeVerified(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [codeVerified]);

  useEffect(() => {
    const fetchTimeRemaining = async () => {
      try {
        const response = await getCodeTimeRemaining(email);
        if (response.success) {
          setTimeRemaining(response.time_remaining || 0);
          setCanResend(response.expired || false);
        } else {
          setTimeRemaining(0);
          setCanResend(true);
        }
      } catch (err) {
        console.error('Error fetching time remaining:', err);
        setTimeRemaining(0);
        setCanResend(true);
      }
    };

    fetchTimeRemaining();

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResendCode = async () => {
    setResending(true);
    setError(''); 
    setServerError(''); 
    setSuccess('');

    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setSuccess('Código reenviado exitosamente');
        try {
          const timeResponse = await getCodeTimeRemaining(email);
          if (timeResponse.success) {
            setTimeRemaining(timeResponse.time_remaining || 180);
            setCanResend(timeResponse.expired || false);
          }
        } catch (timeErr) {
          console.error('Error getting time after resend:', timeErr);
          setTimeRemaining(180);
          setCanResend(false);
        }
      } else {
        setServerError(response.message || 'Error al reenviar el código');
      }
    } catch (err: any) {
      setServerError(err.message || 'Error al reenviar el código');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError(''); 
    setServerError(''); 
    setSuccess('');

    try {
      const response = await verifyResetCode(email, code);
      if (response.success) {
        setCodeVerified(true);
        setStep('reset');
      } else {
        setError(response.message || 'Código inválido'); 
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar el código'); 
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('La contraseña debe incluir letras y números');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await resetPassword(email, code, password, passwordConfirmation);
      if (response.success) {
        setSuccess('Contraseña restablecida exitosamente. Redirigiendo al login...');
        setLoading(false);
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      } else {
        setError(response.message || 'Error al restablecer la contraseña');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <View>
        <TextInput
          label="Código de verificación"
          placeholder="123456"
          value={code}
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, '').slice(0, 6);
            setCode(cleaned);
            if (error) setError('');
          }}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={6}
          error={!!error}
          left={<TextInput.Icon icon="key" />}
          style={{ marginBottom: 16 }}
        />
        {error && (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.error, marginTop: -12, marginBottom: 8 }}
          >
            {error}
          </Text>
        )}

        <View style={{ marginBottom: 16, alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {timeRemaining > 0 ? (
              <>
                Tiempo restante:{' '}
                <Text style={{ fontWeight: '600', color: theme.colors.primary }}>
                  {formatTime(timeRemaining)}
                </Text>
              </>
            ) : (
              <Text style={{ color: theme.colors.error }}>
                El código ha expirado
              </Text>
            )}
          </Text>
        </View>

        {timeRemaining > 0 && !canResend && (
          <Button
            variant="primary"
            onPress={handleVerifyCode}
            loading={loading}
            disabled={loading || code.length !== 6}
            fullWidth
            style={{ marginBottom: 16 }}
          >
            {loading ? 'Verificando...' : 'Verificar código'}
          </Button>
        )}

        {(canResend || timeRemaining === 0) && (
          <Button
            variant="secondary"
            onPress={handleResendCode}
            loading={resending}
            disabled={resending}
            fullWidth
            style={{ marginBottom: 16 }}
          >
            {resending ? 'Reenviando...' : 'Reenviar código'}
          </Button>
        )}

        <Button
          variant="text"
          onPress={onBack}
          fullWidth
        >
          Volver
        </Button>

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />
      </View>
    );
  }

  return (
    <View>
      {codeVerified && !success && (
        <View
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.primaryContainer,
          }}
        >
          <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
            Código verificado correctamente
          </Text>
        </View>
      )}

      {error && (
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.error, marginBottom: 8 }}
        >
          {error}
        </Text>
      )}

      <PasswordInput
        label="Nueva contraseña"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError('');
        }}
        errorMessage={undefined}
        helperText="Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números."
        disabled={!!success}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword(!showPassword)}
      />

      <PasswordInput
        label="Confirmar contraseña"
        placeholder="••••••••"
        value={passwordConfirmation}
        onChangeText={(text) => {
          setPasswordConfirmation(text);
          if (error) setError('');
        }}
        errorMessage={undefined}
        disabled={!!success}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword(!showPassword)}
      />

      <Button
        variant="primary"
        onPress={handleResetPassword}
        loading={loading}
        disabled={
          loading ||
          !!success ||
          !password ||
          !passwordConfirmation ||
          password !== passwordConfirmation
        }
        fullWidth
        style={{ marginBottom: 16 }}
      >
        {loading ? 'Restableciendo...' : success ? 'Redirigiendo...' : 'Restablecer contraseña'}
      </Button>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

