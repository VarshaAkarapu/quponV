import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { brandAPI, categoryAPI, couponAPI } from '../services/apiService';
import { getBrandLogo } from '../config/brandConfig';
import { getCategoryIcon } from '../config/categoryConfig';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

export default function UploadCouponScreen({ navigation }) {
  // Form state
  const [formData, setFormData] = useState({
    brandName: '',
    couponCode: '',
    description: '',
    expiryDate: new Date(),
    category: '',
    screenshot: null,
    screenshotFile: null,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Data state
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Refs
  const scrollViewRef = useRef();

  useEffect(() => {
    loadBrandsAndCategories();
  }, []);

  useEffect(() => {
    // Debounced search for brands
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      if (showBrandDropdown) {
        const filtered = brands.filter(brand =>
          brand.brandName?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredBrands(filtered);
      } else if (showCategoryDropdown) {
        const filtered = categories.filter(category =>
          category.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredCategories(filtered);
      }
    }, 300);

    setSearchTimeout(newTimeout);

    return () => {
      if (newTimeout) clearTimeout(newTimeout);
    };
  }, [
    searchQuery,
    showBrandDropdown,
    showCategoryDropdown,
    brands,
    categories,
  ]);

  const loadBrandsAndCategories = async () => {
    try {
      setLoadingData(true);
      const [brandsData, categoriesData] = await Promise.allSettled([
        brandAPI.getAll(),
        categoryAPI.getAll(),
      ]);

      if (brandsData.status === 'fulfilled') {
        const filteredBrands = brandsData.value.filter(
          brand =>
            brand.brandName && brand.brandName.toLowerCase() !== 'flights',
        );
        setBrands(filteredBrands);
        setFilteredBrands(filteredBrands);
      }

      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
        setFilteredCategories(categoriesData.value);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load brands and categories');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, expiryDate: selectedDate }));
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera access to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API level 33+), we need READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Photo Permission',
              message: 'App needs access to your photos to select images',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For older Android versions, use READ_EXTERNAL_STORAGE
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs storage access to select images',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    } else {
      return true;
    }
  };

  const handleImageUpload = () => {
    handleGalleryPick();
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to take photos',
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: false,
      saveToPhotos: false,
    };

    try {
      const result = await launchCamera(options);
      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setFormData(prev => ({
          ...prev,
          screenshot: image.uri,
          screenshotFile: image,
        }));
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleGalleryPick = async () => {
    try {
      // Try to request permission first
      const hasPermission = await requestStoragePermission();

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: false,
        selectionLimit: 1,
        presentationStyle: 'fullScreen',
      };

      // Try to launch gallery even if permission check failed
      // Some devices handle permissions differently
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        console.error(
          'Image picker error:',
          result.errorCode,
          result.errorMessage,
        );

        // If we get a permission error, show a helpful message
        if (
          result.errorCode === 'permission' ||
          result.errorMessage?.includes('permission')
        ) {
          Alert.alert(
            'Permission Required',
            'Please grant photo access permission to select images from your gallery.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Try Again',
                onPress: () => handleGalleryPick(),
              },
            ],
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to open gallery: ${result.errorMessage || 'Unknown error'}`,
          );
        }
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setFormData(prev => ({
          ...prev,
          screenshot: image.uri,
          screenshotFile: image,
        }));
        console.log('Image selected successfully:', image.uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);

      // Check if it's a permission-related error
      if (
        error.message?.includes('permission') ||
        error.code === 'permission'
      ) {
        Alert.alert(
          'Permission Required',
          'Please grant photo access permission to select images from your gallery.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Try Again',
              onPress: () => handleGalleryPick(),
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to open gallery. Please check your permissions and try again.',
        );
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.brandName.trim()) {
      Alert.alert('Error', 'Please enter brand name');
      return;
    }
    if (!formData.couponCode.trim()) {
      Alert.alert('Error', 'Please enter coupon code');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter coupon description');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!formData.screenshotFile) {
      Alert.alert('Error', 'Please upload screenshot/terms & conditions');
      return;
    }

    try {
      setLoading(true);

      // No need to find brand/category objects since we're sending names directly

      const couponData = {
        userId: 'user', // Will be replaced by backend with actual user ID
        categoryName: formData.category.trim(), // Backend expects categoryName, not categoryId
        brandName: formData.brandName.trim(), // Backend expects brandName, not brandId
        couponCode: formData.couponCode.trim(),
        expireDate: formData.expiryDate.toISOString(), // Backend expects 'expireDate' not 'expiryDate'
        description: formData.description.trim(),
        price: 0, // Optional field, default to 0
      };

      // Handle image upload with FormData if screenshot is provided
      let result;
      if (formData.screenshotFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('userId', 'user');
        formDataToSend.append('categoryName', formData.category.trim());
        formDataToSend.append('brandName', formData.brandName.trim());
        formDataToSend.append('couponCode', formData.couponCode.trim());
        formDataToSend.append('expireDate', formData.expiryDate.toISOString());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('price', '0');
        formDataToSend.append('termsAndConditionImage', {
          uri: formData.screenshotFile.uri,
          type: formData.screenshotFile.type || 'image/jpeg',
          name: formData.screenshotFile.name || 'screenshot.jpg',
        });

        // Make direct API call with FormData
        const response = await fetch(
          'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formDataToSend,
          },
        );

        const responseData = await response.json();
        result = {
          success: response.ok,
          message: responseData.message || 'Upload completed',
        };
      } else {
        // Use regular API call for JSON data
        result = await couponAPI.create(couponData);
      }

      if (result.success) {
        Alert.alert(
          'Success',
          'Coupon uploaded successfully! It will be reviewed by admin.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ],
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to upload coupon');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (
    isVisible,
    data,
    onSelect,
    placeholder,
    searchPlaceholder,
  ) => {
    if (!isVisible) return null;

    return (
      <View style={styles.dropdownContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            autoFocus
          />
        </View>

        {data.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No results found</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.dropdownList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {data.map(item => (
              <TouchableOpacity
                key={item.id || item._id}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(item);
                  setShowBrandDropdown(false);
                  setShowCategoryDropdown(false);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {item.brandName || item.name}
                </Text>
                <Text style={styles.dropdownItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Coupon</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Step 1: Brand Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Brand Name *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowCategoryDropdown(false);
                setShowBrandDropdown(!showBrandDropdown);
              }}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !formData.brandName && styles.placeholderText,
                ]}
              >
                {formData.brandName || 'Select Brand'}
              </Text>
              <Text style={styles.dropdownArrow}>
                {showBrandDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {renderDropdown(
              showBrandDropdown,
              filteredBrands,
              brand => handleInputChange('brandName', brand.brandName),
              'Select Brand',
              'Search brands...',
            )}
          </View>

          {/* Step 2: Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowBrandDropdown(false);
                setShowCategoryDropdown(!showCategoryDropdown);
              }}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !formData.category && styles.placeholderText,
                ]}
              >
                {formData.category || 'Select Category'}
              </Text>
              <Text style={styles.dropdownArrow}>
                {showCategoryDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {renderDropdown(
              showCategoryDropdown,
              filteredCategories,
              category => handleInputChange('category', category.name),
              'Select Category',
              'Search categories...',
            )}
          </View>

          {/* Step 3: Coupon Code */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Coupon Code *</Text>
            <TextInput
              style={styles.input}
              value={formData.couponCode}
              onChangeText={text => handleInputChange('couponCode', text)}
              placeholder="Enter coupon code"
              placeholderTextColor="#999"
            />
          </View>

          {/* Step 4: Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={text => handleInputChange('description', text)}
              placeholder="e.g., 15% off on ₹3000 cart value"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Step 5: Expiry Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Expiry Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formData.expiryDate.toLocaleDateString()}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Step 6: Screenshot Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Screenshot/Terms & Conditions *</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImageUpload}
            >
              {formData.screenshot ? (
                <View style={styles.uploadedImageContainer}>
                  <Image
                    source={{ uri: formData.screenshot }}
                    style={styles.uploadedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.uploadedImageOverlay}>
                    <Text style={styles.uploadedText}>✓ Image Uploaded</Text>
                    <Text style={styles.uploadedSubText}>Tap to change</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Tap to upload image</Text>
                  <Text style={styles.uploadSubText}>From Gallery</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Upload Coupon</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.expiryDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontWeight: '400',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 16,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 0,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    minHeight: 120,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  uploadSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  uploadedImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadedImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    alignItems: 'center',
  },
  uploadedText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  uploadedSubText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#B71C1C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    color: '#999',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  dropdownItemArrow: {
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
