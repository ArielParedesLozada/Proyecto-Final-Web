import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { IconButton as PaperIconButton, useTheme } from 'react-native-paper';
import type { IconButtonProps as PaperIconButtonProps } from 'react-native-paper';

export interface IconButtonProps extends Omit<PaperIconButtonProps, 'iconColor' | 'containerColor' | 'size' | 'style'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon: string;
  style?: ViewStyle;
}

/**
 * Componente de botón con ícono reutilizable
 * 
 * @example
 * <IconButton icon="delete" variant="danger" onPress={handleDelete} />
 */
export default function IconButton({
  variant = 'primary',
  size = 'medium',
  icon,
  ...props
}: IconButtonProps) {
  const theme = useTheme();

  const getButtonConfig = () => {
    const sizeConfig = {
      small: 20,
      medium: 24,
      large: 28,
    };

    switch (variant) {
      case 'primary':
        return {
          iconColor: theme.colors.primary,
          containerColor: 'transparent',
          size: sizeConfig[size],
        };
      case 'secondary':
        return {
          iconColor: theme.colors.secondary,
          containerColor: 'transparent',
          size: sizeConfig[size],
        };
      case 'outlined':
        return {
          iconColor: theme.colors.primary,
          containerColor: theme.colors.surface,
          size: sizeConfig[size],
        };
      case 'text':
        return {
          iconColor: theme.colors.onSurfaceVariant,
          containerColor: 'transparent',
          size: sizeConfig[size],
        };
      case 'danger':
        return {
          iconColor: theme.colors.error,
          containerColor: 'transparent',
          size: sizeConfig[size],
        };
      default:
        return {
          iconColor: theme.colors.primary,
          containerColor: 'transparent',
          size: sizeConfig[size],
        };
    }
  };

  const config = getButtonConfig();

  return (
    <PaperIconButton
      {...props}
      icon={icon}
      iconColor={config.iconColor}
      containerColor={config.containerColor}
      size={config.size}
      style={[styles.button, props.style || {}]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 0,
  },
});

