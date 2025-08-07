// API Configuration for different environments
const API_CONFIG = {
  // Development - AWS API Gateway
  development: {
    baseURL: 'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api',
    timeout: 15000,
  },

  // Production - AWS API Gateway
  production: {
    baseURL: 'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api',
    timeout: 15000,
  },
};

// Determine current environment
const getEnvironment = () => {
  // For now, always use production since backend is hosted
  return 'production';
};

// Get current API configuration
const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env];
};

// Helper function to build API URLs
export const buildApiUrl = endpoint => {
  const config = getApiConfig();
  return `${config.baseURL}${endpoint}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: {
    REGISTER: '/users/register',
    LOGIN: '/users/phone',
    SEARCH_BY_PHONE: '/users/phone', // Changed to use the existing phone endpoint
    PROFILE: userId => `/users/profile/${userId}`,
    COMPLETE_PROFILE: userId => `/users/register/${userId}`, // POST method
    UPDATE: userId => `/users/${userId}`, // PUT method for updating user
    SEARCH: '/users/search',
    ALL: '/users',
    DELETE: userId => `/users/${userId}`,
    TEST_FIREBASE: '/users/test-firebase',
  },

  // Category endpoints
  CATEGORIES: {
    ALL: '/categories',
    CREATE: '/categories',
    UPDATE: id => `/categories/${id}`,
    DELETE: id => `/categories/${id}`,
  },

  // Coupon endpoints
  COUPONS: {
    ALL: '/coupons',
    CREATE: '/coupons',
    UPDATE: id => `/coupons/${id}`,
    DELETE: id => `/coupons/${id}`,
    BY_USER: userId => `/coupons/user/${userId}`,
    // Added missing endpoints to align with Swagger
    BY_CATEGORY: '/coupons/category',
    UPDATE_STATUS: '/coupons/update-status',
    BY_ID: couponId => `/coupons/${couponId}`,
  },

  // Brand endpoints
  BRANDS: {
    ALL: '/brands',
    CREATE: '/brands',
    UPDATE: id => `/brands/${id}`,
    DELETE: id => `/brands/${id}`,
    // Added missing endpoint to align with Swagger
    COUPONS_BY_BRAND: '/brands/couponByBrand',
  },
};

// Export configuration
export default {
  getApiConfig,
  buildApiUrl,
  API_ENDPOINTS,
  getEnvironment,
};
