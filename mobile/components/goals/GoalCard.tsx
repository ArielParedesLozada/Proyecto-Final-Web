import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal } from '@/services/goals';
import { calculateProgress, getCategoryLabel } from '@/services/goals';
import { formatDateShort } from '@/utils/date';
import Button from '../ui/Button';

export interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: number) => void;
  onAddTransaction?: (goal: Goal) => void;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onAddTransaction,
}: GoalCardProps) {
  const theme = useTheme();

  const currentAmount = goal.accumulated ?? goal.current_amount ?? 0;
  const targetAmount = goal.target_amount;
  const progress = calculateProgress(currentAmount, targetAmount);
  const status = goal.status || 'active';

  // Determinar color de la barra según el progreso y estado
  const getBarColor = () => {
    if (status === 'expired' || status === 'Vencida') {
      return theme.colors.error;
    }
    if (progress < 33) {
      return theme.colors.error;
    }
    if (progress < 75) {
      return '#F59E0B'; // amber
    }
    return theme.colors.primary;
  };

  const getStatusLabel = () => {
    if (progress >= 100) return 'Completada';
    if (status === 'expired' || status === 'Vencida') return 'Vencida';
    return 'Activa';
  };

  const getStatusColor = () => {
    const label = getStatusLabel();
    if (label === 'Completada') return theme.colors.primary;
    if (label === 'Vencida') return theme.colors.error;
    return theme.colors.tertiary;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha límite';
    return formatDateShort(dateString);
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        {/* Header con título y acciones */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text
              variant="titleMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {goal.name}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {getCategoryLabel(goal.category)} • {formatDate(goal.target_date)}
            </Text>
          </View>

          <View style={styles.actions}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor() },
                ]}
              >
                {getStatusLabel()}
              </Text>
            </View>
            <Pressable
              onPress={() => onEdit?.(goal)}
              style={styles.actionButton}
            >
              <MaterialIcons
                name="edit"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </Pressable>
            <Pressable
              onPress={() => onDelete?.(goal.id)}
              style={styles.actionButton}
            >
              <MaterialIcons
                name="delete-outline"
                size={20}
                color={theme.colors.error}
              />
            </Pressable>
          </View>
        </View>

        {/* Descripción */}
        {goal.description && (
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {goal.description}
          </Text>
        )}

        {/* Progreso */}
        <View style={styles.progressSection}>
          <Text
            variant="bodySmall"
            style={[styles.progressLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Progreso Financiero
          </Text>
          <View style={styles.progressAmounts}>
            <Text
              variant="bodySmall"
              style={[styles.amount, { color: theme.colors.onSurface }]}
            >
              ${currentAmount.toLocaleString()}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.amount, { color: theme.colors.onSurfaceVariant }]}
            >
              ${targetAmount.toLocaleString()}
            </Text>
          </View>

          {/* Barra de progreso */}
          <View
            style={[
              styles.progressBarContainer,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress}%`,
                  backgroundColor: getBarColor(),
                },
              ]}
            />
          </View>

          <Text
            variant="bodySmall"
            style={[styles.progressPercent, { color: theme.colors.onSurfaceVariant }]}
          >
            {progress}%
          </Text>
        </View>

        {/* Botón para agregar transacción */}
        <View style={styles.actionContainer}>
          <Button
            variant="outlined"
            onPress={() => onAddTransaction?.(goal)}
            style={styles.addTxButton}
          >
            Agregar Ingreso/Gasto
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
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButton: {
    padding: 4,
  },
  description: {
    marginBottom: 16,
    opacity: 0.8,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontWeight: '500',
    marginBottom: 8,
  },
  progressAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amount: {
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
  },
  actionContainer: {
    marginTop: 8,
  },
  addTxButton: {
    width: '100%',
  },
});

