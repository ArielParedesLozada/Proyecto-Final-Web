import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Transaction } from '@/services/goals';
import { formatDateShort } from '@/utils/date';

export interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const theme = useTheme();
  
  const isIncome = transaction.type === 'income';
  const color = isIncome ? theme.colors.primary : theme.colors.error;
  const amountColor = isIncome ? theme.colors.primary : theme.colors.error;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.icon, { color }]}>
          {isIncome ? '↑' : '↓'}
        </Text>
      </View>
      
      <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={[styles.badgeText, { color: theme.colors.onPrimaryContainer }]}>
          {transaction.is_fixed ? 'Fijo' : 'Variable'}
        </Text>
      </View>
      
      <View style={styles.dateContainer}>
        <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          {formatDateShort(transaction.occurred_on)}
        </Text>
      </View>
      
      <Text style={[styles.amount, { color: amountColor }]}>
        {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});

