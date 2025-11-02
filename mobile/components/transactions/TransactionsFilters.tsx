import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Button from '@/components/ui/Button';
import { Goal } from '@/services/goals';

import GoalSelect from './GoalSelect';
import TransactionTypeToggle from './TransactionTypeToggle';
import DateField from './DateField';

export interface TransactionsFiltersProps {
  goals: Goal[];
  selectedGoal: Goal | null;
  onGoalChange: (goal: Goal | null) => void;
  transactionType: 'Fijo' | 'Variable' | null;
  onTransactionTypeChange: (type: 'Fijo' | 'Variable' | null) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClear: () => void;
  loading?: boolean;
}

export default function TransactionsFilters({
  goals,
  selectedGoal,
  onGoalChange,
  transactionType,
  onTransactionTypeChange,
  dateRange,
  onDateRangeChange,
  onClear,
  loading = false,
}: TransactionsFiltersProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          {/* Meta */}
          <GoalSelect
            goals={goals}
            selectedGoal={selectedGoal}
            onChange={(g) => onGoalChange(g)}
            loading={loading}
          />

          {/* Tipo */}
          <TransactionTypeToggle value={transactionType} onChange={onTransactionTypeChange} />

          {/* Desde */}
          <DateField
            label="Desde:"
            value={dateRange.start}
            onChange={(start) => onDateRangeChange({ ...dateRange, start })}
          />

          {/* Hasta */}
          <DateField
            label="Hasta:"
            value={dateRange.end}
            onChange={(end) => onDateRangeChange({ ...dateRange, end })}
          />

          {/* Limpiar */}
          <View style={styles.field}>
            <Text variant="labelMedium" style={[styles.transparentLabel]}>{' '}</Text>
            <Button variant="outlined" onPress={onClear} style={styles.clearButton}>
              Limpiar
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, marginBottom: 16, overflow: 'visible' },
  content: { padding: 12, overflow: 'visible' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, overflow: 'visible' },
  field: { flex: 1, minWidth: 120 },
  transparentLabel: { marginBottom: 6, fontWeight: '500', color: 'transparent' },
  clearButton: { minHeight: 40 },
});
