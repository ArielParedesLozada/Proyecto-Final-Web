import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, Alert, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from './Modal';
import Button from './Button';

export interface ImagePickerProps {
  value?: string | null; // base64 string or URI
  onChange?: (imageUri: string | null) => void;
  label?: string;
  errorMessage?: string;
  required?: boolean;
}

export default function ImagePickerComponent({
  value,
  onChange,
  label = 'Imagen',
  errorMessage,
  required = false,
}: ImagePickerProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu cámara y galería para subir imágenes.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (source: 'camera' | 'library') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);

    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3, // Reducir calidad para menor tamaño (0.3 = 30%)
          base64: true,
          allowsMultipleSelection: false,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3, 
          base64: true,
          allowsMultipleSelection: false,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validar tamaño del base64 (aproximadamente 500KB máximo)
        if (asset.base64 && asset.base64.length > 500000) {
          // Para errores críticos, usamos Alert nativo
          Alert.alert(
            'Imagen muy grande',
            'La imagen seleccionada es muy grande. Por favor, selecciona una imagen más pequeña o de menor calidad.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Convertir a base64 data URL
        const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
        onChange?.(base64Uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImage('library');
      return;
    }

    setShowOptionsModal(true);
  };

  const handleRemoveImage = () => {
    setShowRemoveModal(true);
  };

  const confirmRemoveImage = () => {
    onChange?.(null);
    setShowRemoveModal(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          variant="bodyMedium"
          style={[
            styles.label,
            { color: theme.colors.onSurface },
            required && styles.requiredLabel,
          ]}
        >
          {label}
          {required && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
      )}

      <View style={styles.imageContainer}>
        {value ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: value }} style={styles.image} />
            <Pressable
              style={[styles.removeButton, { backgroundColor: theme.colors.errorContainer }]}
              onPress={handleRemoveImage}
            >
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.onErrorContainer}
              />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[
              styles.placeholderContainer,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: errorMessage ? theme.colors.error : theme.colors.outline,
              },
            ]}
            onPress={showImageOptions}
            disabled={loading}
          >
            <MaterialIcons
              name="add-a-photo"
              size={48}
              color={errorMessage ? theme.colors.error : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={{
                color: errorMessage ? theme.colors.error : theme.colors.onSurfaceVariant,
                marginTop: 8,
              }}
            >
              {loading ? 'Cargando...' : 'Toca para seleccionar imagen'}
            </Text>
          </Pressable>
        )}

        {value && (
          <Button
            variant="outlined"
            onPress={showImageOptions}
            disabled={loading}
            style={styles.changeButton}
            icon="pencil"
          >
            Cambiar
          </Button>
        )}
      </View>

      {errorMessage && (
        <Text
          variant="bodySmall"
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {errorMessage}
        </Text>
      )}

      {/* Modal para eliminar imagen */}
      <Modal
        visible={showRemoveModal}
        onDismiss={() => setShowRemoveModal(false)}
        title="Eliminar imagen"
        message="¿Estás seguro de que deseas eliminar esta imagen?"
        primaryAction={{
          label: 'Eliminar',
          onPress: confirmRemoveImage,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setShowRemoveModal(false),
        }}
      />

      {/* Modal para seleccionar fuente de imagen */}
      <Modal
        visible={showOptionsModal}
        onDismiss={() => setShowOptionsModal(false)}
        title="Seleccionar imagen"
        message="Elige una opción para seleccionar tu imagen"
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setShowOptionsModal(false),
        }}
      >
        <View style={styles.modalActions}>
          <Button
            variant="outlined"
            onPress={() => {
              setShowOptionsModal(false);
              pickImage('camera');
            }}
            style={styles.modalButton}
            icon="camera"
            fullWidth
          >
            Cámara
          </Button>
          <Button
            variant="primary"
            onPress={() => {
              setShowOptionsModal(false);
              pickImage('library');
            }}
            style={styles.modalButton}
            icon="image"
            fullWidth
          >
            Galería
          </Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  requiredLabel: {
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 12,
    padding: 4,
  },
  placeholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changeButton: {
    marginTop: 8,
  },
  errorText: {
    marginTop: 4,
    textAlign: 'center',
  },
  modalActions: {
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  modalButton: {
    width: '100%',
  },
});

