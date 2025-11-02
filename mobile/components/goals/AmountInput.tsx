import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'income' | 'expense';
  disabled?: boolean;
  error?: string;
}

export default function AmountInput({
  value,
  onChange,
  type,
  disabled = false,
  error,
}: AmountInputProps) {
  const theme = useTheme();
  const prefix = type === 'income' ? '(+)' : type === 'expense' ? '(-)' : '';

  return (
    <View style={styles.section}>
      <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Monto {prefix}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surfaceVariant,
            color: theme.colors.onSurface,
            borderColor: error ? theme.colors.error : theme.colors.outline,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        placeholder="0.00"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        editable={!disabled}
      />
      {error && (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  error: {
    marginTop: 4,
  },
});

