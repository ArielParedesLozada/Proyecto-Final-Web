import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { Button, Toast } from '../ui';
import { requestPasswordReset } from '../../services/auth';
import { router } from 'expo-router';

interface RequestResetCodeProps {
  onSuccess: (email: string) => void;
}

export default function RequestResetCode({ onSuccess }: RequestResetCodeProps) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const [serverError, setServerError] = useState(''); 
  const [success, setSuccess] = useState('');
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

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('El correo es obligatorio');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Correo no válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(''); 
    setServerError(''); 
    setSuccess('');

    try {
      const response = await requestPasswordReset(email.trim());
      if (response.success) {
        setSuccess('Código de verificación enviado a tu correo electrónico');
        onSuccess?.(email.trim());
      } else {
        setServerError(response.message || 'Error al enviar el código');
      }
    } catch (err: any) {
      setServerError(err.message || 'Error al enviar el código de verificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        label="Correo electrónico"
        placeholder="usuario@correo.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError('');
        }}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        left={<TextInput.Icon icon="email" />}
        error={!!error}
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

      <Button
        variant="primary"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !!success}
        fullWidth
        style={{ marginBottom: 16 }}
      >
        {loading ? 'Enviando código...' : success ? 'Código enviado' : 'Enviar código'}
      </Button>

      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          ¿Recordaste tu contraseña?{' '}
        </Text>
        <Pressable onPress={() => router.push('/login')}>
          <Text
            style={{
              color: theme.colors.primary,
              fontWeight: '600',
            }}
            variant="bodyMedium"
          >
            Iniciar sesión
          </Text>
        </Pressable>
      </View>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

