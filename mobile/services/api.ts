import axios from 'axios';
import Constants from 'expo-constants';
import { storage, TOKEN_KEY } from './storage';

// URL base del API - Se configura en app.json → expo.extra.apiUrl
// Para cambiar la IP, edita mobile/app.json
const getBaseUrl = () => {
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  if (__DEV__) {
    console.warn('API_URL no configurada en app.json, usando fallback');
    return 'http://localhost:8000/api';
  }
  
  console.error('API_URL no configurada. Configura app.json → expo.extra.apiUrl');
  return 'https://tu-dominio.com/api';
};

export const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

