import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import type { FABProps } from 'react-native-paper';

export interface FloatingActionButtonProps {
  variant?: 'primary' | 'secondary';
  icon?: FABProps['icon'];
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  [key: string]: any; 
}

/**
 * Componente FAB (Floating Action Button) reutilizable
 * 
 * @example
 * <FloatingActionButton
 *   icon="plus"
 *   variant="primary"
 *   onPress={handleAdd}
 *   label="Agregar"
 * />
 */
export default function FloatingActionButton({
  variant = 'primary',
  icon,
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  ...props
}: FloatingActionButtonProps) {
  const theme = useTheme();

  const getButtonConfig = () => {
    switch (variant) {
      case 'primary':
        return {
          color: theme.colors.onPrimary,
          backgroundColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          color: theme.colors.onSecondary,
          backgroundColor: theme.colors.secondary,
        };
      default:
        return {
          color: theme.colors.onPrimary,
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const config = getButtonConfig();

  const fabProps: any = {
    ...props,
    icon,
    onPress,
    disabled: disabled || loading,
    loading,
    color: config.color,
    style: [
      styles.fab,
      { backgroundColor: config.backgroundColor },
      style,
    ],
  };

  if (label) {
    fabProps.label = label;
  }

  return <FAB {...fabProps} />;
}

const styles = StyleSheet.create({
  fab: {
    borderRadius: 16,
  },
});

