import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Button from '@/components/ui/Button';

export interface TransactionTypeSelectorProps {
  type: 'income' | 'expense' | '';
  onTypeChange: (type: 'income' | 'expense') => void;
  error?: string;
}

export default function TransactionTypeSelector({
  type,
  onTypeChange,
  error,
}: TransactionTypeSelectorProps) {
  const theme = useTheme();
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  return (
    <View style={styles.section}>
      <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Tipo de transacción
      </Text>
      <View style={styles.typeSelector}>
        <Button
          variant={isIncome ? 'primary' : 'outlined'}
          onPress={() => onTypeChange('income')}
          style={styles.typeButton}
        >
          Ingreso
        </Button>
        <Button
          variant={isExpense ? 'danger' : 'outlined'}
          onPress={() => onTypeChange('expense')}
          style={styles.typeButton}
        >
          Gasto
        </Button>
      </View>
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  error: {
    marginTop: 4,
  },
});

