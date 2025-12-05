import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'expo-notifications functionality is not fully supported',
]);

import { lightTheme as paperLightTheme, darkTheme as paperDarkTheme } from '@/constants/paper-theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useAppTheme } from '@/contexts/ThemeContext';
import { GoalsProvider } from '@/contexts/GoalsContext';
import { TransactionsNavigationProvider } from '@/contexts/TransactionsNavigationContext';
import FixedMovementNotificationChecker from '@/components/notifications/FixedMovementNotificationChecker';
import { useColorScheme as useRNColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedNavigationProvider({ children }: { children: React.ReactNode }) {
  const paperTheme = useTheme();
  const { effectiveTheme } = useAppTheme();
  
  const navigationTheme = effectiveTheme === 'dark' ? DarkTheme : DefaultTheme;

  const customNavigationTheme = {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.error,
    },
  };

  return (
    <NavigationThemeProvider value={customNavigationTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

function RootLayoutContent() {
  const { effectiveTheme } = useAppTheme();
  const paperTheme = effectiveTheme === 'dark' ? paperDarkTheme : paperLightTheme;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
          <GoalsProvider>
            <TransactionsNavigationProvider>
        <ThemedNavigationProvider>
          <FixedMovementNotificationChecker />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
            <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        </ThemedNavigationProvider>
            </TransactionsNavigationProvider>
          </GoalsProvider>
      </AuthProvider>
    </PaperProvider>
    </SafeAreaProvider>
  );
}


export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
