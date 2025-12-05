import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal } from '@/services/goals';
import { getCategoryLabel, calculateProgress } from '@/services/goals';

export interface GoalSummaryProps {
  goal: Goal;
}

export default function GoalSummary({ goal }: GoalSummaryProps) {
  const theme = useTheme();
  
  const current = goal.accumulated || goal.current_amount || 0;
  const progress = calculateProgress(current, goal.target_amount);
  const statusLabels: Record<string, string> = {
    active: 'Activa',
    completed: 'Completada',
    expired: 'Vencida',
  };
  const statusLabel = statusLabels[goal.status] || goal.status;

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialIcons 
            name={goal.status === 'completed' ? 'check-circle' : 'account-balance-wallet'} 
            size={20} 
            color={theme.colors.onPrimaryContainer} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
            {goal.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {getCategoryLabel(goal.category)} • {statusLabel} • Progreso: ${current.toLocaleString()} / ${goal.target_amount.toLocaleString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
});

