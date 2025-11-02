import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Switch } from 'react-native-paper';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function PreferencesSection() {
  const theme = useTheme();
  const { colorScheme, effectiveTheme, setColorScheme } = useAppTheme();

  const isDarkMode = effectiveTheme === 'dark';

  const handleToggle = async (value: boolean) => {
    await setColorScheme(value ? 'dark' : 'light');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Preferencias
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Personaliza la apariencia de la aplicación
        </Text>
      </View>

      <View style={[styles.preferenceItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.preferenceContent}>
          <View style={styles.preferenceText}>
            <Text
              variant="bodyLarge"
              style={[styles.preferenceLabel, { color: theme.colors.onSurface }]}
            >
              Modo oscuro
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.preferenceDescription, { color: theme.colors.onSurfaceVariant }]}
            >
              {isDarkMode
                ? 'Modo oscuro activado. Ideal para usar la aplicación en ambientes con poca luz'
                : 'Activa el modo oscuro para una experiencia más cómoda en ambientes con poca luz'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleToggle}
            color={theme.colors.primary}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  preferenceItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    opacity: 0.7,
    lineHeight: 20,
  },
});

