import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface ChartPlaceholderProps {
  variant?: 'pie' | 'line' | 'bar';
  height?: number;
}

export default function ChartPlaceholder({ variant = 'pie', height = 240 }: ChartPlaceholderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { height, backgroundColor: theme.colors.surfaceVariant }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text variant="bodyMedium" style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>
        Cargando gráfica...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 8,
  },
  text: {
    marginTop: 12,
    opacity: 0.7,
  },
});

