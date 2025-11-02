import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export interface EmptyStateProps {
  icon?: string;
  variant?: 'goals' | 'completed' | 'default';
  title: string;
  subtitle: string;
  description?: string;
  containerStyle?: object;
  iconSize?: number;
  iconWithContainer?: boolean;
}

export default function EmptyState({
  icon,
  variant = 'default',
  title,
  subtitle,
  description,
  containerStyle,
  iconSize,
  iconWithContainer = false,
}: EmptyStateProps) {
  const theme = useTheme();

  // Determinar el icono a mostrar
  let displayIcon: string;
  if (icon) {
    displayIcon = icon;
  } else {
    switch (variant) {
      case 'goals':
        displayIcon = 'savings';
        break;
      case 'completed':
        displayIcon = 'check-circle-outline';
        break;
      default:
        displayIcon = 'info-outline';
    }
  }

  const finalIconSize = iconSize || (variant !== 'default' && !iconWithContainer ? 64 : 48);

  return (
    <View style={[styles.container, containerStyle]}>
      {iconWithContainer ? (
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialIcons
            name={displayIcon as any}
            size={finalIconSize}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      ) : (
        <MaterialIcons
          name={displayIcon as any}
          size={finalIconSize}
          color={theme.colors.onSurfaceVariant}
          style={styles.icon}
        />
      )}
      <Text
        variant={variant !== 'default' && !iconWithContainer ? 'titleLarge' : 'titleMedium'}
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
    opacity: 0.6,
    lineHeight: 20,
  },
});

