import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type StatVariant = 'emerald' | 'violet' | 'indigo' | 'amber';

export interface StatCardProps {
  title: string;
  value: string;
  sublabel?: string;
  icon?: string;
  variant?: StatVariant;
  loading?: boolean;
}

const variantColors: Record<StatVariant, { bg: string; icon: string; stripe: string }> = {
  emerald: {
    bg: 'rgba(16, 185, 129, 0.15)',
    icon: '#10b981',
    stripe: 'rgba(16, 185, 129, 0.5)',
  },
  violet: {
    bg: 'rgba(139, 92, 246, 0.15)',
    icon: '#8b5cf6',
    stripe: 'rgba(139, 92, 246, 0.5)',
  },
  indigo: {
    bg: 'rgba(99, 102, 241, 0.15)',
    icon: '#6366f1',
    stripe: 'rgba(99, 102, 241, 0.5)',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.15)',
    icon: '#f59e0b',
    stripe: 'rgba(245, 158, 11, 0.5)',
  },
};

export default function StatCard({
  title,
  value,
  sublabel,
  icon,
  variant = 'indigo',
  loading = false,
}: StatCardProps) {
  const theme = useTheme();
  const colors = variantColors[variant];

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Card.Content style={styles.content}>
        {/* Header con título y valor */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text
              variant="labelMedium"
              style={[styles.title, { color: theme.colors.onSurfaceVariant }]}
            >
              {title}
            </Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <Text
                variant="headlineSmall"
                style={[styles.value, { color: theme.colors.onSurface }]}
              >
                {value}
              </Text>
            )}
          </View>
          
          {/* Icono */}
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
              <MaterialIcons name={icon as any} size={24} color={colors.icon} />
            </View>
          )}
        </View>

        {/* Sublabel */}
        {sublabel && (
          <Text
            variant="bodySmall"
            style={[styles.sublabel, { color: theme.colors.onSurfaceVariant }]}
          >
            {sublabel}
          </Text>
        )}

        {/* Franja decorativa inferior */}
        <View
          style={[
            styles.stripe,
            { backgroundColor: colors.stripe },
          ]}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.9,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    height: 32,
    justifyContent: 'center',
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sublabel: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
  stripe: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
  },
});

