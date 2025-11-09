import React from 'react';
import { View, StyleSheet, Modal as RNModal, Pressable } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

export interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'danger';
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  cancelable?: boolean;
  actionsAlignment?: 'end' | 'center';
}

export default function Modal({
  visible,
  onDismiss,
  title,
  message,
  children,
  primaryAction,
  secondaryAction,
  cancelable = true,
  actionsAlignment = 'end',
}: ModalProps) {
  const theme = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancelable ? onDismiss : undefined}
    >
      <Pressable
        style={styles.overlay}
        onPress={cancelable ? onDismiss : undefined}
      >
        <Pressable
          style={[
            styles.dialog,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>
          
          <View style={styles.content}>
            {message && (
              <Text
                variant="bodyMedium"
                style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
              >
                {message}
              </Text>
            )}
            {children}
          </View>

          <View
            style={[
              styles.actions,
              actionsAlignment === 'center' && styles.actionsCenter,
            ]}
          >
            {secondaryAction && (
              <Button
                mode="text"
                onPress={secondaryAction.onPress}
                textColor={theme.colors.primary}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                {secondaryAction.label}
              </Button>
            )}
            
            {primaryAction && (
              <Button
                mode="contained"
                onPress={primaryAction.onPress}
                buttonColor={
                  primaryAction.variant === 'danger'
                    ? theme.colors.error
                    : theme.colors.primary
                }
                textColor={
                  primaryAction.variant === 'danger'
                    ? theme.colors.onError
                    : theme.colors.onPrimary
                }
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                {primaryAction.label}
              </Button>
            )}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionsCenter: {
    justifyContent: 'center',
  },
});

