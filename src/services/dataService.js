// Data Service for centralized caching of brands and categories
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URLs constants
const API_BASE_URL =
  'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api';
const BRANDS_URL = `${API_BASE_URL}/brands`;
const CATEGORIES_URL = `${API_BASE_URL}/categories`;

// Cache keys
const BRANDS_CACHE_KEY = 'cached_brands';
const CATEGORIES_CACHE_KEY = 'cached_categories';
const CACHE_TIMESTAMP_KEY = 'cache_timestamp';

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache for faster access
let brandsCache = null;
let categoriesCache = null;
let lastFetchTime = 0;

// Generic fetch function with timeout
const fetchWithTimeout = async (url, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Check if cache is valid
const checkCacheValid = () => {
  const now = Date.now();
  return now - lastFetchTime < CACHE_DURATION;
};

// Load cache from AsyncStorage
const loadCacheFromStorage = async () => {
  try {
    const [brandsData, categoriesData, timestamp] = await Promise.all([
      AsyncStorage.getItem(BRANDS_CACHE_KEY),
      AsyncStorage.getItem(CATEGORIES_CACHE_KEY),
      AsyncStorage.getItem(CACHE_TIMESTAMP_KEY),
    ]);

    if (brandsData && categoriesData && timestamp) {
      const cacheTime = parseInt(timestamp);
      const now = Date.now();

      if (now - cacheTime < CACHE_DURATION) {
        brandsCache = JSON.parse(brandsData);
        categoriesCache = JSON.parse(categoriesData);
        lastFetchTime = cacheTime;
        return true;
      }
    }
  } catch (error) {
    // Error loading cache from storage
  }
  return false;
};

// Save cache to AsyncStorage
const saveCacheToStorage = async (brands, categories) => {
  try {
    const timestamp = Date.now();
    await Promise.all([
      AsyncStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(brands)),
      AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories)),
      AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString()),
    ]);

    brandsCache = brands;
    categoriesCache = categories;
    lastFetchTime = timestamp;
  } catch (error) {
    // Error saving cache to storage
  }
};

// Fetch brands with caching
export const fetchBrands = async (forceRefresh = false) => {
  try {
    // Check in-memory cache first
    if (!forceRefresh && brandsCache && checkCacheValid()) {
      return { success: true, data: brandsCache, fromCache: true };
    }

    // Check AsyncStorage cache
    if (!forceRefresh && (await loadCacheFromStorage())) {
      return { success: true, data: brandsCache, fromCache: true };
    }

    // Fetch fresh data
    const response = await fetchWithTimeout(BRANDS_URL);

    if (response.ok) {
      const data = await response.json();
      await saveCacheToStorage(data, categoriesCache || []);
      return { success: true, data, fromCache: false };
    } else {
      return {
        success: false,
        error: 'Failed to fetch brands',
        fromCache: false,
      };
    }
  } catch (error) {
    return { success: false, error: error.message, fromCache: false };
  }
};

// Fetch categories with caching
export const fetchCategories = async (forceRefresh = false) => {
  try {
    // Check in-memory cache first
    if (!forceRefresh && categoriesCache && checkCacheValid()) {
      return { success: true, data: categoriesCache, fromCache: true };
    }

    // Check AsyncStorage cache
    if (!forceRefresh && (await loadCacheFromStorage())) {
      return { success: true, data: categoriesCache, fromCache: true };
    }

    // Fetch fresh data
    const response = await fetchWithTimeout(CATEGORIES_URL);

    if (response.ok) {
      const data = await response.json();
      await saveCacheToStorage(brandsCache || [], data);
      return { success: true, data, fromCache: false };
    } else {
      return {
        success: false,
        error: 'Failed to fetch categories',
        fromCache: false,
      };
    }
  } catch (error) {
    return { success: false, error: error.message, fromCache: false };
  }
};

// Fetch both brands and categories with caching
export const fetchBrandsAndCategories = async (forceRefresh = false) => {
  try {
    // Check if we have both in cache
    if (!forceRefresh && brandsCache && categoriesCache && checkCacheValid()) {
      return {
        success: true,
        brands: brandsCache,
        categories: categoriesCache,
        fromCache: true,
      };
    }

    // Check AsyncStorage cache
    if (!forceRefresh && (await loadCacheFromStorage())) {
      return {
        success: true,
        brands: brandsCache,
        categories: categoriesCache,
        fromCache: true,
      };
    }

    // Fetch fresh data for both
    const [brandsResponse, categoriesResponse] = await Promise.all([
      fetchWithTimeout(BRANDS_URL),
      fetchWithTimeout(CATEGORIES_URL),
    ]);

    if (brandsResponse.ok && categoriesResponse.ok) {
      const [brandsData, categoriesData] = await Promise.all([
        brandsResponse.json(),
        categoriesResponse.json(),
      ]);

      await saveCacheToStorage(brandsData, categoriesData);
      return {
        success: true,
        brands: brandsData,
        categories: categoriesData,
        fromCache: false,
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch data',
        fromCache: false,
      };
    }
  } catch (error) {
    return { success: false, error: error.message, fromCache: false };
  }
};

// Clear cache
export const clearCache = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(BRANDS_CACHE_KEY),
      AsyncStorage.removeItem(CATEGORIES_CACHE_KEY),
      AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY),
    ]);
    brandsCache = null;
    categoriesCache = null;
    lastFetchTime = 0;
  } catch (error) {
    // Error clearing cache
  }
};

// Get cached data without fetching
export const getCachedBrands = () => brandsCache;
export const getCachedCategories = () => categoriesCache;
export const isCacheValid = () => checkCacheValid();
