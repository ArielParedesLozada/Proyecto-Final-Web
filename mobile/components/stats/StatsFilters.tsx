import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { DateField } from '@/components/transactions';
import Button from '@/components/ui/Button';
import { compareYMDDates } from '@/utils/date';

export interface StatsFiltersProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClear: () => void;
}

export default function StatsFilters({ dateRange, onDateRangeChange, onClear }: StatsFiltersProps) {
  const theme = useTheme();

  const handleStartChange = (start: string) => {
    onDateRangeChange({ ...dateRange, start });
  };

  const handleEndChange = (end: string) => {
    onDateRangeChange({ ...dateRange, end });
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <View style={styles.fieldWrapper}>
            <DateField
              label="Fecha inicio"
              value={dateRange.start}
              onChange={handleStartChange}
            />
          </View>
          <View style={styles.fieldWrapper}>
            <DateField
              label="Fecha fin"
              value={dateRange.end}
              onChange={handleEndChange}
            />
          </View>
        </View>
        <View style={styles.actions}>
          <Button
            variant="outlined"
            onPress={onClear}
            fullWidth
            style={styles.clearButton}
          >
            Limpiar
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
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fieldWrapper: {
    flex: 1,
  },
  actions: {
    width: '100%',
  },
  clearButton: {
    minHeight: 40,
  },
});

