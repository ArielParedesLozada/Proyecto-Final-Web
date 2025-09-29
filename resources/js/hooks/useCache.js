import { useState, useCallback, useRef } from 'react';

// Cache simple en memoria con TTL (Time To Live)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function useCache() {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const getCachedData = useCallback((key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((key, data) => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const fetchWithCache = useCallback(async (key, fetchFn, options = {}) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    // Verificar caché primero
    const cachedData = getCachedData(key);
    if (cachedData && !options.forceRefresh) {
      return cachedData;
    }

    setIsLoading(true);
    try {
      const data = await fetchFn(abortControllerRef.current.signal);
      setCachedData(key, data);
      return data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const clearCache = useCallback((key) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }, []);

  const invalidateCache = useCallback((pattern) => {
    if (pattern) {
      for (const [key] of cache) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  }, []);

  return {
    fetchWithCache,
    getCachedData,
    clearCache,
    invalidateCache,
    isLoading
  };
}

export default useCache;
