import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import {
  TextInput,
  Text,
  Card,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { Button, PasswordInput } from '../components/ui';
import { router } from 'expo-router';
import { login } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const theme = useTheme();
  const { login: setUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Correo no válido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await login(email.trim(), password);
      
      if (response && response.success && response.data?.user) {
        setUser(response.data.user);
        router.replace('/(tabs)');
      } else {
        setSnackbarMessage(response?.message || 'Error al iniciar sesión');
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      const message = error.message || 'Credenciales inválidas. Inténtalo nuevamente.';
      setSnackbarMessage(message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20,
          backgroundColor: theme.colors.background,
        }}
      >
        <Card style={{ backgroundColor: theme.colors.surface, borderRadius: 16 }}>
          <Card.Content style={{ padding: 24 }}>
            <Text
              variant="headlineMedium"
              style={{
                marginBottom: 8,
                color: theme.colors.onSurface,
                fontWeight: '600',
              }}
            >
              Iniciar sesión
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                marginBottom: 32,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Accede para planificar tus metas, registrar ingresos y controlar gastos
            </Text>

            <TextInput
              label="Correo electrónico"
              placeholder="usuario@correo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              left={<TextInput.Icon icon="email" />}
              error={!!errors.email}
              style={{ marginBottom: 16 }}
            />
            {errors.email && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.error, marginTop: -12, marginBottom: 8 }}
              >
                {errors.email}
              </Text>
            )}

            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              errorMessage={errors.password}
            />

            <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
              <Button
                variant="text"
                onPress={() => {
                  // TODO: Implementar pantalla de recuperación de contraseña
                  console.log('Recuperar contraseña - Pendiente');
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </View>

            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={{ marginBottom: 16 }}
            >
              Ingresar
            </Button>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 24,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: theme.colors.outline,
                }}
              />
              <Text
                variant="bodySmall"
                style={{
                  marginHorizontal: 16,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                o
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: theme.colors.outline,
                }}
              />
            </View>

            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                ¿No tienes cuenta?{' '}
              </Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: '600',
                  }}
                  variant="bodyMedium"
                >
                  Crear cuenta
                </Text>
              </Pressable>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>{snackbarMessage}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

