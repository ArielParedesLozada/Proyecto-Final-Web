import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface ChartTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  values: Array<{ label: string; value: number; color: string; formatted: string }>;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOOLTIP_WIDTH = 180;

export default function ChartTooltip({ visible, x, y, label, values }: ChartTooltipProps) {
  const theme = useTheme();

  if (!visible || values.length === 0) {
    return null;
  }

  // Ajustar posición para que no se salga de la pantalla
  let adjustedX = x;
  let adjustedY = y;

  // Ajustar horizontalmente si se sale por la derecha
  if (adjustedX + TOOLTIP_WIDTH > SCREEN_WIDTH - 16) {
    adjustedX = SCREEN_WIDTH - TOOLTIP_WIDTH - 16;
  }
  // Ajustar horizontalmente si se sale por la izquierda
  if (adjustedX < 16) {
    adjustedX = 16;
  }

  // Ajustar verticalmente si se sale por arriba
  if (adjustedY < 50) {
    adjustedY = y + 50;
  }

  return (
    <View
      style={[
        styles.tooltip,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          left: adjustedX,
          top: adjustedY,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
      {values.map((item, index) => (
        <View key={index} style={styles.valueRow}>
          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          <Text style={[styles.valueText, { color: theme.colors.onSurfaceVariant }]}>
            {item.label}:
          </Text>
          <Text style={[styles.valueNumber, { color: theme.colors.onSurface }]}>
            {item.formatted}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
    maxWidth: 200,
    zIndex: 10000,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  valueText: {
    fontSize: 12,
    marginRight: 4,
  },
  valueNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
});

