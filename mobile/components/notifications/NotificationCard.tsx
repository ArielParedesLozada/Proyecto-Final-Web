import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export interface NotificationCardProps {
  title: string;
  message: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  read?: boolean;
  createdAt: string;
  currentTime?: number;
  onPress?: () => void;
  children?: React.ReactNode;
}

export default function NotificationCard({
  title,
  message,
  icon = 'notifications',
  iconColor,
  read = false,
  createdAt,
  currentTime,
  onPress,
  children,
}: NotificationCardProps) {
  const theme = useTheme();
  const defaultIconColor = iconColor || theme.colors.primary;

  const formatDate = (dateString: string, referenceTime?: number) => {
    const date = new Date(dateString);
    const now = referenceTime ? new Date(referenceTime) : new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

    // Calcular tiempo relativo usando currentTime si está disponible
  const timeText = formatDate(createdAt, currentTime);

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
        !read && styles.unreadCard,
      ]}
      onPress={onPress}
      mode="outlined"
    >
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, { backgroundColor: `${defaultIconColor}15` }]}>
            <MaterialIcons name={icon} size={24} color={defaultIconColor} />
          </View>
          {!read && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text
              variant="titleSmall"
              style={[
                styles.title,
                { color: theme.colors.onSurface },
                !read && styles.unreadTitle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {timeText}
            </Text>
          </View>

          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {message}
          </Text>

          {children}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  unreadCard: {
    borderLeftWidth: 3,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontWeight: '500',
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  message: {
    lineHeight: 20,
  },
});

