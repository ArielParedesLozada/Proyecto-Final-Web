import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface EmptyStateProps {
  variant?: 'goals' | 'completed';
  title: string;
  subtitle: string;
  description?: string;
}

export default function EmptyState({
  variant = 'goals',
  title,
  subtitle,
  description,
}: EmptyStateProps) {
  const theme = useTheme();

  const iconName = variant === 'goals' ? 'savings' : 'check-circle-outline';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialIcons
          name={iconName}
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
      <Text
        variant="titleMedium"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {subtitle}
      </Text>
      {description && (
        <Text
          variant="bodySmall"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
});

