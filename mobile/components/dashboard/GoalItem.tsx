import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';

export interface GoalItemProps {
  name: string;
  current: number;
  target: number;
}

export default function GoalItem({ name, current = 0, target = 1 }: GoalItemProps) {
  const theme = useTheme();
  const percentage = Math.max(0, Math.min(100, Math.round((Number(current) / Math.max(Number(target), 1)) * 100)));

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceVariant,
          marginBottom: 12,
        },
      ]}
    >
      <Card.Content style={styles.content}>
        {/* Header con nombre y porcentaje */}
        <View style={styles.header}>
          <Text
            variant="titleSmall"
            style={[styles.name, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View style={[styles.percentageBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onPrimaryContainer, fontWeight: '600' }}
            >
              {percentage}%
            </Text>
          </View>
        </View>

        {/* Montos */}
        <Text
          variant="bodySmall"
          style={[styles.amounts, { color: theme.colors.onSurfaceVariant }]}
        >
          ${Number(current).toLocaleString()} de ${Number(target).toLocaleString()}
        </Text>

        {/* Barra de progreso */}
        <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amounts: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

