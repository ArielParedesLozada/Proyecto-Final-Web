import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import {
  TextInput,
  Text,
  Card,
  useTheme,
} from 'react-native-paper';
import { Button, PasswordInput, ImagePicker, Toast } from '../ui';
import { router } from 'expo-router';
import { register } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterForm() {
  const theme = useTheme();
  const { login: setUser } = useAuth();

  const [values, setValues] = useState({
    profile_image_url: null as string | null,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState<{
    profile_image_url?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('info');
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!values.profile_image_url) {
      newErrors.profile_image_url = 'La imagen de perfil es obligatoria';
    }

    if (!values.first_name.trim()) {
      newErrors.first_name = 'Los nombres son obligatorios';
    }

    if (!values.last_name.trim()) {
      newErrors.last_name = 'Los apellidos son obligatorios';
    }

    if (!values.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      newErrors.email = 'Correo no válido';
    }

    const pwd = values.password;
    if (!pwd) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (pwd.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
      newErrors.password = 'Debe incluir letras y números';
    }

    if (!values.password_confirmation) {
      newErrors.password_confirmation = 'Confirma tu contraseña';
    } else if (values.password_confirmation !== values.password) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return (
      !!values.profile_image_url &&
      values.first_name.trim() !== '' &&
      values.last_name.trim() !== '' &&
      values.email.trim() !== '' &&
      /^\S+@\S+\.\S+$/.test(values.email) &&
      values.password.length >= 8 &&
      /[A-Za-z]/.test(values.password) &&
      /\d/.test(values.password) &&
      values.password_confirmation === values.password
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await register({
        profile_image_url: values.profile_image_url!,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      if (response && response.success) {
        if (response.data?.user) {
          setUser(response.data.user);
        }

        setToastMessage(
          '¡Cuenta creada exitosamente! Te hemos enviado un correo de bienvenida. Redirigiendo...'
        );
        setToastType('success');
        setToastVisible(true);

        setTimeout(() => {
          router.replace('/login');
        }, 4000); // Aumentado a 4 segundos para que el usuario vea el mensaje
      } else {
        setToastMessage(response?.message || 'No se pudo crear la cuenta. Intenta nuevamente.');
        setToastType('error');
        setToastVisible(true);
      }
    } catch (error: any) {
      let message = 'No se pudo crear la cuenta. Intenta nuevamente.';

      if (error.message.includes('email') && error.message.includes('unique')) {
        message = 'Ese correo ya está registrado.';
      } else if (error.message.includes('Validation errors:')) {
        const specificErrors = error.message.replace('Validation errors: ', '');
        message = `Errores de validación: ${specificErrors}`;
      } else if (error.message.includes('validation')) {
        message = 'Por favor revisa los datos ingresados.';
      } else {
        message = error.message || message;
      }

      setToastMessage(message);
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateImage = (imageUri: string | null) => {
    setValues((prev) => ({ ...prev, profile_image_url: imageUri }));
    if (errors.profile_image_url) {
      setErrors((prev) => ({ ...prev, profile_image_url: undefined }));
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
              Crear cuenta
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                marginBottom: 32,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Regístrate para planificar tus metas, registrar ingresos y controlar tus gastos
            </Text>

            {/* Imagen de perfil - Primer campo */}
            <ImagePicker
              label="Foto de perfil"
              value={values.profile_image_url}
              onChange={updateImage}
              errorMessage={errors.profile_image_url}
              required
            />

            {/* Nombres y Apellidos en fila */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Nombres"
                  placeholder="Juan"
                  value={values.first_name}
                  onChangeText={(text) => updateField('first_name', text)}
                  mode="outlined"
                  autoCapitalize="words"
                  error={!!errors.first_name}
                  left={<TextInput.Icon icon="account" />}
                />
                {errors.first_name && (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.error, marginTop: 4 }}
                  >
                    {errors.first_name}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Apellidos"
                  placeholder="Pérez"
                  value={values.last_name}
                  onChangeText={(text) => updateField('last_name', text)}
                  mode="outlined"
                  autoCapitalize="words"
                  error={!!errors.last_name}
                />
                {errors.last_name && (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.error, marginTop: 4 }}
                  >
                    {errors.last_name}
                  </Text>
                )}
              </View>
            </View>

            {/* Email */}
            <TextInput
              label="Correo electrónico"
              placeholder="usuario@correo.com"
              value={values.email}
              onChangeText={(text) => updateField('email', text)}
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

            {/* Contraseña */}
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              value={values.password}
              onChangeText={(text) => updateField('password', text)}
              errorMessage={errors.password}
              helperText="Mínimo 8 caracteres, incluye letras y números."
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
            />

            {/* Confirmar Contraseña */}
            <PasswordInput
              label="Confirmar contraseña"
              placeholder="••••••••"
              value={values.password_confirmation}
              onChangeText={(text) => updateField('password_confirmation', text)}
              errorMessage={errors.password_confirmation}
              leftIcon="lock-outline"
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
            />

            {/* Botón de registro */}
            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={!isFormValid()}
              fullWidth
              style={{ marginBottom: 16 }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>

            {/* Enlace a login */}
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                ¿Ya tienes cuenta?{' '}
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
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Toast para errores y mensajes de éxito */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={toastType === 'success' ? 4000 : undefined}
        onDismiss={() => setToastVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

