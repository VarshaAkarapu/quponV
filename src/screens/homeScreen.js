import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
  Alert,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { getBrandLogo } from '../config/brandConfig';
import { getAllCategories, getCategoryIcon } from '../config/categoryConfig';
import {
  categoryAPI,
  brandAPI,
  userAPI,
  couponAPI,
} from '../services/apiService';

const { width, height } = Dimensions.get('window');

// Responsive design helpers
const getResponsiveValues = currentWidth => {
  const isTablet = currentWidth >= 768;
  const isLargeScreen = currentWidth >= 1024;
  const menuWidth = isLargeScreen
    ? currentWidth * 0.4
    : isTablet
    ? currentWidth * 0.5
    : currentWidth * 0.8;
  return { isTablet, isLargeScreen, menuWidth };
};

// Initialize responsive values with current dimensions for static styles
// Note: dynamic, in-component recalculation still happens via state for runtime orientation changes
const responsiveValues = getResponsiveValues(width);
const { isTablet, isLargeScreen, menuWidth } = responsiveValues;

export default function HomeScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const searchTimeoutRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [popularBrands, setPopularBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hasApprovedCoupons, setHasApprovedCoupons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [screenDimensions, setScreenDimensions] = useState({ width, height });
  const [responsiveValues, setResponsiveValues] = useState(
    getResponsiveValues(width),
  );
  const categoriesListRef = useRef(null);

  useEffect(() => {
    loadDynamicData();
  }, []);

  // Listen for screen orientation changes
  useEffect(() => {
    let subscription;
    try {
      // Check if addEventListener is available
      if (Dimensions.addEventListener) {
        subscription = Dimensions.addEventListener('change', ({ window }) => {
          const newDimensions = { width: window.width, height: window.height };
          setScreenDimensions(newDimensions);
          setResponsiveValues(getResponsiveValues(window.width));
        });
      }
    } catch (error) {
      console.error('Error setting up Dimensions listener:', error);
    }

    return () => {
      try {
        if (subscription?.remove) {
          subscription.remove();
        }
      } catch (error) {
        console.error('Error removing Dimensions listener:', error);
      }
    };
  }, []);

  const loadDynamicData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading dynamic data...');

      // Load popular brands, categories, and coupons in parallel with error handling
      const [brandsData, categoriesData, couponsData] =
        await Promise.allSettled([
          brandAPI.getAll().catch(error => {
            console.error('Brand API error:', error);
            return [];
          }),
          categoryAPI.getAll().catch(error => {
            console.error('Category API error:', error);
            return [];
          }),
          couponAPI
            .getAll()
            .then(all => (Array.isArray(all) ? all : []))
            .catch(error => {
              console.error('Coupon API error:', error);
              return [];
            }),
        ]);

      // Handle brands data
      if (brandsData.status === 'fulfilled') {
        const brands = brandsData.value || [];
        console.log('📊 Brands loaded:', brands.length);
        const filteredBrands = brands.filter(
          brand =>
            brand &&
            brand.brandName &&
            brand.brandName.toLowerCase() !== 'flights',
        );
        setPopularBrands(filteredBrands);
      } else {
        console.error('Failed to load brands:', brandsData.reason);
        setPopularBrands([]);
      }
      setBrandsLoading(false);

      // Handle categories data
      if (categoriesData.status === 'fulfilled') {
        const categories = categoriesData.value || [];
        console.log('📊 Categories loaded:', categories.length);
        setCategories(categories);
      } else {
        console.error('Failed to load categories:', categoriesData.reason);
        setCategories([]);
      }
      setCategoriesLoading(false);

      // Handle coupons data → determine if there are approved coupons
      if (couponsData.status === 'fulfilled') {
        const coupons = couponsData.value || [];
        const anyApproved = coupons.some(c => c && c.status === 'approved');
        setHasApprovedCoupons(anyApproved);
        console.log('📊 Approved coupons exist:', anyApproved);
      } else {
        console.error('Failed to load coupons:', couponsData.reason);
        setHasApprovedCoupons(false);
      }

      console.log('🔍 Dynamic data loaded successfully');
    } catch (error) {
      console.error('Error loading dynamic data:', error);
      setPopularBrands([]);
      setCategories([]);
      setBrandsLoading(false);
      setCategoriesLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPress = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      // If not authenticated, go to login
      navigation.navigate('Login', {
        redirectTo: 'UploadCoupon',
      });
      return;
    }

    // If authenticated, go directly to upload coupon
    // The OTP verification will handle user registration status
    navigation.navigate('UploadCoupon');
  };

  const performSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setShowSuggestions(false);
      setFilteredBrands([]);
      return;
    }
    const matches = (popularBrands || [])
      .map(b => ({
        original: b,
        name: (b.brandName || b.name || '').toString(),
      }))
      .filter(x => x.name.toLowerCase().includes(q))
      .slice(0, 10);
    setFilteredBrands(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSearch = text => {
    setSearchQuery(text);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing (1s) - only show suggestions
    searchTimeoutRef.current = setTimeout(() => {
      const q = text.trim();
      if (q) {
        performSearch(); // Show suggestions instead of navigating
      } else {
        setShowSuggestions(false);
        setFilteredBrands([]);
      }
    }, 1000);
  };

  const handleBrandPress = brand => {
    navigation.navigate('BrowseDeals', {
      brandFilter: brand.brandName || brand.name,
      searchQuery: brand.brandName || brand.name,
    });
  };

  const handleCategoryPress = category => {
    navigation.navigate('BrowseDeals', {
      categoryFilter: category.name,
      searchQuery: category.name,
    });
  };

  const renderBrandItem = ({ item }) => {
    const brandName = item.brandName || item.name;
    const logoSource = getBrandLogo(brandName);

    return (
      <TouchableOpacity
        style={styles.brandItem}
        onPress={() => handleBrandPress(item)}
      >
        <Image
          source={logoSource}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>{brandName}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }) => {
    const categoryName = item.name;
    const iconSource = getCategoryIcon(item.icon || item.name);

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(item)}
      >
        <Image
          source={iconSource}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
        <Text style={styles.categoryName}>{categoryName}</Text>
      </TouchableOpacity>
    );
  };

  const renderBrandsSection = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Brands</Text>
        {brandsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#B71C1C" />
            <Text style={styles.loadingText}>Loading brands...</Text>
          </View>
        ) : popularBrands.length > 0 ? (
          <FlatList
            data={popularBrands}
            renderItem={renderBrandItem}
            keyExtractor={item => item.id || item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No brands available</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategoriesSection = () => {
    const categoriesToShow = categories || [];
    const showHorizontal = hasApprovedCoupons && categoriesToShow.length > 0;
    const showGrid = !hasApprovedCoupons && categoriesToShow.length > 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        {categoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#B71C1C" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : categoriesToShow.length > 0 ? (
          showHorizontal ? (
            <View>
              <View style={styles.categoriesHorizontalWrapper}>
                {categoriesToShow.length > 5 && (
                  <TouchableOpacity
                    style={[styles.scrollArrow, styles.scrollArrowLeft]}
                    onPress={() => {
                      try {
                        categoriesListRef.current?.scrollToOffset?.({
                          offset: Math.max(
                            0,
                            (categoriesListRef.current?._lastOffset || 0) -
                              5 * 120,
                          ),
                          animated: true,
                        });
                      } catch {}
                    }}
                    accessibilityLabel="Scroll categories left"
                  >
                    <Text style={styles.arrowText}>{'‹'}</Text>
                  </TouchableOpacity>
                )}

                <FlatList
                  ref={categoriesListRef}
                  data={categoriesToShow}
                  renderItem={renderCategoryItem}
                  keyExtractor={item => item.id || item._id || item.name}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                  onScroll={e => {
                    // Track last scroll offset for arrow paging
                    categoriesListRef.current._lastOffset =
                      e.nativeEvent.contentOffset.x;
                  }}
                />

                {categoriesToShow.length > 5 && (
                  <TouchableOpacity
                    style={[styles.scrollArrow, styles.scrollArrowRight]}
                    onPress={() => {
                      try {
                        const current =
                          categoriesListRef.current?._lastOffset || 0;
                        categoriesListRef.current?.scrollToOffset?.({
                          offset: current + 5 * 120,
                          animated: true,
                        });
                      } catch {}
                    }}
                    accessibilityLabel="Scroll categories right"
                  >
                    <Text style={styles.arrowText}>{'›'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            // Grid view: two rows, 5 columns (max 10 items)
            <FlatList
              data={categoriesToShow.slice(0, 10)}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id || item._id || item.name}
              numColumns={5}
              columnWrapperStyle={styles.categoriesGridRow}
              contentContainerStyle={styles.categoriesGrid}
              scrollEnabled={false}
            />
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available</Text>
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerLogoText}>Qupon</Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDynamicData} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TouchableOpacity
              onPress={performSearch}
              accessibilityLabel="Search"
            >
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for brands..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
          </View>
          {showSuggestions && filteredBrands.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredBrands}
                keyExtractor={(item, idx) =>
                  item.original.id || item.original._id || item.name + '-' + idx
                }
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const displayName = item.name;
                  const logoSource = getBrandLogo(displayName);
                  return (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => {
                        setShowSuggestions(false);
                        navigation.navigate('BrowseDeals', {
                          brandFilter: displayName,
                          searchQuery: displayName,
                        });
                      }}
                    >
                      <Image
                        source={logoSource}
                        style={styles.suggestionIcon}
                      />
                      <Text style={styles.suggestionText}>{displayName}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </View>

        {/* Informational Message */}
        <View style={styles.infoBox}>
          <View style={styles.infoLine} />
          <Text style={styles.infoText}>
            Purchasing a coupon is currently unavailable as Razorpay is in test
            mode. If you would like to proceed with a purchase, please contact
            us at 9121289189.
          </Text>
        </View>

        {/* Popular Brands Section */}
        {renderBrandsSection()}

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPress}
          >
            <Text style={styles.uploadText}>Upload Coupon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('BrowseDeals')}
          >
            <Text style={styles.browseText}>Browse Deals</Text>
          </TouchableOpacity>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>India's First Coupon Marketplace</Text>

        {/* Browse by Category Section */}
        {renderCategoriesSection()}

        {/* How it Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <Image
                source={require('../assets/upload.png')}
                style={styles.stepImg}
              />
              <Text style={styles.stepTitle}>Upload</Text>
              <Text style={styles.stepDesc}>
                Submit your unused coupon to our platform.
              </Text>
            </View>

            <View style={styles.step}>
              <Image
                source={require('../assets/money.png')}
                style={styles.stepImg}
              />
              <Text style={styles.stepTitle}>Get Paid</Text>
              <Text style={styles.stepDesc}>
                Sellers receive 20% of the coupon value after it is sold.
              </Text>
            </View>

            <View style={styles.step}>
              <Image
                source={require('../assets/score.png')}
                style={styles.stepImg}
              />
              <Text style={styles.stepTitle}>Score a Deal</Text>
              <Text style={styles.stepDesc}>
                Buyers get 75% OFF the coupon's value and save big.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactRow}>
          <View style={styles.contactLeft}>
            <Text style={styles.contactTitle}>Contact:</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:Businessqupon@gmail.com')}
            >
              <Text style={styles.email}>Businessqupon@gmail.com</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactRight}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://www.facebook.com/share/1FFdNCkPm4/?mibextid=wwXIfr',
                )
              }
              accessibilityLabel="Facebook"
            >
              <Image
                source={require('../assets/facebook.png')}
                style={styles.socialIconImg}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://x.com/_qupon?s=21&t=QXETnOLLjTYYRM5cun62Xw',
                )
              }
              accessibilityLabel="X"
            >
              <Image
                source={require('../assets/X.png')}
                style={styles.socialIconImg}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://www.instagram.com/qupon.india/profilecard/?igsh=MTVjb25vMW55Z2xyMA==',
                )
              }
              accessibilityLabel="Instagram"
            >
              <Image
                source={require('../assets/Insta.png')}
                style={styles.socialIconImg}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Profile Menu Modal */}
      {showProfileMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuBackdrop}
            onPress={() => setShowProfileMenu(false)}
          />
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setShowProfileMenu(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {isAdmin && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowProfileMenu(false);
                  navigation.navigate('AdminDashboard');
                }}
              >
                <Text style={styles.menuItemText}>Admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                navigation.navigate('Profile');
              }}
            >
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.menuItemText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                navigation.navigate('AboutUs');
              }}
            >
              <Text style={styles.menuItemText}>About Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveValues.isTablet ? 30 : 20,
    paddingTop: responsiveValues.isTablet ? 60 : 50,
    paddingBottom: responsiveValues.isTablet ? 20 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: responsiveValues.isTablet ? 40 : 30,
    height: responsiveValues.isTablet ? 40 : 30,
    marginRight: responsiveValues.isTablet ? 6 : 4,
  },
  headerLogoText: {
    fontSize: responsiveValues.isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#111',
  },
  profileButton: {
    padding: 10,
  },
  profileIcon: {
    fontSize: 24,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: responsiveValues.isTablet ? 30 : 20,
    paddingVertical: responsiveValues.isTablet ? 20 : 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    marginHorizontal: responsiveValues.isTablet ? 30 : 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    maxHeight: 260,
    overflow: 'hidden',
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  suggestionIcon: {
    width: 26,
    height: 26,
    marginRight: 10,
    borderRadius: 6,
    resizeMode: 'contain',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    fontSize: 18,
    color: '#999',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    padding: 15,
  },
  infoLine: {
    width: 4,
    backgroundColor: '#ffd700',
    borderRadius: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: responsiveValues.isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: responsiveValues.isTablet ? 20 : 15,
    paddingHorizontal: responsiveValues.isTablet ? 30 : 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  brandsList: {
    paddingHorizontal: responsiveValues.isTablet ? 30 : 20,
  },
  brandItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: responsiveValues.isTablet ? 30 : 20,
    paddingHorizontal: responsiveValues.isTablet ? 30 : 20,
    gap: responsiveValues.isTablet ? 20 : 15,
  },
  uploadButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: responsiveValues.isTablet ? 18 : 16,
    textTransform: 'lowercase',
  },
  browseButton: {
    backgroundColor: '#666',
    paddingVertical: responsiveValues.isTablet ? 18 : 15,
    paddingHorizontal: responsiveValues.isTablet ? 30 : 25,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  browseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: responsiveValues.isTablet ? 18 : 16,
  },
  tagline: {
    fontSize: responsiveValues.isTablet ? 22 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111',
    marginBottom: responsiveValues.isTablet ? 35 : 25,
  },
  categoriesList: {
    paddingHorizontal: responsiveValues.isTablet ? 30 : 20,
  },
  categoriesHorizontalWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArrow: {
    position: 'absolute',
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArrowLeft: {
    left: 8,
  },
  scrollArrowRight: {
    right: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#333',
  },
  categoriesGrid: {
    paddingHorizontal: responsiveValues.isTablet ? 16 : 12,
    rowGap: 12,
  },
  categoriesGridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 100,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  step: {
    width: '30%',
    alignItems: 'center',
  },
  stepImg: {
    width: 40,
    height: 40,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  stepTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#111',
    textAlign: 'center',
  },
  stepDesc: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  contactLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  contactTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#111',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  socialIconImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: responsiveValues.menuWidth,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: responsiveValues.isTablet ? 60 : 50,
    paddingHorizontal: responsiveValues.isTablet ? 30 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveValues.isTablet ? 40 : 30,
    paddingBottom: responsiveValues.isTablet ? 20 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuTitle: {
    fontSize: responsiveValues.isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButton: {
    fontSize: responsiveValues.isTablet ? 28 : 24,
    color: '#666',
    padding: 5,
  },
  menuItem: {
    paddingVertical: responsiveValues.isTablet ? 20 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: responsiveValues.isTablet ? 18 : 16,
    color: '#333',
  },
});
