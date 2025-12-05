import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card, ActivityIndicator, FAB } from 'react-native-paper';
import { Transaction } from '@/services/goals';
import TransactionItem from './TransactionItem';
import { EmptyState } from '@/components/ui';

const ITEM_HEIGHT = 68;
const MAX_VISIBLE_ITEMS = 5;
const MAX_HEIGHT = ITEM_HEIGHT * MAX_VISIBLE_ITEMS;

export interface TransactionsListProps {
  title: string;
  transactions: Transaction[];
  loading?: boolean;
  onAdd?: () => void;
  fabIcon?: string;
  fabColor?: string;
}

export default function TransactionsList({
  title,
  transactions,
  loading = false,
  onAdd,
  fabIcon = 'plus',
  fabColor,
}: TransactionsListProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {transactions.length} registro(s)
            </Text>
          </View>
          {onAdd && (
            <FAB
              icon={fabIcon}
              size="small"
              style={[
                styles.fab,
                {
                  backgroundColor: fabColor || theme.colors.primary,
                },
              ]}
              onPress={onAdd}
            />
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : transactions.length > 0 ? (
          transactions.length >= MAX_VISIBLE_ITEMS ? (
            <ScrollView
              style={[styles.scrollView, { maxHeight: MAX_HEIGHT }]}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </View>
          )
        ) : (
          <EmptyState
            variant="default"
            title={`Sin ${title.toLowerCase()} registrados`}
            subtitle={`Aún no tienes ${title.toLowerCase()} registrados para esta meta.`}
          />
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    flex: 1,
    minHeight: 300,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  fab: {
    marginLeft: 8,
  },
  scrollView: {
    maxHeight: MAX_HEIGHT,
  },
  transactionsList: {
    gap: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
});

