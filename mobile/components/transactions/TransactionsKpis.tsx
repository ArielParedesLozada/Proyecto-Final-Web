import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export interface TransactionsKpisProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

const incomeColors = {
  bg: 'rgba(139, 92, 246, 0.2)',
  icon: '#8b5cf6',
  stripe: 'rgba(139, 92, 246, 0.5)',
};

const expenseColors = {
  bg: 'rgba(239, 68, 68, 0.2)',
  icon: '#ef4444',
  stripe: 'rgba(239, 68, 68, 0.5)',
};

export default function TransactionsKpis({
  totalIncome,
  totalExpense,
  netBalance,
}: TransactionsKpisProps) {
  const theme = useTheme();
  const balanceColors = netBalance >= 0 ? incomeColors : expenseColors;

  return (
    <View style={styles.container}>
      {/* Total Ingresos */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="labelMedium" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
                Total Ingresos
              </Text>
              <Text variant="headlineSmall" style={[styles.value, { color: incomeColors.icon }]}>
                ${totalIncome.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: incomeColors.bg }]}>
              <MaterialIcons name="trending-up" size={20} color={incomeColors.icon} />
            </View>
          </View>
          <View style={[styles.stripe, { backgroundColor: incomeColors.stripe }]} />
        </Card.Content>
      </Card>

      {/* Total Gastos */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="labelMedium" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
                Total Gastos
              </Text>
              <Text variant="headlineSmall" style={[styles.value, { color: expenseColors.icon }]}>
                ${totalExpense.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: expenseColors.bg }]}>
              <MaterialIcons name="trending-down" size={20} color={expenseColors.icon} />
            </View>
          </View>
          <View style={[styles.stripe, { backgroundColor: expenseColors.stripe }]} />
        </Card.Content>
      </Card>

      {/* Balance Neto */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant="labelMedium" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
                Balance Neto
              </Text>
              <Text variant="headlineSmall" style={[styles.value, { color: balanceColors.icon }]}>
                ${netBalance.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: balanceColors.bg }]}>
              <MaterialIcons name="account-balance" size={20} color={balanceColors.icon} />
            </View>
          </View>
          <View style={[styles.stripe, { backgroundColor: balanceColors.stripe }]} />
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
    minHeight: 70,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.85,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    flexShrink: 0,
  },
  stripe: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
  },
});

