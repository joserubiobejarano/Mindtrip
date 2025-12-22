import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Constructs a cache key from parts
 * @param parts Array of key parts
 * @returns Full cache key with prefix
 */
export function getCacheKey(parts: string[]): string {
  return `kruno_cache:${parts.join(':')}`;
}

/**
 * Cache entry format stored in AsyncStorage
 */
interface CacheEntry<T> {
  data: T;
  updatedAt: number;
}

/**
 * Retrieves cached JSON data
 * @param key Cache key
 * @returns Object with data and updatedAt timestamp, or null values if not found
 */
export async function getCachedJson<T>(key: string): Promise<{ data: T | null; updatedAt: number | null }> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) {
      return { data: null, updatedAt: null };
    }

    const parsed: CacheEntry<T> = JSON.parse(cached);
    return {
      data: parsed.data,
      updatedAt: parsed.updatedAt,
    };
  } catch (error) {
    console.error(`Error reading cache for key ${key}:`, error);
    return { data: null, updatedAt: null };
  }
}

/**
 * Stores JSON data in cache with current timestamp
 * @param key Cache key
 * @param data Data to cache
 */
export async function setCachedJson<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error writing cache for key ${key}:`, error);
    // Fail silently - cache is not critical
  }
}

/**
 * Clears a specific cache key
 * @param key Cache key to clear
 */
export async function clearCacheKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cache for key ${key}:`, error);
    // Fail silently - cache is not critical
  }
}

