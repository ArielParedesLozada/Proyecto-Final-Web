import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { RequestResetCode, ResetPasswordForm } from '../components/auth';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');

  const handleCodeSent = (userEmail: string) => {
    setEmail(userEmail);
    setStep('reset');
  };

  const handleBack = () => {
    setStep('request');
    setEmail('');
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
              Recuperar contraseña
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                marginBottom: 32,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Te ayudaremos a restablecer tu contraseña de forma segura
            </Text>

            {step === 'request' ? (
              <RequestResetCode onSuccess={handleCodeSent} />
            ) : (
              <ResetPasswordForm email={email} onBack={handleBack} />
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

