import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';

export interface ChartCardProps {
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, color, children }: ChartCardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.colorBar, { backgroundColor: color }]} />
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
            <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.chartContainer}>{children}</View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  colorBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  chartContainer: {
    minHeight: 240,
  },
});

