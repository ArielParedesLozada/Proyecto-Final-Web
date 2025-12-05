import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface ProfileHeaderProps {
  title: string;
  subtitle?: string;
}

export default function ProfileHeader({ title, subtitle }: ProfileHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    marginTop: 8,
    paddingTop: 8,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
});

