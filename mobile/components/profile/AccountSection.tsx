import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card, TextInput } from 'react-native-paper';
import { Button } from '@/components/ui';

export interface AccountSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSave: () => void;
  hasChanges: boolean;
  saving: boolean;
}

export default function AccountSection({
  firstName,
  lastName,
  email,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onSave,
  hasChanges,
  saving,
}: AccountSectionProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Datos de la cuenta
          </Text>
          <Text variant="bodySmall" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Información básica para identificar tu perfil.
          </Text>
        </View>

        <View style={styles.fieldsContainer}>
          <TextInput
            label="Nombre"
            value={firstName}
            onChangeText={onFirstNameChange}
            mode="outlined"
            placeholder="Tu nombre"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Apellido"
            value={lastName}
            onChangeText={onLastNameChange}
            mode="outlined"
            placeholder="Tu apellido"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Correo"
            value={email}
            onChangeText={onEmailChange}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="usuario@correo.com"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={onSave}
            disabled={saving || !hasChanges}
            loading={saving}
            fullWidth
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    opacity: 0.7,
    marginBottom: 20,
  },
  fieldsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

