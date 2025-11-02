import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, Alert, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface ImagePickerProps {
  value?: string | null; // base64 string or URI
  onChange?: (imageUri: string | null) => void;
  label?: string;
  errorMessage?: string;
  required?: boolean;
}

/**
 * Componente reutilizable para seleccionar y mostrar imágenes
 * Convierte automáticamente la imagen seleccionada a base64
 * 
 * @example
 * <ImagePicker
 *   label="Foto de perfil"
 *   value={image}
 *   onChange={setImage}
 *   required
 * />
 */
export default function ImagePickerComponent({
  value,
  onChange,
  label = 'Imagen',
  errorMessage,
  required = false,
}: ImagePickerProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

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
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3, // Reducir calidad para menor tamaño (0.3 = 30%)
          base64: true,
          allowsMultipleSelection: false,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3, // Reducir calidad para menor tamaño (0.3 = 30%)
          base64: true,
          allowsMultipleSelection: false,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validar tamaño del base64 (aproximadamente 500KB máximo)
        if (asset.base64 && asset.base64.length > 500000) {
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

    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Cámara',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Galería',
          onPress: () => pickImage('library'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const removeImage = () => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de que deseas eliminar esta imagen?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onChange?.(null),
        },
      ]
    );
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
              onPress={removeImage}
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
          <Pressable
            style={[styles.changeButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={showImageOptions}
            disabled={loading}
          >
            <MaterialIcons
              name="edit"
              size={20}
              color={theme.colors.onPrimaryContainer}
            />
            <Text
              variant="bodySmall"
              style={[styles.changeButtonText, { color: theme.colors.onPrimaryContainer }]}
            >
              Cambiar
            </Text>
          </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changeButtonText: {
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    textAlign: 'center',
  },
});

