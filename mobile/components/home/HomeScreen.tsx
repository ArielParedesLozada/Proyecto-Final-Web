import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui';
import Slider from './Slider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface HomeScreenProps {
  showAuthButtons?: boolean;
  showLogoutButton?: boolean;
  customHeader?: React.ReactNode;
  onLogout?: () => void;
}

/**
 * Componente de pantalla principal/home con slider
 * Muestra información sobre la aplicación y opciones para iniciar sesión o registrarse
 * 
 * @param showAuthButtons - Si es true, muestra botones de registro/login (por defecto: true)
 * @param showLogoutButton - Si es true, muestra botón de cerrar sesión (por defecto: false)
 * @param customHeader - Componente personalizado para el header
 * @param onLogout - Función a ejecutar al presionar cerrar sesión
 */
export default function HomeScreen({
  showAuthButtons = true,
  showLogoutButton = false,
  customHeader,
  onLogout,
}: HomeScreenProps = {}) {
  const theme = useTheme();
  const { user } = useAuth();

  const slides = [
    {
      id: '1',
      title: 'Planifica tus metas',
      description: 'Establece objetivos financieros claros y alcanza tus sueños paso a paso.',
      icon: 'savings',
      color: theme.colors.primary,
    },
    {
      id: '2',
      title: 'Controla tus gastos',
      description: 'Registra tus ingresos y gastos para tener un control completo de tus finanzas.',
      icon: 'account-balance-wallet',
      color: theme.colors.secondary || theme.colors.primary,
    },
    {
      id: '3',
      title: 'Visualiza tu progreso',
      description: 'Mantén un seguimiento detallado de tu progreso hacia cada meta de ahorro.',
      icon: 'trending-up',
      color: '#10b981', // Verde para progreso/éxito
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header con logo */}
      {customHeader || (
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialIcons
              name="account-balance"
              size={48}
              color={theme.colors.onPrimaryContainer}
            />
          </View>
          <Text
            variant="headlineLarge"
            style={[styles.appTitle, { color: theme.colors.onBackground }]}
          >
            {showLogoutButton && user?.first_name 
              ? `¡Bienvenido, ${user.first_name}!`
              : 'FinSave'}
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.appSubtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {showLogoutButton
              ? 'Comienza a gestionar tus finanzas de manera inteligente'
              : 'Tu aliado para el ahorro inteligente'}
          </Text>
        </View>
      )}

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider slides={slides} autoPlay showIndicators />
      </View>

      {/* Características */}
      <View style={styles.featuresContainer}>
        <Card style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.featureContent}>
            <MaterialIcons
              name="security"
              size={32}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
              Seguro y Confiable
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Tus datos están protegidos
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.featureContent}>
            <MaterialIcons
              name="speed"
              size={32}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
              Fácil de Usar
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Interfaz intuitiva y sencilla
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.featureContent}>
            <MaterialIcons
              name="insights"
              size={32}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
              Análisis Detallado
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Estadísticas y reportes completos
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Botones de acción */}
      {(showAuthButtons || showLogoutButton) && (
        <View style={styles.actionsContainer}>
          {showAuthButtons && (
            <>
              <Button
                variant="primary"
                onPress={() => router.push('/register')}
                fullWidth
                style={styles.primaryButton}
              >
                Crear cuenta
              </Button>
              <Button
                variant="outlined"
                onPress={() => router.push('/login')}
                fullWidth
                style={styles.secondaryButton}
              >
                Iniciar sesión
              </Button>
            </>
          )}
          {showLogoutButton && onLogout && (
            <Button
              variant="outlined"
              onPress={onLogout}
              fullWidth
              style={styles.logoutButton}
            >
              Cerrar sesión
            </Button>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  appSubtitle: {
    textAlign: 'center',
  },
  sliderContainer: {
    height: 320,
    marginBottom: 32,
  },
  featuresContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
  },
  featureContent: {
    alignItems: 'center',
    padding: 16,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    marginBottom: 0,
  },
  logoutButton: {
    marginTop: 8,
  },
});

