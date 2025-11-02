import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss: () => void;
}

/**
 * Componente Toast reutilizable para mostrar mensajes en toda la aplicación
 * Aparece desde la parte inferior de la pantalla
 * 
 * @example
 * <Toast
 *   visible={showToast}
 *   message="Operación exitosa"
 *   type="success"
 *   onDismiss={() => setShowToast(false)}
 * />
 */
export default function Toast({
  visible,
  message,
  type = 'info',
  duration,
  onDismiss,
}: ToastProps) {
  const theme = useTheme();

  // Duración por defecto según el tipo
  const defaultDuration = duration ?? (type === 'success' ? 3000 : type === 'error' ? 4000 : 3000);

  // Colores según el tipo
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.tertiaryContainer,
          textColor: theme.colors.onTertiaryContainer,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.errorContainer,
          textColor: theme.colors.onErrorContainer,
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
        };
    }
  };

  const colors = getColors();

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={defaultDuration}
      style={[styles.snackbar, { backgroundColor: colors.backgroundColor }]}
      action={{
        label: 'Cerrar',
        onPress: onDismiss,
        textColor: colors.textColor,
      }}
    >
      <Text style={[styles.message, { color: colors.textColor }]}>
        {message}
      </Text>
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
  },
});

