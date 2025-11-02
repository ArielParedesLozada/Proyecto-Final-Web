import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { storage } from '@/services/storage';

type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorScheme: ColorScheme;
  effectiveTheme: 'light' | 'dark';
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  isLoading: boolean;
}

const THEME_KEY = 'app_theme_preference';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('system');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar preferencia guardada
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await storage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setColorSchemeState(saved);
        }
      } catch (error) {
        console.error('Error al cargar preferencia de tema:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Calcular el tema efectivo
  const effectiveTheme = useMemo(() => {
    if (colorScheme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return colorScheme;
  }, [colorScheme, systemColorScheme]);

  // Guardar preferencia y actualizar estado
  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      await storage.setItem(THEME_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.error('Error al guardar preferencia de tema:', error);
    }
  };

  const value = useMemo(
    () => ({
      colorScheme,
      effectiveTheme,
      setColorScheme,
      isLoading,
    }),
    [colorScheme, effectiveTheme, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

