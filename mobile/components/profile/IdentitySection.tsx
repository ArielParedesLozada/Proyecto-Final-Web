import React, { useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { ImagePicker } from '@/components/ui';

export interface IdentitySectionProps {
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  onImageChange: (image: string | null) => void;
}

export default function IdentitySection({
  firstName,
  lastName,
  profileImage,
  onImageChange,
}: IdentitySectionProps) {
  const theme = useTheme();

  const initials = useMemo(() => {
    const a = (firstName || '').trim()[0] || '';
    const b = (lastName || '').trim()[0] || '';
    return (a + b).toUpperCase() || 'U';
  }, [firstName, lastName]);

  const fullName = useMemo(() => {
    return `${firstName} ${lastName}`.trim() || 'Usuario';
  }, [firstName, lastName]);

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Identidad
        </Text>
        <View style={styles.identitySection}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text
                  variant="headlineMedium"
                  style={{ color: theme.colors.onPrimaryContainer, fontWeight: '600' }}
                >
                  {initials}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.identityInfo}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
              {fullName}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Foto de perfil
            </Text>
          </View>
        </View>
        <View style={styles.imagePickerContainer}>
          <ImagePicker
            label=""
            value={profileImage ?? null}
            onChange={onImageChange}
            required={false}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityInfo: {
    flex: 1,
  },
  imagePickerContainer: {
    marginTop: 16,
  },
});

