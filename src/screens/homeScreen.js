import React, { useState, useEffect } from 'react';
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
import { getBrandLogo } from '../config/brandConfig';
import { getAllCategories, getCategoryIcon } from '../config/categoryConfig';
import { categoryAPI, brandAPI, userAPI } from '../services/apiService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [popularBrands, setPopularBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    loadDynamicData();
  }, []);

  const loadDynamicData = async () => {
    try {
      setLoading(true);

      // Load popular brands and categories in parallel
      const [brandsData, categoriesData] = await Promise.allSettled([
        brandAPI.getAll(),
        categoryAPI.getAll(),
      ]);

      // Handle brands data
      if (brandsData.status === 'fulfilled') {
        // Debug: Log the first brand to understand the structure
        if (brandsData.value && brandsData.value.length > 0) {
          console.log('🔍 First brand data structure:', brandsData.value[0]);
          console.log('📊 Total brands loaded:', brandsData.value.length);
        }
        // Filter out the flights brand and show all other brands
        const filteredBrands = brandsData.value.filter(
          brand =>
            brand.brandName && brand.brandName.toLowerCase() !== 'flights',
        );
        setPopularBrands(filteredBrands);
      } else {
        console.error('Failed to load brands:', brandsData.reason);
        // Fallback to empty array, will show loading state
        setPopularBrands([]);
      }
      setBrandsLoading(false);

      // Handle categories data
      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
      } else {
        console.error('Failed to load categories:', categoriesData.reason);
        // Fallback to empty array, will show loading state
        setCategories([]);
      }
      setCategoriesLoading(false);
    } catch (error) {
      console.error('Error loading dynamic data:', error);
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

  const handleSearch = text => {
    setSearchQuery(text);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing
    const newTimeout = setTimeout(() => {
      // Navigate to browse screen with search query
      if (text.trim()) {
        navigation.navigate('BrowseDeals', { searchQuery: text.trim() });
      }
    }, 500);

    setSearchTimeout(newTimeout);
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
    // Debug: Log the brand item being rendered
    console.log('🎨 Rendering brand item:', item);

    return (
      <TouchableOpacity
        style={styles.brandItem}
        onPress={() => handleBrandPress(item)}
      >
        <Image
          source={getBrandLogo(item.brandName || item.name)}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>{item.brandName || item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}
    >
      <Image
        source={getCategoryIcon(item.icon || item.name)}
        style={styles.categoryIcon}
        resizeMode="contain"
      />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBrandsSection = () => (
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

  const renderCategoriesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Browse by Category</Text>
      {categoriesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#B71C1C" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : categories.length > 0 ? (
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id || item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories available</Text>
        </View>
      )}
    </View>
  );

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
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for brands..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
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
            <Text style={styles.uploadText}>upload coupon</Text>
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
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                navigation.navigate('BrowseDeals');
              }}
            >
              <Text style={styles.menuItemText}>Categories</Text>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
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
    width: 30,
    height: 30,
    marginRight: 8,
  },
  headerLogoText: {
    fontSize: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 15,
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 15,
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
    fontSize: 16,
    textTransform: 'lowercase',
  },
  browseButton: {
    backgroundColor: '#666',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  browseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tagline: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111',
    marginBottom: 25,
  },
  categoriesList: {
    paddingHorizontal: 20,
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
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
});
