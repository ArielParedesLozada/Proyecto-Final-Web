import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Snackbar, Text, useTheme, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({
  visible,
  message,
  type = 'info',
  duration,
  onDismiss,
}: ToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const defaultDuration = duration ?? (type === 'success' ? 3000 : type === 'error' ? 4000 : 3000);

  const getTopOffset = (): number => {
    const safeTop = insets.top || 0;
    
    if (Platform.OS === 'ios') {
      return Math.max(safeTop + 28, 85);
    } else {
      return Math.max(safeTop + 36, 90);
    }
  };

  const topOffset = getTopOffset();

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
    <Portal>
      <View style={[styles.wrapper, { top: topOffset }]}>
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
          elevation={4}
        >
          <Text style={[styles.message, { color: colors.textColor }]}>
            {message}
          </Text>
        </Snackbar>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  snackbar: {
    borderRadius: 12,
    marginHorizontal: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
  },
});

