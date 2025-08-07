/**
 * API Service for handling all API calls with proper Swagger alignment
 * This service ensures all endpoints, payloads, and query parameters match the Swagger documentation
 */

import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';

// Generic fetch function with timeout and error handling
const apiFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();

      // Handle 404 for coupons - this means no coupons found, not an error
      if (response.status === 404 && url.includes('/coupons/user/')) {
        console.log('🔍 No coupons found for user, returning empty array');
        return [];
      }

      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// User API Methods
export const userAPI = {
  /**
   * Search user by phone number (Swagger aligned)
   * POST /api/users/phone
   */
  searchByPhone: async phone => {
    const url = buildApiUrl(API_ENDPOINTS.USERS.SEARCH_BY_PHONE);
    return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  /**
   * Complete user profile (Swagger aligned)
   * POST /api/users/register/{userId}
   */
  completeProfile: async (userId, profileData) => {
    const url = buildApiUrl(API_ENDPOINTS.USERS.COMPLETE_PROFILE(userId));
    return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Update user profile (Swagger aligned)
   * PUT /api/users/{userId}
   */
  updateProfile: async (userId, updateData) => {
    const url = buildApiUrl(API_ENDPOINTS.USERS.UPDATE(userId));
    return apiFetch(url, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Get user profile (Swagger aligned)
   * GET /api/users/profile/{userId}
   */
  getProfile: async userId => {
    const url = buildApiUrl(API_ENDPOINTS.USERS.PROFILE(userId));
    return apiFetch(url, { method: 'GET' });
  },
};

// Coupon API Methods
export const couponAPI = {
  /**
   * Get all coupons (Swagger aligned)
   * GET /api/coupons
   */
  getAll: async () => {
    const url = buildApiUrl(API_ENDPOINTS.COUPONS.ALL);
    return apiFetch(url, { method: 'GET' });
  },

  /**
   * Get coupons by category (Swagger aligned)
   * GET /api/coupons/category?categoryName={categoryName}
   */
  getByCategory: async categoryName => {
    const url = `${buildApiUrl(
      API_ENDPOINTS.COUPONS.BY_CATEGORY,
    )}?categoryName=${encodeURIComponent(categoryName)}`;
    return apiFetch(url, { method: 'GET' });
  },

  /**
   * Get coupons by brand (Swagger aligned)
   * GET /api/brands/couponByBrand?brandName={brandName}
   */
  getByBrand: async brandName => {
    const url = `${buildApiUrl(
      API_ENDPOINTS.BRANDS.COUPONS_BY_BRAND,
    )}?brandName=${encodeURIComponent(brandName)}`;
    return apiFetch(url, { method: 'GET' });
  },

  /**
   * Get user's coupons (Swagger aligned)
   * GET /api/coupons/user/{userId}
   */
  getByUser: async userId => {
    const url = buildApiUrl(API_ENDPOINTS.COUPONS.BY_USER(userId));
    console.log('🔍 API call - getByUser:', url, 'for userId:', userId);
    return apiFetch(url, { method: 'GET' });
  },

  /**
   * Get specific coupon (Swagger aligned)
   * GET /api/coupons/{couponId}
   */
  getById: async couponId => {
    const url = buildApiUrl(API_ENDPOINTS.COUPONS.BY_ID(couponId));
    return apiFetch(url, { method: 'GET' });
  },

  /**
   * Create new coupon (Swagger aligned)
   * POST /api/coupons
   */
  create: async couponData => {
    const url = buildApiUrl(API_ENDPOINTS.COUPONS.CREATE);
    return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },

  /**
   * Update coupon (Swagger aligned)
   * PUT /api/coupons/{couponId}
   */
  update: async (couponId, updateData) => {
    const url = buildApiUrl(API_ENDPOINTS.COUPONS.UPDATE(couponId));
    return apiFetch(url, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Update coupon status (Swagger aligned)
   * PUT /api/coupons/update-status
   */
  updateStatus: async (couponId, status) => {
    const url = buildApiUrl(API_ENDPOINTS.COUPONS.UPDATE_STATUS);
    return apiFetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        couponId,
        status,
      }),
    });
  },

  /**
   * Delete coupon (Swagger aligned)
   * DELETE /api/coupons/{couponId}
   */
  delete: async couponId => {
    const url = buildApiUrl(API_ENDPOINTS.COUPONS.DELETE(couponId));
    return apiFetch(url, { method: 'DELETE' });
  },
};

// Category API Methods
export const categoryAPI = {
  /**
   * Get all categories (Swagger aligned)
   * GET /api/categories
   */
  getAll: async () => {
    const url = buildApiUrl(API_ENDPOINTS.CATEGORIES.ALL);
    return apiFetch(url, { method: 'GET' });
  },

  /**
   * Create new category (Swagger aligned)
   * POST /api/categories
   */
  create: async categoryData => {
    const url = buildApiUrl(API_ENDPOINTS.CATEGORIES.CREATE);
    return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  /**
   * Update category (Swagger aligned)
   * PUT /api/categories/{id}
   */
  update: async (id, updateData) => {
    const url = buildApiUrl(API_ENDPOINTS.CATEGORIES.UPDATE(id));
    return apiFetch(url, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete category (Swagger aligned)
   * DELETE /api/categories/{id}
   */
  delete: async id => {
    const url = buildApiUrl(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return apiFetch(url, { method: 'DELETE' });
  },
};

// Brand API Methods
export const brandAPI = {
  /**
   * Get all brands (Swagger aligned)
   * GET /api/brands
   */
  getAll: async () => {
    const url = buildApiUrl(API_ENDPOINTS.BRANDS.ALL);
    return apiFetch(url, { method: 'GET' });
  },

  /**
   * Create new brand (Swagger aligned)
   * POST /api/brands
   */
  create: async brandData => {
    const url = buildApiUrl(API_ENDPOINTS.BRANDS.CREATE);
    return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  },

  /**
   * Update brand (Swagger aligned)
   * PUT /api/brands/{id}
   */
  update: async (id, updateData) => {
    const url = buildApiUrl(API_ENDPOINTS.BRANDS.UPDATE(id));
    return apiFetch(url, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete brand (Swagger aligned)
   * DELETE /api/brands/{id}
   */
  delete: async id => {
    const url = buildApiUrl(API_ENDPOINTS.BRANDS.DELETE(id));
    return apiFetch(url, { method: 'DELETE' });
  },
};

// Export all API methods
export default {
  user: userAPI,
  coupon: couponAPI,
  category: categoryAPI,
  brand: brandAPI,
};
