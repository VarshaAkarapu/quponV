import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import AutoDismissAlert from '../components/AutoDismissAlert';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  validateImage,
  getImagePickerOptions,
  formatFileSize,
  processImageForUpload,
} from '../utils/imageUtils';

const { width } = Dimensions.get('window');

export default function AdminUploadCoupon({ navigation }) {
  const [formData, setFormData] = useState({
    brandName: '',
    couponCode: '',
    expiryDate: '',
    category: '',
    couponHeading: '',
    price: '',
    screenshot: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [adminUser, setAdminUser] = useState(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [alert, setAlert] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  // Dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Search states
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Data states
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Date picker state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  useEffect(() => {
    loadAdminData();
    fetchCategories();
    fetchBrands();
  }, []);

  const loadAdminData = async () => {
    try {
      const adminData = await AsyncStorage.getItem('adminUser');
      if (adminData) {
        const admin = JSON.parse(adminData);
        setAdminUser(admin);
        console.log('Admin data loaded:', admin);
      } else {
        console.log('No admin data found in AsyncStorage');
        setAlert({
          visible: true,
          message: 'Admin session not found. Please login again.',
          type: 'error',
        });
        setTimeout(() => navigation.navigate('AdminLogin'), 3000);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setAlert({
        visible: true,
        message: 'Failed to load admin session. Please login again.',
        type: 'error',
      });
      setTimeout(() => navigation.navigate('AdminLogin'), 3000);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Debounced search functions
  const debouncedBrandSearch = useCallback(
    debounce(searchTerm => {
      if (searchTerm.trim() === '') {
        setFilteredBrands(brands);
      } else {
        const filtered = brands.filter(brand =>
          brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredBrands(filtered);
      }
    }, 300),
    [brands],
  );

  const debouncedCategorySearch = useCallback(
    debounce(searchTerm => {
      if (searchTerm.trim() === '') {
        setFilteredCategories(categories);
      } else {
        const filtered = categories.filter(category =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredCategories(filtered);
      }
    }, 300),
    [categories],
  );

  // Fetch brands from backend API
  const fetchBrands = async (searchTerm = '') => {
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/brands',
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Brands API response count:', data?.length || 0);
        // Filter out the flights brand from the brands list
        const filteredData = (data || []).filter(
          brand =>
            brand.brandName && brand.brandName.toLowerCase() !== 'flights',
        );
        setBrands(filteredData);
        setFilteredBrands(filteredData);
      } else {
        console.error('Failed to fetch brands:', response.status);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  // Fetch categories from backend API
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/categories',
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Categories API response count:', data?.length || 0);
        setCategories(data || []);
        setFilteredCategories(data || []);
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary(
        getImagePickerOptions({
          quality: 0.7,
          maxWidth: 1200,
          maxHeight: 1200,
        }),
      );

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        setAlert({
          visible: true,
          message: 'Failed to pick image',
          type: 'error',
        });
        return;
      }

      if (result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];

        try {
          // Use the utility function to validate and process the image
          // Stricter limits for admin (3MB instead of 4MB)
          const processedImage = processImageForUpload(selectedImage, {
            maxSizeMB: 3, // 3MB limit for admin users
            maxDimension: 2000,
          });

          setFormData(prev => ({
            ...prev,
            screenshot: processedImage,
          }));

          if (errors.screenshot) {
            setErrors(prev => ({ ...prev, screenshot: '' }));
          }

          // Log image info for debugging
          if (__DEV__) {
            console.log('Admin image selected:', {
              uri: processedImage.uri,
              fileSize: formatFileSize(processedImage.fileSize),
              width: processedImage.width,
              height: processedImage.height,
              type: processedImage.type,
            });
          }
        } catch (validationError) {
          setAlert({
            visible: true,
            message: validationError.message,
            type: 'error',
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setAlert({
        visible: true,
        message: 'Failed to pick image',
        type: 'error',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required';
    }

    if (!formData.couponCode.trim()) {
      newErrors.couponCode = 'Coupon code is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const expiry = new Date(formData.expiryDate);
      const today = new Date();
      if (expiry <= today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    if (!formData.screenshot) {
      // newErrors.screenshot = 'Coupon screenshot is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue < 0) {
        newErrors.price = 'Price must be a valid positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setAlert({
        visible: true,
        message: 'Please fix the errors before submitting',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      if (!adminUser) {
        setAlert({
          visible: true,
          message: 'Admin session not found. Please login again.',
          type: 'error',
        });
        setTimeout(() => navigation.navigate('AdminLogin'), 3000);
        return;
      }

      // Find the selected brand and category objects to get their IDs
      const selectedBrand = brands.find(
        brand => brand.brandName === formData.brandName.trim(),
      );
      const selectedCategory = categories.find(
        category => category.name === formData.category.trim(),
      );

      // Prepare payload according to backend requirements (matching regular upload)
      const payload = {
        userId: adminUser._id || 'admin',
        categoryId: selectedCategory?._id || formData.category.trim(), // Use categoryId if available, fallback to name
        brandId: selectedBrand?._id || formData.brandName.trim(), // Use brandId if available, fallback to name
        couponCode: formData.couponCode.trim(),
        expireDate: formData.expiryDate, // Backend expects 'expireDate' not 'expiryDate'
        price: parseFloat(formData.price.trim()), // Admin sets the price
        status: 'approved', // Admin uploads are auto-approved
      };

      // If screenshot is provided, we need to use FormData for file upload
      let requestBody;
      let headers;
      let formDataToSend = null;

      console.log('Debug: formData.screenshot exists:', !!formData.screenshot);
      console.log('Debug: formData.screenshot value:', formData.screenshot);

      // Validate that all required fields are present (matching backend requirements)
      const requiredFields = [
        'userId',
        'categoryId',
        'brandId',
        'couponCode',
        'expireDate',
        // 'screenshot', // Commented out for testing
      ];
      const missingFields = requiredFields.filter(field => {
        if (field === 'userId') return !adminUser._id;
        if (field === 'categoryId')
          return !selectedCategory?._id && !formData.category.trim();
        if (field === 'brandId')
          return !selectedBrand?._id && !formData.brandName.trim();
        if (field === 'couponCode') return !formData.couponCode.trim();
        if (field === 'expireDate') return !formData.expiryDate;
        // if (field === 'screenshot') return !formData.screenshot; // Commented out for testing
        return false;
      });

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setAlert({
          visible: true,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          type: 'error',
        });
        setLoading(false);
        return;
      }

      if (formData.screenshot) {
        // Use FormData for file upload
        try {
          formDataToSend = new FormData();
          formDataToSend.append('userId', adminUser._id || 'admin');
          formDataToSend.append(
            'categoryId',
            selectedCategory?._id || formData.category.trim(),
          );
          formDataToSend.append(
            'brandId',
            selectedBrand?._id || formData.brandName.trim(),
          );
          formDataToSend.append('couponCode', formData.couponCode.trim());
          formDataToSend.append('expireDate', formData.expiryDate); // Backend expects 'expireDate'
          formDataToSend.append('price', formData.price.trim());
          formDataToSend.append('status', 'approved'); // Admin uploads are auto-approved
          formDataToSend.append('termsAndConditionImage', {
            uri: formData.screenshot.uri,
            type: formData.screenshot.type || 'image/jpeg',
            name: formData.screenshot.name || 'screenshot.jpg',
          });
        } catch (formDataError) {
          console.error('Error creating FormData:', formDataError);
          formDataToSend = null;
          // Fallback to JSON if FormData creation fails
          requestBody = JSON.stringify(payload);
          headers = {
            'Content-Type': 'application/json',
          };
          console.log('Falling back to JSON format due to FormData error');
        }

        console.log('Debug: FormData created successfully:', !!formDataToSend);
        console.log('Debug: FormData type:', typeof formDataToSend);
        console.log(
          'Debug: FormData has entries method:',
          typeof formDataToSend.entries === 'function',
        );

        // Only set FormData request body if FormData was created successfully
        if (formDataToSend) {
          requestBody = formDataToSend;
          headers = {
            Accept: 'application/json',
            // Don't set Content-Type for FormData - React Native sets it automatically with boundary
          };
        }
      } else {
        // Use JSON for text-only data
        requestBody = JSON.stringify(payload);
        headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
      }

      console.log('Sending payload:', payload); // Debug log
      console.log('Request headers:', headers); // Debug log
      console.log('Final request body:', requestBody);
      console.log(
        'FormData screenshot info:',
        formData.screenshot
          ? {
              uri: formData.screenshot.uri,
              type: formData.screenshot.type,
              name: formData.screenshot.name,
              size: formData.screenshot.fileSize || 'unknown',
            }
          : 'No screenshot',
      );

      // Debug FormData contents only if screenshot exists and FormData is properly initialized
      if (
        formData.screenshot &&
        formDataToSend &&
        typeof formDataToSend.entries === 'function'
      ) {
        console.log('FormData contents:');
        try {
          for (let [key, value] of formDataToSend.entries()) {
            console.log(`${key}:`, value);
          }
        } catch (entriesError) {
          console.log('Error iterating FormData entries:', entriesError);
        }
      } else if (formData.screenshot) {
        console.log('FormData not properly initialized for screenshot');
      }

      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
        {
          method: 'POST',
          headers,
          body: requestBody,
        },
      );

      const data = await response.json();
      console.log('Admin upload response keys:', Object.keys(data || {}));
      console.log('Admin upload response status:', response.status);
      console.log('Admin upload response URL:', response.url);
      console.log('Admin upload response data:', data);
      console.log('Admin upload response headers:', response.headers);

      // Log the actual request details for debugging
      console.log('Request method:', 'POST');
      console.log(
        'Request URL:',
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
      );
      console.log('Request headers:', headers);
      console.log('Request body type:', typeof requestBody);
      console.log(
        'Request body length:',
        requestBody ? requestBody.length || 'N/A' : 'N/A',
      );
      if (response.ok) {
        setAlert({
          visible: true,
          message:
            'Coupon uploaded successfully! It will appear immediately on the home screen and in browse deals.',
          type: 'success',
        });
        // Navigate back to trigger the focus listener refresh
        setTimeout(() => navigation.goBack(), 3000);
      } else {
        setAlert({
          visible: true,
          message: data.message || 'Upload failed. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.message.includes('JSON Parse error')) {
        setAlert({
          visible: true,
          message:
            'The server is not responding correctly. Please try again later.',
          type: 'error',
        });
      } else {
        setAlert({
          visible: true,
          message: 'Upload failed. Please try again.',
          type: 'error',
        });
      }
    }
    setLoading(false);
  };

  const handleDateConfirm = () => {
    const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(
      2,
      '0',
    )}-${String(selectedDay).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, expiryDate: formattedDate }));
    setShowDatePicker(false);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const isDateDisabled = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    const today = new Date();
    return date <= today;
  };

  const renderInput = (
    field,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{placeholder}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={text => {
          setFormData(prev => ({ ...prev, [field]: text }));
          if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
          }
        }}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#999"
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderDropdown = (
    field,
    placeholder,
    data,
    searchValue,
    onSearchChange,
    showDropdown,
    onToggleDropdown,
    onSelect,
    debouncedSearch,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{placeholder}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, errors[field] && styles.inputError]}
        onPress={onToggleDropdown}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            !formData[field] && styles.placeholderText,
          ]}
        >
          {formData[field] || placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdownList}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchValue}
            onChangeText={text => {
              onSearchChange(text);
              debouncedSearch(text);
            }}
            placeholderTextColor="#999"
          />
          <ScrollView
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {data.map(item => (
              <TouchableOpacity
                key={item._id || item.id}
                style={styles.dropdownItem}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>
                  {item.name || item.brandName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (isLoadingAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B71C1C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Auto Dismiss Alert */}
      <AutoDismissAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onDismiss={() =>
          setAlert({ visible: false, message: '', type: 'success' })
        }
      />

      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>Upload Coupon</Text>
        <View style={styles.headerSpacer} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.contentContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
              {renderInput('couponCode', 'Coupon Code')}
              {renderInput('couponHeading', 'Coupon Heading')}
              {renderInput('price', 'Price (₹)', 'numeric')}

              {renderDropdown(
                'category',
                'Select Category',
                filteredCategories,
                categorySearch,
                setCategorySearch,
                showCategoryDropdown,
                setShowCategoryDropdown,
                item => {
                  setFormData(prev => ({ ...prev, category: item.name }));
                  setShowCategoryDropdown(false);
                  setCategorySearch('');
                  if (errors.category) {
                    setErrors(prev => ({ ...prev, category: '' }));
                  }
                },
                debouncedCategorySearch,
              )}

              {renderDropdown(
                'brandName',
                'Select Brand',
                filteredBrands,
                brandSearch,
                setBrandSearch,
                showBrandDropdown,
                setShowBrandDropdown,
                item => {
                  setFormData(prev => ({ ...prev, brandName: item.brandName }));
                  setShowBrandDropdown(false);
                  setBrandSearch('');
                  if (errors.brandName) {
                    setErrors(prev => ({ ...prev, brandName: '' }));
                  }
                },
                debouncedBrandSearch,
              )}

              {/* Date Picker */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Expiry Date</Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    errors.expiryDate && styles.inputError,
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.datePickerText,
                      !formData.expiryDate && styles.placeholderText,
                    ]}
                  >
                    {formData.expiryDate || 'Select Expiry Date'}
                  </Text>
                  <Text style={styles.datePickerIcon}>📅</Text>
                </TouchableOpacity>
                {errors.expiryDate && (
                  <Text style={styles.errorText}>{errors.expiryDate}</Text>
                )}
              </View>

              {/* Image Upload */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Coupon Screenshot</Text>
                <TouchableOpacity
                  style={[
                    styles.imagePickerButton,
                    errors.screenshot && styles.inputError,
                  ]}
                  onPress={pickImage}
                >
                  {formData.screenshot ? (
                    <Image
                      source={{ uri: formData.screenshot.uri }}
                      style={styles.selectedImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderText}>📷</Text>
                      <Text style={styles.imagePlaceholderLabel}>
                        Tap to select screenshot
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {errors.screenshot && (
                  <Text style={styles.errorText}>{errors.screenshot}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Upload Coupon</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Date Picker Modal */}
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>Select Expiry Date</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.datePickerContent}>
                  {/* Year Picker */}
                  <View style={styles.datePickerSection}>
                    <Text style={styles.datePickerLabel}>Year</Text>
                    <ScrollView style={styles.datePickerScroll}>
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() + i,
                      ).map(year => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.datePickerItem,
                            selectedYear === year &&
                              styles.datePickerItemSelected,
                          ]}
                          onPress={() => setSelectedYear(year)}
                        >
                          <Text
                            style={[
                              styles.datePickerItemText,
                              selectedYear === year &&
                                styles.datePickerItemTextSelected,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Month Picker */}
                  <View style={styles.datePickerSection}>
                    <Text style={styles.datePickerLabel}>Month</Text>
                    <ScrollView style={styles.datePickerScroll}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        month => (
                          <TouchableOpacity
                            key={month}
                            style={[
                              styles.datePickerItem,
                              selectedMonth === month &&
                                styles.datePickerItemSelected,
                            ]}
                            onPress={() => setSelectedMonth(month)}
                          >
                            <Text
                              style={[
                                styles.datePickerItemText,
                                selectedMonth === month &&
                                  styles.datePickerItemTextSelected,
                              ]}
                            >
                              {new Date(2000, month - 1).toLocaleDateString(
                                'en-US',
                                { month: 'long' },
                              )}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </ScrollView>
                  </View>

                  {/* Day Picker */}
                  <View style={styles.datePickerSection}>
                    <Text style={styles.datePickerLabel}>Day</Text>
                    <ScrollView style={styles.datePickerScroll}>
                      {Array.from(
                        { length: getDaysInMonth(selectedYear, selectedMonth) },
                        (_, i) => i + 1,
                      ).map(day => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.datePickerItem,
                            selectedDay === day &&
                              styles.datePickerItemSelected,
                            isDateDisabled(selectedYear, selectedMonth, day) &&
                              styles.datePickerItemDisabled,
                          ]}
                          onPress={() => {
                            if (
                              !isDateDisabled(selectedYear, selectedMonth, day)
                            ) {
                              setSelectedDay(day);
                            }
                          }}
                          disabled={isDateDisabled(
                            selectedYear,
                            selectedMonth,
                            day,
                          )}
                        >
                          <Text
                            style={[
                              styles.datePickerItemText,
                              selectedDay === day &&
                                styles.datePickerItemTextSelected,
                              isDateDisabled(
                                selectedYear,
                                selectedMonth,
                                day,
                              ) && styles.datePickerItemTextDisabled,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.datePickerFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleDateConfirm}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  backIcon: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    margin: 10,
    fontSize: 14,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 50,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerIcon: {
    fontSize: 18,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    minHeight: 120,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
    marginBottom: 8,
  },
  imagePlaceholderLabel: {
    fontSize: 14,
    color: '#666',
  },
  selectedImage: {
    width: width - 80,
    height: 200,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width - 40,
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  datePickerContent: {
    flexDirection: 'row',
    padding: 20,
  },
  datePickerSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  datePickerScroll: {
    maxHeight: 200,
  },
  datePickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  datePickerItemSelected: {
    backgroundColor: '#B71C1C',
  },
  datePickerItemDisabled: {
    backgroundColor: '#f0f0f0',
  },
  datePickerItemText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  datePickerItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerItemTextDisabled: {
    color: '#ccc',
  },
  datePickerFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#B71C1C',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
