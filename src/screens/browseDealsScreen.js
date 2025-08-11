import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  FlatList,
  Animated,
  Linking,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

import { fetchBrandsAndCategories } from '../services/dataService';
import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { TEXT_STYLES } from '../config/fontConfig';
import { getBrandLogo } from '../config/brandConfig';
import { getCategoryIcon, getAllCategories } from '../config/categoryConfig';
import { convertBase64ToReadable } from '../utils/imageUtils';

// Temporary inline function to replace hasValidImageData
const hasValidImageData = imageData => {
  if (!imageData) return false;

  // Check if it's a string (URL or data URL)
  if (typeof imageData === 'string') {
    // For S3 URLs, just check if it's a valid URL
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return true; // Valid S3 URL
    }
    // For data URLs (legacy), check if they're not too large
    if (imageData.startsWith('data:')) {
      return imageData.length <= 500 * 1024; // 500KB limit
    }
    return false;
  }

  if (imageData.uri) return true;
  if (imageData.url) return true;
  if (imageData.data) return true;

  return false;
};

const API_BASE_URL =
  'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api';

export default function BrowseDealsScreen({ navigation, route }) {
  const { currentUser, isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showBrandFilterModal, setShowBrandFilterModal] = useState(false);
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState(null);
  const [expandedCoupons, setExpandedCoupons] = useState(new Set());
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [modalImageErrors, setModalImageErrors] = useState(new Set());
  const [screenshotPreviewErrors, setScreenshotPreviewErrors] = useState(
    new Set(),
  );
  const [purchasedCoupons, setPurchasedCoupons] = useState(new Set());

  // Filter modal search states
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [brandSearchTimeout, setBrandSearchTimeout] = useState(null);
  const [categorySearchTimeout, setCategorySearchTimeout] = useState(null);

  useEffect(() => {
    fetchCategories(); // This now fetches both categories and brands

    // Always fetch all approved coupons first
    fetchApprovedCoupons();

    // Handle navigation parameters for filtering (frontend filtering)
    if (route.params?.categoryFilter) {
      setSelectedCategory(route.params.categoryFilter);
      setSearchQuery(route.params.searchQuery || '');
    } else if (route.params?.brandFilter) {
      setSearchQuery(route.params.searchQuery || '');
    } else if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params]);

  // Add focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Always refresh all approved coupons
      fetchApprovedCoupons();

      // Also reload purchased coupons when screen comes into focus
      if (currentUser) {
        loadPurchasedCoupons();
      }
    });

    return unsubscribe;
  }, [navigation, currentUser, fetchApprovedCoupons, loadPurchasedCoupons]);

  // Add periodic refresh every 30 seconds when screen is active
  useEffect(() => {
    const interval = setInterval(() => {
      // Always refresh all approved coupons
      fetchApprovedCoupons();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchApprovedCoupons]);

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear any remaining image loading timeouts
      coupons.forEach(coupon => {
        if (coupon._imageTimeout) {
          clearTimeout(coupon._imageTimeout);
          delete coupon._imageTimeout;
        }
        if (coupon._screenshotPreviewTimeout) {
          clearTimeout(coupon._screenshotPreviewTimeout);
          delete coupon._screenshotPreviewTimeout;
        }
      });

      // Clear search timeouts
      if (brandSearchTimeout) {
        clearTimeout(brandSearchTimeout);
      }
      if (categorySearchTimeout) {
        clearTimeout(categorySearchTimeout);
      }
    };
  }, [coupons, brandSearchTimeout, categorySearchTimeout]);

  // Load purchased coupons when user changes
  useEffect(() => {
    if (currentUser) {
      loadPurchasedCoupons();
    }
  }, [currentUser, loadPurchasedCoupons]);

  // Initialize filtered data when main data changes
  useEffect(() => {
    setFilteredBrands(brands);
    setFilteredCategories(categories);
  }, [brands, categories]);

  // Debounced brand search
  useEffect(() => {
    if (brandSearchTimeout) {
      clearTimeout(brandSearchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (brandSearchQuery.trim()) {
        const filtered = brands.filter(brand =>
          brand.brandName
            .toLowerCase()
            .includes(brandSearchQuery.toLowerCase()),
        );
        setFilteredBrands(filtered);
      } else {
        setFilteredBrands(brands);
      }
    }, 300); // 300ms debounce

    setBrandSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [brandSearchQuery, brands, brandSearchTimeout]);

  // Debounced category search
  useEffect(() => {
    if (categorySearchTimeout) {
      clearTimeout(categorySearchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (categorySearchQuery.trim()) {
        const filtered = categories.filter(category =>
          category.name
            .toLowerCase()
            .includes(categorySearchQuery.toLowerCase()),
        );
        setFilteredCategories(filtered);
      } else {
        setFilteredCategories(categories);
      }
    }, 300); // 300ms debounce

    setCategorySearchTimeout(timeoutId);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [categorySearchQuery, categories, categorySearchTimeout]);

  // Debug: Monitor coupons state changes

  // Function to mask coupon code
  const maskCouponCode = code => {
    if (!code || typeof code !== 'string') return '******';
    if (code.length <= 2) return '******';

    // Show only first character, mask everything else
    const firstChar = code.charAt(0);
    const maskedPart = '●'.repeat(code.length - 1);

    return `${firstChar}${maskedPart}`;
  };

  // Function to check if user has purchased a coupon
  const isCouponPurchased = couponId => {
    return purchasedCoupons.has(couponId);
  };

  // Function to load user's purchased coupons
  const loadPurchasedCoupons = useCallback(async () => {
    if (!currentUser) return;

    try {
      const phone = currentUser.phoneNumber?.replace('+91', '') || '';
      const response = await fetch(
        `${buildApiUrl(
          API_ENDPOINTS.USERS.SEARCH_BY_PHONE,
        )}/${encodeURIComponent(`+91${phone}`)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user && data.user.userId) {
          // Fetch user's purchased coupons
          const purchasedResponse = await fetch(
            `${buildApiUrl(API_ENDPOINTS.COUPONS.BY_USER(data.user.userId))}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          if (purchasedResponse.ok) {
            const purchasedData = await purchasedResponse.json();
            if (purchasedData && Array.isArray(purchasedData)) {
              const purchasedIds = new Set(
                purchasedData.map(coupon => coupon.couponId),
              );
              setPurchasedCoupons(purchasedIds);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading purchased coupons:', error);
    }
  }, [currentUser]);

  // Fetch categories and brands from API with caching
  const fetchCategories = useCallback(async () => {
    const result = await fetchBrandsAndCategories();
    if (result.success) {
      setCategories(result.categories);
      // Filter out the flights brand from the brands list
      const filteredBrands = result.brands.filter(
        brand => brand.brandName && brand.brandName.toLowerCase() !== 'flights',
      );
      setBrands(filteredBrands);
    } else {
      setCategories([]);
      setBrands([]);
    }
  }, []);

  // Generic fetch function to reduce redundancy
  const fetchCouponsWithFilter = async (url, filterType = 'all') => {
    try {
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const responseText = await response.text();

        let coupons;
        try {
          coupons = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError);
          setCoupons([]);
          return;
        }

        if (coupons && coupons.length > 0) {
          // Check screenshot field if it exists
          if (coupons[0].screenshot) {
            // Screenshot field exists
          }

          // Check if screenshot might be stored under termsAndConditionImage
          if (coupons[0].termsAndConditionImage) {
            // TermsAndConditionImage field exists
          }
        }

        // Filter for ALL admin-approved coupons (not just admin-uploaded ones)
        const approved = coupons.filter(coupon => {
          // Show ALL coupons that are approved by admin (status === 'approved')
          // This includes both admin-uploaded and user-uploaded coupons that admin approved
          const isApproved = coupon.status === 'approved';
          return isApproved;
        });
        setCoupons(approved);
      } else {
        console.error(
          `Failed to fetch ${filterType} coupons:`,
          response.status,
        );
        const errorText = await response.text();
        console.error(`Error response:`, errorText);
        setCoupons([]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request timeout
      } else {
        console.error(`Error fetching ${filterType} coupons:`, error);
      }
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL admin-approved coupons from API (both admin-uploaded and user-uploaded)
  const fetchApprovedCoupons = useCallback(async () => {
    await fetchCouponsWithFilter(buildApiUrl(API_ENDPOINTS.COUPONS.ALL), 'all');
  }, []);

  // Fetch coupons by category
  const fetchCouponsByCategory = useCallback(async categoryName => {
    await fetchCouponsWithFilter(
      `${buildApiUrl(
        API_ENDPOINTS.COUPONS.BY_CATEGORY,
      )}?categoryName=${encodeURIComponent(categoryName)}`,
      'category',
    );
  }, []);

  // Fetch coupons by brand
  const fetchCouponsByBrand = useCallback(async brandName => {
    await fetchCouponsWithFilter(
      `${buildApiUrl(
        API_ENDPOINTS.BRANDS.COUPONS_BY_BRAND,
      )}?brandName=${encodeURIComponent(brandName)}`,
      'brand',
    );
  }, []);

  const handleBuyNow = async coupon => {
    try {
      console.log('🔐 Buy Now clicked - Auth state:', {
        isAuthenticated,
        currentUser: !!currentUser,
      });

      // Validate coupon data
      if (!coupon || !coupon.couponId) {
        Alert.alert('Error', 'Invalid coupon data');
        return;
      }

      if (!coupon.price || coupon.price <= 0) {
        Alert.alert('Error', 'Invalid coupon price');
        return;
      }

      // If user is not authenticated, go to login
      if (!isAuthenticated) {
        console.log('🔐 User not authenticated, navigating to Login');
        navigation.navigate('Login', {
          redirectTo: 'Payment',
          coupon: coupon,
        });
        return;
      }

      // If user is authenticated, go directly to payment
      console.log('🔐 User authenticated, navigating to Payment');
      navigation.navigate('Payment', { coupon });
    } catch (error) {
      console.error('❌ Error in handleBuyNow:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleCategoryPress = category => {
    setSelectedCategory(category);
    if (category === 'All') {
      fetchApprovedCoupons();
    } else {
      fetchCouponsByCategory(category);
    }
  };

  const handleBrandFilterPress = brandName => {
    setShowBrandFilterModal(false);
    fetchCouponsByBrand(brandName);
  };

  const handleCategoryFilterPress = categoryName => {
    setShowCategoryFilterModal(false);
    fetchCouponsByCategory(categoryName);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Always refresh all approved coupons
    await fetchApprovedCoupons();
    setRefreshing(false);
  };

  const handleCouponPress = coupon => {
    setSelectedCoupon(coupon);
    setShowCouponModal(true);
    // Clear any previous modal image errors
    setModalImageErrors(new Set());

    // Test image processing
    if (coupon.screenshot || coupon.termsAndConditionImage) {
      const imageData = coupon.screenshot || coupon.termsAndConditionImage;

      // Log the image data type
      if (typeof imageData === 'string') {
        if (
          imageData.startsWith('http://') ||
          imageData.startsWith('https://')
        ) {
          console.log('✅ S3 URL detected:', imageData);
        } else if (imageData.startsWith('data:')) {
          console.log('✅ Legacy data URL detected');
          // Extract base64 part from data URL for analysis
          const base64Part = imageData.split(',')[1];
          if (base64Part) {
            convertBase64ToReadable(base64Part, coupon.couponId);
          }
        } else {
          console.log('✅ Other string format detected');
        }
      }
    }
  };

  // Function to resolve brand name from brandId
  const resolveBrandName = (brandId, fallbackBrandName) => {
    if (fallbackBrandName && fallbackBrandName !== 'Unknown Brand') {
      return fallbackBrandName;
    }

    // Try to find brand name from brands list using brandId
    if (brandId && brands.length > 0) {
      const brand = brands.find(b => b.brandId === brandId);
      if (brand) {
        return brand.brandName;
      }
    }

    return fallbackBrandName || 'Unknown Brand';
  };

  const getFilteredCoupons = useCallback(() => {
    let filtered = coupons;

    // Only apply filtering if we have coupons loaded
    if (filtered.length === 0) {
      return filtered;
    }

    // Filter by category if specified in navigation params
    if (route.params?.categoryFilter) {
      filtered = filtered.filter(coupon => {
        // Check multiple possible category field names
        const categoryName =
          coupon.categoryName || coupon.category || coupon.category_name;

        if (categoryName && typeof categoryName === 'string') {
          return (
            categoryName.toLowerCase() ===
            route.params.categoryFilter.toLowerCase()
          );
        }
        return false;
      });
    }

    // Filter by brand if specified in navigation params
    if (route.params?.brandFilter) {
      console.log('🔍 Filtering by brand:', route.params.brandFilter);
      filtered = filtered.filter(coupon => {
        const resolvedBrandName = resolveBrandName(
          coupon.brandId,
          coupon.brandName,
        );
        const matches =
          resolvedBrandName &&
          typeof resolvedBrandName === 'string' &&
          resolvedBrandName.toLowerCase() ===
            route.params.brandFilter.toLowerCase();

        if (matches) {
          console.log('✅ Match found:', resolvedBrandName);
        }

        return matches;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      console.log('🔍 Filtering by search query:', searchQuery);
      filtered = filtered.filter(coupon => {
        const resolvedBrandName = resolveBrandName(
          coupon.brandId,
          coupon.brandName,
        );

        const brandMatch =
          resolvedBrandName &&
          typeof resolvedBrandName === 'string' &&
          resolvedBrandName.toLowerCase().includes(searchQuery.toLowerCase());

        const codeMatch =
          coupon.couponCode &&
          typeof coupon.couponCode === 'string' &&
          coupon.couponCode.toLowerCase().includes(searchQuery.toLowerCase());

        const titleMatch =
          coupon.title &&
          typeof coupon.title === 'string' &&
          coupon.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matches = brandMatch || codeMatch || titleMatch;

        if (matches) {
          console.log(
            '✅ Search match found:',
            resolvedBrandName || coupon.title,
          );
        }

        return matches;
      });
    }

    return filtered;
  }, [coupons, route.params, searchQuery]);

  // Using centralized brand configuration
  // The getBrandLogo function is now imported from brandConfig.js

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  // Using centralized getCategoryIcon from categoryConfig.js

  const [filteredCoupons, setFilteredCoupons] = useState([]);

  // Update filtered coupons when dependencies change
  useEffect(() => {
    const result = getFilteredCoupons();
    setFilteredCoupons(result);

    // Debug logging for brand filtering
    if (route.params?.brandFilter) {
      console.log('🔍 Brand filter applied:', route.params.brandFilter);
      console.log('📊 Total coupons:', coupons.length);
      console.log('✅ Filtered coupons:', result.length);
    }
  }, [coupons, route.params, searchQuery, getFilteredCoupons]);

  const renderCouponCard = ({ item: coupon, index }) => {
    const isTermsExpanded = expandedTerms === coupon.couponId;
    const isPurchased = isCouponPurchased(coupon.couponId);

    const resolvedBrandName = resolveBrandName(
      coupon.brandId,
      coupon.brandName,
    );
    const brandLogoSource = getBrandLogo(resolvedBrandName);

    return (
      <View style={styles.couponCard}>
        {/* Main Content */}
        <View style={styles.couponMainContent}>
          {/* Left Section - Logo and Details */}
          <View style={styles.couponLeftSection}>
            <Image
              source={getBrandLogo(
                resolveBrandName(coupon.brandId, coupon.brandName),
              )}
              style={styles.brandLogo}
              resizeMode="contain"
              onError={error => {
                console.error(
                  'Image loading error for brand:',
                  resolveBrandName(coupon.brandId, coupon.brandName),
                );
              }}
            />
            <View style={styles.couponDetails}>
              <Text style={styles.brandName}>
                {resolveBrandName(coupon.brandId, coupon.brandName)}
              </Text>
              <Text style={styles.couponPrice}>₹{coupon.price || 0}</Text>
              <Text style={styles.couponTitle}>
                {coupon.title ||
                  `${resolveBrandName(
                    coupon.brandId,
                    coupon.brandName,
                  )} Coupon`}
              </Text>
              {coupon.description && (
                <Text style={styles.couponDescription}>
                  {coupon.description}
                </Text>
              )}
              <Text style={styles.expireDate}>
                Expires:{' '}
                {new Date(
                  coupon.expireDate || coupon.expiryDate,
                ).toLocaleDateString()}
              </Text>

              {/* Coupon Code Section */}
              {coupon.couponCode && (
                <View style={styles.couponCodeSection}>
                  <Text style={styles.couponCodeLabel}>Coupon Code:</Text>
                  <View style={styles.couponCodeContainer}>
                    <Text style={styles.couponCode}>
                      {isPurchased
                        ? coupon.couponCode
                        : maskCouponCode(coupon.couponCode)}
                    </Text>
                    {!isPurchased && <Text style={styles.lockIcon}>🔒</Text>}
                    {isPurchased && <Text style={styles.unlockIcon}>✅</Text>}
                  </View>
                  {!isPurchased && (
                    <Text style={styles.purchaseHint}>
                      Purchase to unlock full code
                    </Text>
                  )}
                  {isPurchased && (
                    <Text style={styles.purchasedText}>
                      ✓ Purchased - Code unlocked
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Right Section - Status and Buy Button */}
          <View style={styles.couponRightSection}>
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(coupon.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {coupon.status?.toUpperCase() || 'PENDING'}
              </Text>
            </View>

            {/* Buy Now Button or Purchased Badge */}
            {!isPurchased ? (
              <TouchableOpacity
                style={styles.buyNowButton}
                onPress={() => handleBuyNow(coupon)}
              >
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.purchasedBadge}>
                <Text style={styles.purchasedBadgeText}>Purchased</Text>
              </View>
            )}
          </View>
        </View>

        {/* View More Button - Removed for now */}
        {/* Expanded Terms & Conditions Section - Removed for now */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.centerContainer}>
          <Text style={styles.pageHeadingText}>Browse Deals</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            fetchApprovedCoupons();
          }}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Text style={styles.searchIconText}>🔍</Text>
        </View>
        <TextInput
          placeholder="Search coupons..."
          style={styles.searchInput}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Indicator */}
      {(route.params?.categoryFilter || route.params?.brandFilter) && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            {route.params?.categoryFilter &&
              `Category: ${route.params.categoryFilter}`}
            {route.params?.categoryFilter && route.params?.brandFilter && ' | '}
            {route.params?.brandFilter && `Brand: ${route.params.brandFilter}`}
          </Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              navigation.setParams({ categoryFilter: null, brandFilter: null });
              setSearchQuery('');
            }}
          >
            <Text style={styles.clearFilterButtonText}>Clear Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Coupons List */}
      <FlatList
        data={filteredCoupons}
        renderItem={renderCouponCard}
        keyExtractor={(item, index) => item.couponId || index.toString()}
        style={styles.couponsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#B71C1C"
              style={styles.loader}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {route.params?.categoryFilter || route.params?.brandFilter
                  ? `No coupons found for ${
                      route.params?.categoryFilter || route.params?.brandFilter
                    }`
                  : searchQuery.trim()
                  ? 'No coupons match your search'
                  : 'No approved coupons available'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {route.params?.categoryFilter || route.params?.brandFilter
                  ? 'Try selecting a different category or brand'
                  : searchQuery.trim()
                  ? 'Try adjusting your search terms'
                  : 'Check back later for new deals'}
              </Text>
            </View>
          )
        }
      />

      {/* Bottom Filter Buttons */}
      <View style={styles.bottomFilterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowBrandFilterModal(true)}
        >
          <Text style={styles.filterIcon}>🔍</Text>
          <Text style={styles.filterButtonText}>Filter by Brand</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryFilterModal(true)}
        >
          <Text style={styles.filterIcon}>📂</Text>
          <Text style={styles.filterButtonText}>Filter by Category</Text>
        </TouchableOpacity>
      </View>

      {/* Brand Filter Modal */}
      <Modal
        visible={showBrandFilterModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.brandFilterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Brand</Text>
              <TouchableOpacity onPress={() => setShowBrandFilterModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchIcon}>
                <Text style={styles.modalSearchIconText}>🔍</Text>
              </View>
              <TextInput
                placeholder="Search brands..."
                style={styles.modalSearchInput}
                placeholderTextColor="#999"
                value={brandSearchQuery}
                onChangeText={setBrandSearchQuery}
                returnKeyType="search"
              />
              {brandSearchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.modalClearButton}
                  onPress={() => setBrandSearchQuery('')}
                >
                  <Text style={styles.modalClearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredBrands}
              renderItem={({ item: brand }) => (
                <TouchableOpacity
                  style={styles.brandFilterItem}
                  onPress={() => handleBrandFilterPress(brand.brandName)}
                >
                  <Image
                    source={getBrandLogo(brand.brandName)}
                    style={styles.brandFilterLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.brandFilterName}>{brand.brandName}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.brandId}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.modalEmptyState}>
                  <Text style={styles.modalEmptyStateText}>
                    {brandSearchQuery.trim()
                      ? `No brands found for "${brandSearchQuery}"`
                      : 'No brands available'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Category Filter Modal */}
      <Modal
        visible={showCategoryFilterModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.brandFilterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryFilterModal(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchIcon}>
                <Text style={styles.modalSearchIconText}>🔍</Text>
              </View>
              <TextInput
                placeholder="Search categories..."
                style={styles.modalSearchInput}
                placeholderTextColor="#999"
                value={categorySearchQuery}
                onChangeText={setCategorySearchQuery}
                returnKeyType="search"
              />
              {categorySearchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.modalClearButton}
                  onPress={() => setCategorySearchQuery('')}
                >
                  <Text style={styles.modalClearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredCategories}
              renderItem={({ item: category }) => (
                <TouchableOpacity
                  style={styles.brandFilterItem}
                  onPress={() => handleCategoryFilterPress(category.name)}
                >
                  <Image
                    source={getCategoryIcon(category.name)}
                    style={styles.brandFilterLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.brandFilterName}>{category.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.categoryId}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.modalEmptyState}>
                  <Text style={styles.modalEmptyStateText}>
                    {categorySearchQuery.trim()
                      ? `No categories found for "${categorySearchQuery}"`
                      : 'No categories available'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Coupon Details Modal */}
      <Modal visible={showCouponModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Coupon Details</Text>
              <TouchableOpacity onPress={() => setShowCouponModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedCoupon && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalBrandSection}>
                  <Image
                    source={getBrandLogo(selectedCoupon.brandName)}
                    style={styles.modalBrandLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.modalBrandName}>
                    {selectedCoupon.brandName || 'Unknown Brand'}
                  </Text>
                </View>

                <Text style={styles.modalHeading}>
                  {selectedCoupon.title ||
                    `Get ${selectedCoupon.discount || 60}% Off`}
                </Text>

                <Text style={styles.modalDescription}>
                  {selectedCoupon.description ||
                    `${selectedCoupon.brandName || 'Brand'}: Get ${
                      selectedCoupon.discount || 60
                    }% Off On ${selectedCoupon.categoryName || 'Products'}`}
                </Text>

                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Price:</Text>
                    <Text style={styles.detailValue}>
                      ₹{selectedCoupon.price || 0}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>
                      {selectedCoupon.categoryName}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expires:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(
                        selectedCoupon.expiryDate || selectedCoupon.expireDate,
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Coupon Code:</Text>
                    <View style={styles.couponCodeDetailContainer}>
                      <Text style={styles.detailValue}>
                        {isCouponPurchased(selectedCoupon.couponId)
                          ? selectedCoupon.couponCode
                          : maskCouponCode(selectedCoupon.couponCode)}
                      </Text>
                      {!isCouponPurchased(selectedCoupon.couponId) && (
                        <Text style={styles.lockIcon}>🔒</Text>
                      )}
                      {isCouponPurchased(selectedCoupon.couponId) && (
                        <Text style={styles.unlockIcon}>✅</Text>
                      )}
                    </View>
                  </View>
                  {!isCouponPurchased(selectedCoupon.couponId) && (
                    <Text style={styles.purchaseMessage}>
                      Purchase this coupon to unlock the full code
                    </Text>
                  )}
                  {isCouponPurchased(selectedCoupon.couponId) && (
                    <Text style={styles.purchasedMessage}>
                      ✓ Purchased - Code unlocked and ready to use
                    </Text>
                  )}
                </View>

                {/* Terms & Conditions Section in Modal */}
                {hasValidImageData(selectedCoupon.termsAndConditionImage) && (
                  <View style={styles.termsImageContainer}>
                    <Text style={styles.termsTitle}>Terms & Conditions:</Text>
                    <Image
                      source={{
                        uri:
                          selectedCoupon.termsAndConditionImage ||
                          'https://via.placeholder.com/400x200?text=Terms+%26+Conditions+Not+Available',
                      }}
                      style={styles.termsImage}
                      resizeMode="contain"
                      onError={error => {
                        console.error(
                          'Error loading modal terms image for coupon:',
                          selectedCoupon.couponId,
                        );
                        console.error(
                          'Modal terms error object:',
                          JSON.stringify(error, null, 2),
                        );
                        setModalImageErrors(prev =>
                          new Set(prev).add(selectedCoupon.couponId),
                        );
                      }}
                      onLoad={() => {
                        console.log(
                          'Successfully loaded modal terms image for coupon:',
                          selectedCoupon.couponId,
                        );
                      }}
                    />
                  </View>
                )}

                <Text style={styles.termsTitle}>Terms & Conditions:</Text>
                <Text style={styles.termsText}>
                  • This coupon is valid for one-time use only{'\n'}• Cannot be
                  combined with other offers{'\n'}• Valid until expiry date
                  {'\n'}• Subject to brand's terms and conditions
                </Text>

                <TouchableOpacity
                  style={styles.modalBuyButton}
                  onPress={() => {
                    setShowCouponModal(false);
                    handleBuyNow(selectedCoupon);
                  }}
                >
                  <Text style={styles.modalBuyButtonText}>
                    Buy Now - ₹{selectedCoupon.price || 0}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
  },
  logoImage: {
    width: 35,
    height: 35,
    borderRadius: 0,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryNavScroll: {
    backgroundColor: '#2c2c2c',
    paddingVertical: 8,
  },
  categoryNavChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  selectedCategoryNavChip: {
    backgroundColor: '#B71C1C',
  },
  categoryNavChipText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  selectedCategoryNavChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  couponsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: '#f5f5f5',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
  },
  couponMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  couponLeftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  couponRightSection: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginLeft: 15,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  couponDetails: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  couponPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 4,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  couponDescription: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  expireDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    fontStyle: 'italic',
  },

  screenshotPreviewSection: {
    marginTop: 10,
  },
  screenshotDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  screenshotPreviewTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  screenshotDropdownIcon: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  screenshotExpandedContent: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  screenshotPreviewContainer: {
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
  },
  screenshotPreviewImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
  },
  screenshotPreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshotPreviewText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  viewFullScreenshotButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewFullScreenshotText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  couponCodeSection: {
    marginTop: 8,
  },
  couponCodeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
  },
  couponCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginRight: 5,
  },
  lockIcon: {
    fontSize: 12,
    color: '#666',
  },
  unlockIcon: {
    fontSize: 12,
    color: '#4CAF50',
  },
  purchaseHint: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    fontStyle: 'italic',
  },
  purchasedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  buyNowButton: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  purchasedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  purchasedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    marginTop: 10,
    borderRadius: 6,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#B71C1C',
    fontWeight: '500',
    marginRight: 5,
  },
  viewMoreArrow: {
    fontSize: 12,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  viewMoreArrowExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  termsExpandedSection: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  screenshotPreviewContainerMargin: {
    marginBottom: 15,
  },
  screenshotPreviewTitleMargin: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  screenshotPreviewImageLarge: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
  },
  screenshotPreviewImageHidden: {
    opacity: 0,
  },
  screenshotPreviewLoadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
  },
  screenshotPreviewLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  screenshotPreviewErrorContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  screenshotPreviewErrorImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
    opacity: 0.6,
  },
  screenshotPreviewErrorText: {
    fontSize: 12,
    color: '#c53030',
    marginBottom: 8,
  },
  termsTitleLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  termsImageLarge: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  termsTextLarge: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomFilterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 0.48,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterButtonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandFilterModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  brandFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  brandFilterLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 15,
  },
  brandFilterName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalBody: {
    padding: 20,
  },
  modalBrandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBrandLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  modalBrandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    lineHeight: 24,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  couponCodeDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseMessage: {
    fontSize: 12,
    color: '#B71C1C',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
  purchasedMessage: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
  termsImageContainer: {
    marginBottom: 20,
  },
  screenshotSection: {
    marginBottom: 20,
  },
  screenshotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  screenshotImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#f8f8f8',
  },
  screenshotImageHidden: {
    opacity: 0,
  },
  screenshotLoadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 10,
  },
  screenshotLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  screenshotErrorContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  screenshotErrorImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    opacity: 0.6,
  },
  screenshotErrorText: {
    fontSize: 14,
    color: '#c53030',
    marginBottom: 10,
  },
  termsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  termsImageHidden: {
    opacity: 0,
  },
  imageLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 10,
  },
  loadingImage: {
    width: 40,
    height: 40,
    marginBottom: 10,
    borderRadius: 20,
  },
  imageLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  imageSizeWarning: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 5,
    textAlign: 'center',
  },
  imageErrorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  errorImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    opacity: 0.6,
  },
  imageErrorText: {
    fontSize: 14,
    color: '#c53030',
    marginBottom: 10,
  },
  imageErrorDetails: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalBuyButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBuyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginLeft: 10,
  },
  refreshButtonText: {
    fontSize: 20,
    color: '#333',
  },
  debugButton: {
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    marginLeft: 10,
  },
  debugButtonText: {
    fontSize: 20,
    color: '#1976d2',
  },
  analyzeButton: {
    padding: 10,
    backgroundColor: '#fff3e0',
    borderRadius: 20,
    marginLeft: 10,
  },
  analyzeButtonText: {
    fontSize: 20,
    color: '#f57c00',
  },
  filterIndicator: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  filterIndicatorText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
    flex: 1,
  },
  clearFilterButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearFilterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconText: {
    fontSize: 16,
    color: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  // Screenshot Modal Styles
  screenshotModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
  },
  screenshotModalBody: {
    padding: 20,
  },
  screenshotModalBrandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  screenshotModalBrandLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  screenshotModalBrandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  screenshotModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  screenshotModalImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  screenshotModalImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  screenshotModalDetails: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  screenshotModalDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  screenshotModalDetailLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  screenshotModalBuyButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  screenshotModalBuyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Search Styles
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalSearchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchIconText: {
    fontSize: 16,
    color: '#999',
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalClearButton: {
    padding: 5,
  },
  modalClearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  modalEmptyState: {
    alignItems: 'center',
    padding: 20,
  },
  modalEmptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
