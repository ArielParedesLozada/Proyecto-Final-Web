import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Button from '../ui/Button';
import { Modal } from '../ui';

interface LogoutSectionProps {
  onLogout: () => Promise<void>;
}

export default function LogoutSection({ onLogout }: LogoutSectionProps) {
  const theme = useTheme();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutPress = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowConfirmModal(false);
    setLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Button
          variant="outlined"
          onPress={handleLogoutPress}
          loading={loggingOut}
          disabled={loggingOut}
          fullWidth
          style={[
            styles.logoutButton,
            {
              borderColor: theme.colors.error,
            },
          ]}
        >
          Cerrar sesión
        </Button>
      </View>

      <Modal
        visible={showConfirmModal}
        onDismiss={() => setShowConfirmModal(false)}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        primaryAction={{
          label: 'Cerrar sesión',
          onPress: handleConfirmLogout,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setShowConfirmModal(false),
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  logoutButton: {
    width: '100%',
  },
});

