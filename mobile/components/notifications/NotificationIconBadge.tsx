import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export interface NotificationIconBadgeProps {
  count: number;
  color: string;
  size?: number;
}

export default function NotificationIconBadge({
  count,
  color,
  size = 28,
}: NotificationIconBadgeProps) {
  const theme = useTheme();

  if (count <= 0) {
    return <MaterialIcons name="notifications" size={size} color={color} />;
  }

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View style={styles.container}>
      <MaterialIcons name="notifications" size={size} color={color} />
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme.colors.error,
            borderColor: theme.colors.surface,
          },
        ]}
      >
        <Text
          variant="labelSmall"
          style={[styles.badgeText, { color: theme.colors.onError }]}
          numberOfLines={1}
        >
          {displayCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
});

