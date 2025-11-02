import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export interface TransactionsKpisProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export default function TransactionsKpis({
  totalIncome,
  totalExpense,
  netBalance,
}: TransactionsKpisProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Ingresos
            </Text>
          </View>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            ${totalIncome.toLocaleString()}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <MaterialIcons name="trending-down" size={20} color={theme.colors.error} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Gastos
            </Text>
          </View>
          <Text variant="headlineSmall" style={{ color: theme.colors.error, fontWeight: '700' }}>
            ${totalExpense.toLocaleString()}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <MaterialIcons 
              name="account-balance" 
              size={20} 
              color={netBalance >= 0 ? theme.colors.primary : theme.colors.error} 
            />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Balance Neto
            </Text>
          </View>
          <Text 
            variant="headlineSmall" 
            style={{ 
              color: netBalance >= 0 ? theme.colors.primary : theme.colors.error, 
              fontWeight: '700' 
            }}
          >
            ${netBalance.toLocaleString()}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
});

