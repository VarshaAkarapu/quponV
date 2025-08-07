/**
 * Test file for apiService.js
 * This file tests the API service to ensure proper Swagger alignment
 */

import { userAPI, couponAPI, categoryAPI, brandAPI } from './apiService';
import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service Swagger Alignment', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock successful API responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('User API', () => {
    test('searchByPhone should use correct Swagger endpoint', async () => {
      const phone = '+919876543210';
      await userAPI.searchByPhone(phone);

      expect(fetch).toHaveBeenCalledWith(
        `${buildApiUrl(
          API_ENDPOINTS.USERS.SEARCH_BY_PHONE,
        )}/${encodeURIComponent(phone)}`,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('completeProfile should use correct Swagger endpoint', async () => {
      const userId = 'test-user-id';
      const profileData = { name: 'Test User' };
      await userAPI.completeProfile(userId, profileData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.USERS.COMPLETE_PROFILE(userId)),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(profileData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('updateProfile should use correct Swagger endpoint', async () => {
      const userId = 'test-user-id';
      const updateData = { name: 'Updated User' };
      await userAPI.updateProfile(userId, updateData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.USERS.UPDATE(userId)),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('getProfile should use correct Swagger endpoint', async () => {
      const userId = 'test-user-id';
      await userAPI.getProfile(userId);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.USERS.PROFILE(userId)),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  describe('Coupon API', () => {
    test('getAll should use correct Swagger endpoint', async () => {
      await couponAPI.getAll();

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.COUPONS.ALL),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('getByCategory should use correct Swagger endpoint', async () => {
      const categoryName = 'Electronics';
      await couponAPI.getByCategory(categoryName);

      expect(fetch).toHaveBeenCalledWith(
        `${buildApiUrl(
          API_ENDPOINTS.COUPONS.BY_CATEGORY,
        )}?categoryName=${encodeURIComponent(categoryName)}`,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('getByBrand should use correct Swagger endpoint', async () => {
      const brandName = 'Apple';
      await couponAPI.getByBrand(brandName);

      expect(fetch).toHaveBeenCalledWith(
        `${buildApiUrl(
          API_ENDPOINTS.BRANDS.COUPONS_BY_BRAND,
        )}?brandName=${encodeURIComponent(brandName)}`,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('getByUser should use correct Swagger endpoint', async () => {
      const userId = 'test-user-id';
      await couponAPI.getByUser(userId);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.COUPONS.BY_USER(userId)),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('getById should use correct Swagger endpoint', async () => {
      const couponId = 'test-coupon-id';
      await couponAPI.getById(couponId);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.COUPONS.BY_ID(couponId)),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('create should use correct Swagger endpoint', async () => {
      const couponData = { title: 'Test Coupon', price: 100 };
      await couponAPI.create(couponData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.COUPONS.CREATE),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(couponData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('update should use correct Swagger endpoint', async () => {
      const couponId = 'test-coupon-id';
      const updateData = { title: 'Updated Coupon' };
      await couponAPI.update(couponId, updateData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.COUPONS.UPDATE(couponId)),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('updateStatus should use correct Swagger endpoint', async () => {
      const couponId = 'test-coupon-id';
      const status = 'approved';
      await couponAPI.updateStatus(couponId, status);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.COUPONS.UPDATE_STATUS),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ couponId, status }),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('delete should use correct Swagger endpoint', async () => {
      const couponId = 'test-coupon-id';
      await couponAPI.delete(couponId);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.COUPONS.DELETE(couponId)),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  describe('Category API', () => {
    test('getAll should use correct Swagger endpoint', async () => {
      await categoryAPI.getAll();

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.CATEGORIES.ALL),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('create should use correct Swagger endpoint', async () => {
      const categoryData = { name: 'Test Category' };
      await categoryAPI.create(categoryData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.CATEGORIES.CREATE),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(categoryData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('update should use correct Swagger endpoint', async () => {
      const id = 'test-category-id';
      const updateData = { name: 'Updated Category' };
      await categoryAPI.update(id, updateData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.CATEGORIES.UPDATE(id)),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('delete should use correct Swagger endpoint', async () => {
      const id = 'test-category-id';
      await categoryAPI.delete(id);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.CATEGORIES.DELETE(id)),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  describe('Brand API', () => {
    test('getAll should use correct Swagger endpoint', async () => {
      await brandAPI.getAll();

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.BRANDS.ALL),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('create should use correct Swagger endpoint', async () => {
      const brandData = { name: 'Test Brand' };
      await brandAPI.create(brandData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.BRANDS.CREATE),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(brandData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('update should use correct Swagger endpoint', async () => {
      const id = 'test-brand-id';
      const updateData = { name: 'Updated Brand' };
      await brandAPI.update(id, updateData);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.BRANDS.UPDATE(id)),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    test('delete should use correct Swagger endpoint', async () => {
      const id = 'test-brand-id';
      await brandAPI.delete(id);

      expect(fetch).toHaveBeenCalledWith(
        buildApiUrl(API_ENDPOINTS.BRANDS.DELETE(id)),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors properly', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      });

      await expect(couponAPI.getAll()).rejects.toThrow(
        'API Error 404: Not Found',
      );
    });

    test('should handle network timeouts', async () => {
      global.fetch.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100);
        });
      });

      await expect(couponAPI.getAll()).rejects.toThrow('Request timeout');
    });
  });
});
