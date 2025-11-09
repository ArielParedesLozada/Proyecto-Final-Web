import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from '../ui/Modal';
import { Goal, calculateProgress, getCategoryLabel } from '@/services/goals';
import { formatDateShort } from '@/utils/date';

export interface GoalDetailModalProps {
  visible: boolean;
  goal: Goal | null;
  onDismiss: () => void;
}

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
  emphasize?: boolean;
}

function DetailRow({ icon, label, value, emphasize = false }: DetailRowProps) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <MaterialIcons
        name={icon as any}
        size={18}
        color={theme.colors.onSurfaceVariant}
        style={styles.detailIcon}
      />
      <View style={styles.detailTextContainer}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text
          variant={emphasize ? 'bodyLarge' : 'bodyMedium'}
          style={[
            styles.detailValue,
            {
              color: emphasize ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
              fontWeight: emphasize ? '600' : '400',
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function GoalDetailModal({
  visible,
  goal,
  onDismiss,
}: GoalDetailModalProps) {
  const theme = useTheme();

  if (!goal) return null;

  const categoryLabel = getCategoryLabel(goal.category);
  const currentAmount = goal.accumulated ?? goal.current_amount ?? 0;
  const targetAmount = goal.target_amount;
  const progress = calculateProgress(currentAmount, targetAmount);
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const statusLabel =
    progress >= 100 ? 'Completada' : goal.status === 'expired' ? 'Vencida' : 'Activa';

  const statusColor =
    statusLabel === 'Completada'
      ? theme.colors.primary
      : statusLabel === 'Vencida'
      ? theme.colors.error
      : theme.colors.tertiary;
  const statusBackground = `${statusColor}20`;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      title="Detalle de la meta"
      cancelable={true}
      secondaryAction={{
        label: 'Cerrar',
        onPress: onDismiss,
      }}
      actionsAlignment="center"
    >
      <View style={styles.wrapper}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleMedium" style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
            {goal.name}
          </Text>
          <View style={styles.summaryRow}>
            <View style={[styles.badge, { backgroundColor: statusBackground }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <View style={styles.summaryMeta}>
              <MaterialIcons
                name="category"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {categoryLabel}
              </Text>
            </View>
            <View style={styles.summaryMeta}>
              <MaterialIcons
                name="event"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {goal.target_date ? formatDateShort(goal.target_date) : 'Sin fecha límite'}
              </Text>
            </View>
          </View>
          {goal.description ? (
            <Text
              variant="bodySmall"
              style={[styles.summaryDescription, { color: theme.colors.onSurfaceVariant }]}
            >
              {goal.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <DetailRow icon="bar-chart" label="Progreso" value={`${progress}%`} emphasize />
            <DetailRow icon="savings" label="Ahorrado" value={`$${currentAmount.toLocaleString()}`} />
            <DetailRow icon="account-balance" label="Objetivo" value={`$${targetAmount.toLocaleString()}`} />
            <DetailRow icon="trending-up" label="Restante" value={`$${remainingAmount.toLocaleString()}`} />
          </View>

          <View style={styles.metaGrid}>
            {goal.created_at && (
              <View style={[styles.metaItem, { borderColor: theme.colors.outlineVariant }]}>
                <MaterialIcons
                  name="event-available"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Creada
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                  {formatDateShort(goal.created_at)}
                </Text>
              </View>
            )}
            <View style={[styles.metaItem, { borderColor: theme.colors.outlineVariant }]}>
              <MaterialIcons
                name="hourglass-bottom"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Días restantes
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                {goal.target_date
                  ? Math.max(
                      0,
                      Math.ceil(
                        (new Date(goal.target_date).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )
                  : '—'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDescription: {
    lineHeight: 20,
  },
  metricsContainer: {
    gap: 12,
  },
  metricCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
    gap: 2,
  },
  detailValue: {
    flexShrink: 1,
  },
});


