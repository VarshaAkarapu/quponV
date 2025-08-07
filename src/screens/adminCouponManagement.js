import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import AutoDismissAlert from '../components/AutoDismissAlert';

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

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminCouponManagement({ navigation }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which coupon is being updated
  const [localStatusChanges, setLocalStatusChanges] = useState({}); // Track local status changes
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editChanges, setEditChanges] = useState({}); // Track edit changes by couponId
  const [alert, setAlert] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    const initializeData = async () => {
      await loadLocalStatusChanges();
      await fetchCoupons();
      await fetchCategories();
      await fetchBrands();
    };

    initializeData();
  }, []);

  // Add focus listener to reload data when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      // Don't reload data if edit modal is open
      if (showEditModal) {
        return;
      }

      // Reload data when screen comes into focus
      const savedChanges = await AsyncStorage.getItem('couponStatusChanges');
      let currentChanges = {};
      if (savedChanges) {
        currentChanges = JSON.parse(savedChanges);
        setLocalStatusChanges(currentChanges);
      }
      fetchCoupons(currentChanges);
    });

    return unsubscribe;
  }, [navigation, showEditModal]);

  // Load local status changes from AsyncStorage
  const loadLocalStatusChanges = async () => {
    try {
      const savedChanges = await AsyncStorage.getItem('couponStatusChanges');
      if (savedChanges) {
        setLocalStatusChanges(JSON.parse(savedChanges));
      }
    } catch (error) {
      console.error('Error loading local status changes:', error);
    }
  };

  // Save local status changes to AsyncStorage
  const saveLocalStatusChanges = async changes => {
    try {
      await AsyncStorage.setItem(
        'couponStatusChanges',
        JSON.stringify(changes),
      );
    } catch (error) {
      console.error('Error saving local status changes:', error);
    }
  };

  // Clear local status changes (useful for logout or reset)
  const clearLocalStatusChanges = async () => {
    try {
      await AsyncStorage.removeItem('couponStatusChanges');
      setLocalStatusChanges({});
    } catch (error) {
      console.error('Error clearing local status changes:', error);
    }
  };

  // Reset stuck loading states
  const resetStuckStates = () => {
    setUpdatingStatus({});
    setAlert({
      visible: true,
      message: 'Loading states reset successfully',
      type: 'success',
    });
  };

  const fetchCoupons = async (currentLocalChanges = null) => {
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const coupons = await response.json();
      // The getAllCoupons API returns an array directly, not wrapped in success/coupons
      // Fetched coupons from backend

      // Use provided local changes or current state
      const changesToApply = currentLocalChanges || localStatusChanges;

      // Merge local status changes and edit changes with fetched data
      const mergedCoupons = coupons.map(coupon => {
        const statusChange =
          changesToApply[coupon.couponId] || coupon.status || 'pending';
        const editChange = editChanges[coupon.couponId];

        return {
          ...coupon,
          status: statusChange,
          // Apply edit changes if they exist
          ...(editChange && {
            couponCode: editChange.couponCode,
            price: editChange.price,
            expireDate: editChange.expireDate,
            description: editChange.description,
          }),
        };
      });

      // Applied local status changes

      setCoupons(mergedCoupons);
    } catch (error) {
      Alert.alert('Error', 'Failed to load coupons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/categories',
      );
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/brands',
      );
      const data = await response.json();
      if (data.success) {
        // Filter out the flights brand from the brands list
        const filteredBrands = data.brands.filter(
          brand =>
            brand.brandName && brand.brandName.toLowerCase() !== 'flights',
        );
        setBrands(filteredBrands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoupons(localStatusChanges);
  };

  const handleStatusUpdate = async (couponId, status, price = null) => {
    try {
      // Prevent multiple rapid clicks
      if (updatingStatus[couponId]) {
        return;
      }

      // Check if coupon is already processed
      const currentCoupon = coupons.find(c => c.couponId === couponId);
      const currentStatus =
        currentCoupon?.status || currentCoupon?.couponStatus || 'pending';
      if (currentStatus === 'approved' || currentStatus === 'rejected') {
        Alert.alert(
          'Already Processed',
          `This coupon is already ${currentStatus}`,
        );
        return;
      }

      // Set loading state for this specific coupon
      setUpdatingStatus(prev => ({ ...prev, [couponId]: true }));

      // Add a timeout to prevent permanent loading state
      const timeoutId = setTimeout(() => {
        setUpdatingStatus(prev => ({ ...prev, [couponId]: false }));
        Alert.alert('Timeout', 'Request timed out. Please try again.');
      }, 30000); // 30 second timeout

      // Status update using the correct API endpoint
      // PUT /coupons/update-status?couponId=xxx&status=xxx
      const queryParams = new URLSearchParams({
        couponId: couponId,
        status: status,
      });

      // Test if the API is reachable (optional debugging)
      if (__DEV__) {
        try {
          const testResponse = await fetch(
            'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
            {
              method: 'GET',
            },
          );
        } catch (testError) {
          // API reachability test failed
        }
      }

      const response = await fetch(
        `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons/update-status?${queryParams}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Parse response data
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // Response parsing failed, treating as success if status is ok
        data = { success: response.ok };
      }

      if (response.ok) {
        const updatedLocalChanges = {
          ...localStatusChanges,
          [couponId]: status,
        };
        setLocalStatusChanges(updatedLocalChanges);
        await saveLocalStatusChanges(updatedLocalChanges);

        setCoupons(prevCoupons => {
          const updatedCoupons = prevCoupons.map(coupon =>
            coupon.couponId === couponId
              ? { ...coupon, status: status }
              : coupon,
          );
          // Updated coupon status
          return updatedCoupons;
        });

        // Show success message with status
        Alert.alert(
          'Status Updated',
          `Coupon has been ${status} successfully!`,
          [{ text: 'OK' }],
        );

        // Note: Removed fetchCoupons() to prevent reverting the status change
        // The local state update should be sufficient for UI consistency
      } else {
        Alert.alert(
          'Error',
          data.message || `Failed to update status: ${response.status}`,
        );
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert('Error', 'Request timeout. Please try again.');
      } else {
        Alert.alert(
          'Error',
          `Failed to update coupon status: ${error.message}`,
        );
      }
    } finally {
      // Clear loading state
      setUpdatingStatus(prev => ({ ...prev, [couponId]: false }));
    }
  };

  const handleEdit = coupon => {
    setSelectedCoupon(coupon);

    // Only initialize fields that are actually editable based on backend API
    const initialEditData = {
      couponCode: coupon.couponCode || '',
      price: coupon.price || 0,
      expireDate: coupon.expireDate || '',
      description: coupon.description || '',
    };

    setEditData(initialEditData);
    setShowEditModal(true);

    // Force a check for unsaved changes after setting the data
    setTimeout(() => {
      const hasChanges = checkForUnsavedChanges();
      setHasUnsavedChanges(hasChanges);
    }, 100);
  };

  const resetEditForm = () => {
    setEditData({});
    setSelectedCoupon(null);
    setShowEditModal(false);
    setHasUnsavedChanges(false);
    // Don't clear editChanges here as they should persist after saving
  };

  const clearEditChanges = (couponId = null) => {
    if (couponId) {
      // Clear specific coupon's edit changes
      setEditChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[couponId];
        return newChanges;
      });
    } else {
      // Clear all edit changes
      setEditChanges({});
    }
  };

  const checkForUnsavedChanges = () => {
    if (!selectedCoupon) return false;

    // Convert values to strings for comparison to handle type mismatches
    const normalizeValue = value => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    // Only check fields that are actually editable based on backend API
    const hasChanges =
      normalizeValue(editData.couponCode) !==
        normalizeValue(selectedCoupon.couponCode) ||
      normalizeValue(editData.price) !== normalizeValue(selectedCoupon.price) ||
      normalizeValue(editData.expireDate) !==
        normalizeValue(selectedCoupon.expireDate) ||
      normalizeValue(editData.description) !==
        normalizeValue(selectedCoupon.description);

    return hasChanges;
  };

  // Update unsaved changes state whenever editData changes
  useEffect(() => {
    if (selectedCoupon) {
      setHasUnsavedChanges(checkForUnsavedChanges());
    }
  }, [editData, selectedCoupon]);

  const handleCancelEdit = () => {
    // Check if there are any unsaved changes
    const hasChanges = checkForUnsavedChanges();

    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Continue Editing', style: 'cancel' },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: resetEditForm,
          },
        ],
      );
    } else {
      resetEditForm();
    }
  };

  const handleSaveEdit = async () => {
    // Check if save button should be disabled
    if (!hasUnsavedChanges) {
      setAlert({
        visible: true,
        message: 'No changes detected. Please modify at least one field.',
        type: 'error',
      });
      return;
    }

    try {
      // Validate required fields
      if (!editData.couponCode || !editData.couponCode.trim()) {
        setAlert({
          visible: true,
          message: 'Coupon code is required',
          type: 'error',
        });
        return;
      }

      if (!editData.price || editData.price <= 0) {
        setAlert({
          visible: true,
          message: 'Price must be greater than 0',
          type: 'error',
        });
        return;
      }

      if (!editData.expireDate) {
        setAlert({
          visible: true,
          message: 'Expiry date is required',
          type: 'error',
        });
        return;
      }

      // Update payload aligned with backend API structure
      // Only send fields that are actually being updated
      const updatePayload = {};

      if (
        editData.couponCode &&
        editData.couponCode.trim() !== selectedCoupon.couponCode
      ) {
        updatePayload.couponCode = editData.couponCode.trim();
      }

      if (editData.price !== selectedCoupon.price) {
        updatePayload.price = parseFloat(editData.price);
      }

      if (editData.expireDate !== selectedCoupon.expireDate) {
        updatePayload.expireDate = editData.expireDate;
      }

      // For optional fields, include them if they've changed (including being cleared)
      if (editData.description !== selectedCoupon.description) {
        updatePayload.description = editData.description;
      }

      // Check if we have any fields to update
      if (Object.keys(updatePayload).length === 0) {
        setAlert({
          visible: true,
          message: 'No changes detected. Please modify at least one field.',
          type: 'error',
        });
        return;
      }

      // Validate and clean the payload to prevent 500 errors
      const cleanedPayload = {};

      // Ensure all string fields are properly trimmed and not empty
      if (updatePayload.couponCode) {
        cleanedPayload.couponCode = updatePayload.couponCode.trim();
      }

      if (updatePayload.description !== undefined) {
        cleanedPayload.description = updatePayload.description
          ? updatePayload.description.trim()
          : '';
      }

      // Ensure numeric fields are properly formatted
      if (updatePayload.price !== undefined) {
        cleanedPayload.price = parseFloat(updatePayload.price) || 0;
      }

      // Ensure date field is properly formatted
      if (updatePayload.expireDate) {
        cleanedPayload.expireDate = updatePayload.expireDate.trim();
      }

      // Test API connectivity first
      try {
        const testResponse = await fetch(
          `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons/${selectedCoupon.couponId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (!testResponse.ok) {
          throw new Error(
            `API endpoint not accessible. Status: ${testResponse.status}`,
          );
        }
      } catch (testError) {
        throw new Error(`Cannot connect to server: ${testError.message}`);
      }

      const response = await fetch(
        `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons/${selectedCoupon.couponId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedPayload),
        },
      );

      // Always try to get response data for debugging
      let responseData;
      try {
        const responseText = await response.text();

        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (parseError) {
        responseData = null;
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails = '';

        if (responseData) {
          errorMessage =
            responseData.message || responseData.error || errorMessage;
          errorDetails = JSON.stringify(responseData, null, 2);
        }

        // Provide more specific error messages based on status code
        let userFriendlyMessage = '';
        switch (response.status) {
          case 400:
            userFriendlyMessage =
              'Invalid data provided. Please check your input and try again.';
            break;
          case 401:
            userFriendlyMessage =
              'Authentication required. Please log in again.';
            break;
          case 403:
            userFriendlyMessage =
              'You do not have permission to edit this coupon.';
            break;
          case 404:
            userFriendlyMessage = 'Coupon not found. It may have been deleted.';
            break;
          case 413:
            userFriendlyMessage =
              'Data too large. Please reduce the content size.';
            break;
          case 500:
            userFriendlyMessage = 'Server error. Please try again later.';
            break;
          default:
            userFriendlyMessage = `Server error (${response.status}). Please try again.`;
        }

        throw new Error(
          `${userFriendlyMessage}\n\nTechnical Details: ${errorMessage}\n\nError Details:\n${errorDetails}`,
        );
      }

      // Success case - even if no response data

      // Edit successful

      // Update local state immediately for better UX
      setCoupons(prevCoupons => {
        const updatedCoupons = prevCoupons.map(coupon =>
          coupon.couponId === selectedCoupon.couponId
            ? {
                ...coupon,
                couponCode: editData.couponCode.trim(),
                price: parseFloat(editData.price),
                expireDate: editData.expireDate,
                description: editData.description,
              }
            : coupon,
        );
        return updatedCoupons;
      });

      // Store edit changes to preserve them
      const newEditChanges = {
        ...editChanges,
        [selectedCoupon.couponId]: {
          couponCode: editData.couponCode.trim(),
          price: parseFloat(editData.price),
          expireDate: editData.expireDate,
          description: editData.description,
        },
      };
      setEditChanges(newEditChanges);

      setAlert({
        visible: true,
        message: 'Coupon updated successfully',
        type: 'success',
      });

      // Close modal immediately after successful save
      resetEditForm();
      clearEditChanges(selectedCoupon.couponId);

      // Force a re-render to ensure UI updates
      setTimeout(() => {
        setCoupons(prevCoupons => [...prevCoupons]);
      }, 50);
    } catch (error) {
      // Provide more specific error messages
      let userMessage = 'Edit failed. Please try again.';

      if (error.message.includes('Network request failed')) {
        userMessage =
          'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('Cannot connect to server')) {
        userMessage =
          'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Invalid data')) {
        userMessage = 'Invalid data provided. Please check your input.';
      } else if (error.message.includes('Server error')) {
        userMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Authentication required')) {
        userMessage = 'Authentication required. Please log in again.';
      } else if (error.message.includes('permission')) {
        userMessage = 'You do not have permission to edit this coupon.';
      } else if (error.message.includes('not found')) {
        userMessage = 'Coupon not found. It may have been deleted.';
      } else {
        userMessage = `Edit failed: ${error.message}`;
      }

      setAlert({
        visible: true,
        message: `${userMessage}\n\nPlease try again or contact support if the problem persists.`,
        type: 'error',
      });

      // Don't reset the form on error so user can retry
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (filter === 'all') return true;
    const status = coupon.status || coupon.couponStatus || 'pending';
    return status === filter;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const CouponCard = ({ coupon }) => {
    // Handle different possible status field names
    const status = coupon.status || coupon.couponStatus || 'pending';
    const isProcessed = status === 'approved' || status === 'rejected';

    return (
      <View
        style={[styles.couponCard, isProcessed && styles.processedCouponCard]}
      >
        <View style={styles.couponHeader}>
          <Text style={styles.couponTitle}>
            {coupon.couponCode || 'Coupon'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
            {updatingStatus[coupon.couponId] && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginLeft: 5 }}
              />
            )}
          </View>
        </View>

        <Text
          style={[
            styles.couponDescription,
            isProcessed && styles.processedText,
          ]}
        >
          Coupon Code: {coupon.couponCode || 'N/A'}
        </Text>

        {coupon.description && (
          <Text
            style={[
              styles.couponDescription,
              isProcessed && styles.processedText,
            ]}
          >
            Description: {coupon.description}
          </Text>
        )}

        <View style={styles.priceContainer}>
          <Text
            style={[styles.originalPrice, isProcessed && styles.processedText]}
          >
            ₹{coupon.price || 0}
          </Text>
        </View>

        <View style={styles.couponDetails}>
          <Text
            style={[styles.detailText, isProcessed && styles.processedText]}
          >
            User ID: {coupon.userId || 'N/A'}
          </Text>
          <Text
            style={[styles.detailText, isProcessed && styles.processedText]}
          >
            Brand ID: {coupon.brandId || 'N/A'}
          </Text>
          <Text
            style={[styles.detailText, isProcessed && styles.processedText]}
          >
            Price: ₹{coupon.price || 0}
          </Text>
          <Text
            style={[styles.detailText, isProcessed && styles.processedText]}
          >
            Expires:{' '}
            {coupon.expireDate
              ? new Date(coupon.expireDate).toLocaleDateString()
              : 'N/A'}
          </Text>
          {isProcessed && (
            <Text style={[styles.detailText, styles.statusIndicator]}>
              Status: {status.toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          {/* Show approve/reject buttons for coupons that are not already approved or rejected */}
          {status !== 'approved' && status !== 'rejected' && (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.approveButton,
                  updatingStatus[coupon.couponId] && styles.disabledButton,
                ]}
                onPress={() => handleStatusUpdate(coupon.couponId, 'approved')}
                disabled={updatingStatus[coupon.couponId]}
              >
                <Text style={styles.actionButtonText}>
                  {updatingStatus[coupon.couponId] ? 'Updating...' : 'Approve'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.rejectButton,
                  updatingStatus[coupon.couponId] && styles.disabledButton,
                ]}
                onPress={() => {
                  Alert.alert(
                    'Reject Coupon',
                    'Are you sure you want to reject this coupon?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reject',
                        style: 'destructive',
                        onPress: () =>
                          handleStatusUpdate(coupon.couponId, 'rejected'),
                      },
                    ],
                  );
                }}
                disabled={updatingStatus[coupon.couponId]}
              >
                <Text style={styles.actionButtonText}>
                  {updatingStatus[coupon.couponId] ? 'Updating...' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              updatingStatus[coupon.couponId] && styles.disabledButton,
            ]}
            onPress={() => handleEdit(coupon)}
            disabled={updatingStatus[coupon.couponId]}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={styles.loadingText}>Loading Coupons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupon Management</Text>
        <TouchableOpacity onPress={resetStuckStates}>
          <Text style={styles.resetButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <TouchableOpacity
          style={styles.filterPicker}
          onPress={() => setShowFilterDropdown(true)}
        >
          <Text style={styles.filterPickerText}>
            {filter === 'all'
              ? 'All Coupons'
              : filter === 'pending'
              ? 'Pending'
              : filter === 'approved'
              ? 'Approved'
              : filter === 'rejected'
              ? 'Rejected'
              : 'All Coupons'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Filter Dropdown Modal */}
      <Modal
        visible={showFilterDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                filter === 'all' && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                setFilter('all');
                setShowFilterDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  filter === 'all' && styles.dropdownItemTextSelected,
                ]}
              >
                All Coupons
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                filter === 'pending' && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                setFilter('pending');
                setShowFilterDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  filter === 'pending' && styles.dropdownItemTextSelected,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                filter === 'approved' && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                setFilter('approved');
                setShowFilterDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  filter === 'approved' && styles.dropdownItemTextSelected,
                ]}
              >
                Approved
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                filter === 'rejected' && styles.dropdownItemSelected,
              ]}
              onPress={() => {
                setFilter('rejected');
                setShowFilterDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  filter === 'rejected' && styles.dropdownItemTextSelected,
                ]}
              >
                Rejected
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Auto Dismiss Alert */}
      <AutoDismissAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onDismiss={() =>
          setAlert({ visible: false, message: '', type: 'success' })
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          showEditModal ? null : (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          )
        }
      >
        {filteredCoupons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No coupons found</Text>
          </View>
        ) : (
          filteredCoupons.map(coupon => (
            <CouponCard key={coupon.couponId} coupon={coupon} />
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  hasUnsavedChanges && styles.modalTitleWithChanges,
                ]}
              >
                Edit Coupon {hasUnsavedChanges && '•'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* User Information Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>User Information</Text>
                <TextInput
                  style={[styles.modalInput, styles.readOnlyInput]}
                  placeholder="User ID"
                  value={selectedCoupon?.userId || 'N/A'}
                  editable={false}
                />
              </View>

              {/* Coupon Details Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Coupon Details</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Coupon Code *"
                  value={editData.couponCode}
                  onChangeText={text =>
                    setEditData(prev => ({ ...prev, couponCode: text }))
                  }
                />

                <TextInput
                  style={[styles.modalInput, styles.readOnlyInput]}
                  placeholder="Coupon ID (Read-only)"
                  value={selectedCoupon?.couponId || 'N/A'}
                  editable={false}
                />

                <TextInput
                  style={[styles.modalInput, styles.multilineInput]}
                  placeholder="Description"
                  value={editData.description}
                  onChangeText={text =>
                    setEditData(prev => ({ ...prev, description: text }))
                  }
                  multiline={true}
                  numberOfLines={3}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="Price (₹) *"
                  value={editData.price ? editData.price.toString() : ''}
                  onChangeText={text =>
                    setEditData(prev => ({
                      ...prev,
                      price: parseFloat(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />

                <TextInput
                  style={[styles.modalInput, styles.readOnlyInput]}
                  placeholder="Category Name (Read-only)"
                  value={selectedCoupon?.categoryName || 'N/A'}
                  editable={false}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="Expiry Date (YYYY-MM-DD) *"
                  value={editData.expireDate}
                  onChangeText={text =>
                    setEditData(prev => ({ ...prev, expireDate: text }))
                  }
                />
              </View>

              {/* Brand & Category Information Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Brand & Category</Text>
                <TextInput
                  style={[styles.modalInput, styles.readOnlyInput]}
                  placeholder="Brand ID (Read-only)"
                  value={selectedCoupon?.brandId || 'N/A'}
                  editable={false}
                />
                <TextInput
                  style={[styles.modalInput, styles.readOnlyInput]}
                  placeholder="Category Name (Read-only)"
                  value={selectedCoupon?.categoryName || 'N/A'}
                  editable={false}
                />
              </View>

              {/* Image Information Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  Terms & Conditions Image
                </Text>
                {hasValidImageData(selectedCoupon?.termsAndConditionImage) ? (
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Uploaded Image:</Text>

                    {/* Debug: Log the image data */}
                    {selectedCoupon &&
                      (() => {
                        console.log('=== IMAGE DEBUG START ===');
                        console.log('Coupon ID:', selectedCoupon.couponId);
                        console.log(
                          'Raw termsAndConditionImage:',
                          selectedCoupon.termsAndConditionImage,
                        );
                        console.log(
                          'Image data type:',
                          typeof selectedCoupon.termsAndConditionImage,
                        );
                        console.log(
                          'Image data length:',
                          selectedCoupon.termsAndConditionImage
                            ? selectedCoupon.termsAndConditionImage.length
                            : 'null',
                        );
                        console.log(
                          'Image starts with data:',
                          selectedCoupon.termsAndConditionImage
                            ? selectedCoupon.termsAndConditionImage.substring(
                                0,
                                50,
                              )
                            : 'null',
                        );
                        console.log(
                          'screenshot' + selectedCoupon.termsAndConditionImage,
                        );

                        // Enhanced debugging and validation
                        const imageData = selectedCoupon.termsAndConditionImage;

                        // 1. Log the raw image data
                        console.log(
                          '🔍 Raw image data length:',
                          imageData ? imageData.length : 'null',
                        );
                        console.log(
                          '🔍 Raw image data starts with:',
                          imageData ? imageData.substring(0, 100) : 'null',
                        );

                        // 2. Validate base64 format
                        function isValidBase64Image(data) {
                          return (
                            typeof data === 'string' &&
                            (data.startsWith('data:image/jpeg;base64,') ||
                              data.startsWith('data:image/png;base64,')) &&
                            data.length > 1000 // prevent tiny/invalid blobs
                          );
                        }

                        const isValidBase64 = isValidBase64Image(imageData);
                        console.log('✅ Is valid base64 image:', isValidBase64);

                        // 3. Check for common issues
                        if (imageData) {
                          if (!imageData.includes('base64,')) {
                            console.warn(
                              '⚠️ Possibly invalid base64 string. Missing prefix.',
                            );
                          }
                          if (imageData.length < 1000) {
                            console.warn(
                              '⚠️ Base64 data seems too small:',
                              imageData.length,
                            );
                          }
                          if (imageData.length > 1000000) {
                            console.warn(
                              '⚠️ Base64 data is very large:',
                              Math.round(imageData.length / 1024),
                              'KB',
                            );
                          }
                        }

                        console.log('=== IMAGE DEBUG END ===');
                        return null;
                      })()}

                    <Image
                      source={{
                        uri: (() => {
                          const imageData =
                            selectedCoupon.termsAndConditionImage;

                          // 1. Check if it's an S3 URL (new format)
                          if (imageData && typeof imageData === 'string') {
                            if (
                              imageData.startsWith('http://') ||
                              imageData.startsWith('https://')
                            ) {
                              console.log('✅ Using S3 URL:', imageData);
                              return imageData;
                            }

                            // 2. Check if it's a data URL (legacy format)
                            if (imageData.startsWith('data:')) {
                              console.log('✅ Using legacy data URL');
                              return imageData;
                            }
                          }

                          // 3. Fallback to placeholder
                          console.log(
                            '❌ No valid image data, using placeholder',
                          );
                          return 'https://via.placeholder.com/400x200?text=Terms+%26+Conditions+Not+Available';
                        })(),
                      }}
                      style={styles.couponImage}
                      resizeMode="contain"
                      onError={({ nativeEvent }) => {
                        console.error(
                          '❌ Error loading image for coupon:',
                          selectedCoupon.couponId,
                        );
                        console.error('Error details:', nativeEvent?.error);
                        console.error('Error code:', nativeEvent?.code);
                        console.error(
                          'Error description:',
                          nativeEvent?.description,
                        );

                        // Log the URI that failed
                        console.error(
                          'Failed URI:',
                          selectedCoupon.termsAndConditionImage,
                        );
                      }}
                      onLoad={() => {
                        console.log(
                          '✅ SUCCESS: Image loaded successfully for coupon:',
                          selectedCoupon.couponId,
                        );
                      }}
                      onLoadStart={() => {
                        console.log(
                          '🔄 STARTING: Image load started for coupon:',
                          selectedCoupon.couponId,
                        );
                      }}
                    />
                  </View>
                ) : (
                  <View>
                    <Text style={styles.noImageText}>No image uploaded</Text>
                    {/* Debug: Log why image is not valid */}
                    {selectedCoupon &&
                      (() => {
                        console.log('=== NO IMAGE DEBUG ===');
                        console.log('Coupon ID:', selectedCoupon.couponId);
                        console.log(
                          'termsAndConditionImage exists:',
                          !!selectedCoupon.termsAndConditionImage,
                        );
                        console.log(
                          'termsAndConditionImage value:',
                          selectedCoupon.termsAndConditionImage,
                        );
                        console.log(
                          'hasValidImageData result:',
                          hasValidImageData(
                            selectedCoupon?.termsAndConditionImage,
                          ),
                        );
                        console.log('=== NO IMAGE DEBUG END ===');
                        return null;
                      })()}
                  </View>
                )}
              </View>

              {/* Status Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Current Status:</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color: getStatusColor(
                          selectedCoupon?.status ||
                            selectedCoupon?.couponStatus ||
                            'pending',
                        ),
                      },
                    ]}
                  >
                    {(
                      selectedCoupon?.status ||
                      selectedCoupon?.couponStatus ||
                      'pending'
                    ).toUpperCase()}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  !hasUnsavedChanges && styles.disabledButton,
                ]}
                onPress={handleSaveEdit}
                disabled={!hasUnsavedChanges}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    !hasUnsavedChanges && styles.disabledButtonText,
                  ]}
                >
                  {hasUnsavedChanges ? 'Save' : 'No Changes'}
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  resetButton: {
    fontSize: 20,
    color: '#333',
    paddingHorizontal: 10,
  },
  placeholder: {
    width: 24,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  filterPicker: {
    height: 50,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  filterPickerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginBottom: 2,
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  couponDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  processedCouponCard: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8',
  },
  processedText: {
    color: '#999',
  },
  statusIndicator: {
    fontWeight: 'bold',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalTitleWithChanges: {
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#B71C1C',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    fontWeight: 'bold',
  },

  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  readOnlyInput: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 10,
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  couponImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  noImageText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  disabledButtonText: {
    color: '#999',
  },
});
