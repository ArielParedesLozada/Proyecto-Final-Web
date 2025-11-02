import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Button from '@/components/ui/Button';

export interface TransactionKindSelectorProps {
  kind: 'Variable' | 'Fijo' | '';
  onKindChange: (kind: 'Variable' | 'Fijo') => void;
  disabled?: boolean;
  error?: string;
}

export default function TransactionKindSelector({
  kind,
  onKindChange,
  disabled = false,
  error,
}: TransactionKindSelectorProps) {
  const theme = useTheme();

  return (
    <>
      <View
        style={[
          styles.kindSelector,
          { borderColor: theme.colors.outline, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Button
          variant="outlined"
          onPress={() => !disabled && onKindChange('Variable')}
          disabled={disabled}
          style={[
            styles.kindButton,
            kind === 'Variable' && { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          Variable
        </Button>
        <Button
          variant="outlined"
          onPress={() => !disabled && onKindChange('Fijo')}
          disabled={disabled}
          style={[
            styles.kindButton,
            kind === 'Fijo' && { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          Fijo
        </Button>
      </View>
      {error && (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      {kind && (
        <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>
          {kind === 'Fijo'
            ? 'Si eliges Fijo, se programará automáticamente según la frecuencia.'
            : 'Los movimientos variables son únicos y se registran inmediatamente.'}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  kindSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  kindButton: {
    flex: 1,
    borderRadius: 0,
    marginHorizontal: 0,
  },
  error: {
    marginTop: 4,
  },
  helpText: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.7,
  },
});

