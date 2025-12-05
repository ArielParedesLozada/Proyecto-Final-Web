import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { Button, PasswordInput } from '@/components/ui';

export interface SecuritySectionProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onUpdatePassword: () => void;
  onClear: () => void;
  canChange: boolean;
  changing: boolean;
}

export default function SecuritySection({
  currentPassword,
  newPassword,
  confirmPassword,
  showPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onUpdatePassword,
  onClear,
  canChange,
  changing,
}: SecuritySectionProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <View>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Seguridad
            </Text>
            <Text variant="bodySmall" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Actualiza tu contraseña periódicamente.
            </Text>
          </View>
        </View>

        <View style={styles.fieldsContainer}>
          <PasswordInput
            label="Contraseña actual"
            value={currentPassword}
            onChangeText={onCurrentPasswordChange}
            placeholder="••••••••"
            showPassword={showPassword}
            onToggleShowPassword={onToggleShowPassword}
          />

          <PasswordInput
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={onNewPasswordChange}
            placeholder="••••••••"
            helperText="Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números."
            showPassword={showPassword}
            onToggleShowPassword={onToggleShowPassword}
          />

          <PasswordInput
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            placeholder="••••••••"
            showPassword={showPassword}
            onToggleShowPassword={onToggleShowPassword}
          />
        </View>

        <View style={styles.passwordActions}>
          <Button
            variant="outlined"
            onPress={onClear}
            style={styles.clearButton}
          >
            Limpiar
          </Button>
          <Button
            variant="primary"
            onPress={onUpdatePassword}
            disabled={changing || !canChange}
            loading={changing}
            style={styles.updateButton}
          >
            {changing ? 'Actualizando...' : 'Actualizar'}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    opacity: 0.7,
  },
  fieldsContainer: {
    gap: 16,
  },
  passwordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
  },
  clearButton: {
    flex: 1,
    minWidth: 100,
  },
  updateButton: {
    flex: 1,
    minWidth: 120,
  },
});

