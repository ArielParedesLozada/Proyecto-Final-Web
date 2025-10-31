import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, useTheme, ButtonProps as PaperButtonProps } from 'react-native-paper';

export interface ButtonProps extends Omit<PaperButtonProps, 'mode' | 'buttonColor' | 'textColor'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Componente de botón reutilizable con variantes predefinidas
 * 
 * @example
 * <Button variant="primary" onPress={handleSubmit} loading={isLoading}>
 *   Guardar
 * </Button>
 */
export default function Button({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  style,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const getButtonConfig = () => {
    switch (variant) {
      case 'primary':
        return {
          mode: 'contained' as const,
          buttonColor: theme.colors.primary,
          textColor: theme.colors.onPrimary,
          style: [styles.button, styles.primary, fullWidth && styles.fullWidth, style],
        };
      case 'secondary':
        return {
          mode: 'contained' as const,
          buttonColor: theme.colors.secondary,
          textColor: theme.colors.onSecondary,
          style: [styles.button, styles.secondary, fullWidth && styles.fullWidth, style],
        };
      case 'outlined':
        return {
          mode: 'outlined' as const,
          buttonColor: 'transparent',
          textColor: theme.colors.primary,
          style: [styles.button, styles.outlined, fullWidth && styles.fullWidth, style],
        };
      case 'text':
        return {
          mode: 'text' as const,
          buttonColor: 'transparent',
          textColor: theme.colors.primary,
          style: [styles.button, styles.text, fullWidth && styles.fullWidth, style],
        };
      case 'danger':
        return {
          mode: 'contained' as const,
          buttonColor: theme.colors.error,
          textColor: theme.colors.onError,
          style: [styles.button, styles.danger, fullWidth && styles.fullWidth, style],
        };
      default:
        return {
          mode: 'contained' as const,
          buttonColor: theme.colors.primary,
          textColor: theme.colors.onPrimary,
          style: [styles.button, styles.primary, fullWidth && styles.fullWidth, style],
        };
    }
  };

  const config = getButtonConfig();

  return (
    <PaperButton
      {...props}
      mode={config.mode}
      buttonColor={config.buttonColor}
      textColor={config.textColor}
      style={config.style}
      loading={loading}
      disabled={disabled || loading}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    minHeight: 48,
  },
  primary: {
  },
  secondary: {
  },
  outlined: {
    borderWidth: 1,
  },
  text: {
  },
  danger: {
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

