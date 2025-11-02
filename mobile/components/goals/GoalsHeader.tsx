import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Button from '../ui/Button';

export interface GoalsHeaderProps {
  onCreateGoal: () => void;
}

export default function GoalsHeader({ onCreateGoal }: GoalsHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onBackground, fontWeight: '600' }]}
        >
          Metas de Ahorro
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Gestiona y da seguimiento a tus objetivos financieros
        </Text>
      </View>
      <Button
        variant="primary"
        onPress={onCreateGoal}
        icon="plus"
      >
        Nueva Meta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
});

