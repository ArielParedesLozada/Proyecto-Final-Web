import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Button from '@/components/ui/Button';
import FrequencySelector from './FrequencySelector';

export interface EditRuleFormProps {
  frequency: 'daily' | 'weekly' | 'monthly';
  amount: string;
  onFrequencyChange: (frequency: 'daily' | 'weekly' | 'monthly') => void;
  onAmountChange: (amount: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function EditRuleForm({
  frequency,
  amount,
  onFrequencyChange,
  onAmountChange,
  onSave,
  onCancel,
  saving = false,
}: EditRuleFormProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <FrequencySelector
        value={frequency}
        onChange={onFrequencyChange}
        label="Frecuencia"
      />

      <View style={styles.section}>
        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Monto de la regla
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
              borderColor: theme.colors.outline,
            },
          ]}
          placeholder="0.00"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          onPress={onSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
          fullWidth
        >
          Guardar cambios
        </Button>
        <Button
          variant="outlined"
          onPress={onCancel}
          style={styles.button}
          fullWidth
        >
          Cancelar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
  },
  button: {
    width: '100%',
  },
});

