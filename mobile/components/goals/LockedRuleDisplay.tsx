import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Button from '@/components/ui/Button';

export interface LockedRuleDisplayProps {
  type: 'income' | 'expense';
  frequencyLabel: string;
  amount: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function LockedRuleDisplay({
  type,
  frequencyLabel,
  amount,
  onEdit,
  onDelete,
}: LockedRuleDisplayProps) {
  const theme = useTheme();

  return (
    <>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme.colors.errorContainer,
            borderColor: theme.colors.error,
          },
        ]}
      >
        <Text
          variant="bodySmall"
          style={[styles.badgeText, { color: theme.colors.onErrorContainer }]}
        >
          Ya existe una regla fija para este {type === 'income' ? 'ingreso' : 'gasto'} •{' '}
          {frequencyLabel} • Monto: ${amount.toLocaleString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          variant="outlined"
          onPress={onEdit}
          style={styles.actionButton}
          fullWidth
        >
          Editar regla fija
        </Button>
        <Button
          variant="danger"
          onPress={onDelete}
          style={styles.actionButton}
          fullWidth
        >
          Eliminar regla
        </Button>
      </View>

      <Text
        variant="bodySmall"
        style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
      >
        El tipo queda bloqueado como <Text style={{ fontWeight: '600' }}>Fijo</Text> mientras
        exista esta regla.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeText: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    width: '100%',
  },
  helpText: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.7,
  },
});

