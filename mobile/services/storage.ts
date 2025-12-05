import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'jwt_token';

const IS_WEB = Platform.OS === 'web';

/**
 * Storage multiplataforma que usa SecureStore en dispositivos nativos
 * y AsyncStorage en web para compatibilidad
 */
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (IS_WEB) {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (IS_WEB) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (IS_WEB) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  },
};

