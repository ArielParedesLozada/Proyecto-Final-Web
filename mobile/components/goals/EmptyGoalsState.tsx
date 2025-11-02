import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export interface EmptyGoalsStateProps {
  onCreateGoal?: () => void;
}

export default function EmptyGoalsState({ onCreateGoal }: EmptyGoalsStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <MaterialIcons
        name="savings"
        size={64}
        color={theme.colors.onSurfaceVariant}
        style={styles.icon}
      />
      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Aún no tienes metas de ahorro
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Crea tu primera meta para comenzar a registrar tu progreso financiero.
      </Text>
      <Text
        variant="bodySmall"
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
      >
        Las metas de ahorro te ayudan a organizar tus finanzas, establecer objetivos claros y hacer un seguimiento de tu progreso hacia la independencia financiera.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  icon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

