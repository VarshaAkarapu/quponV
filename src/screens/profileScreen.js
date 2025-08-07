import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { TEXT_STYLES } from '../config/fontConfig';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, couponAPI } from '../services/apiService';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { currentUser: authUser, isAdmin, userData: authUserData, signOut, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('uploaded');
  const [uploadedCoupons, setUploadedCoupons] = useState([]);
  const [purchasedCoupons, setPurchasedCoupons] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (authUserData) {
        setUserData(authUserData);
        setCurrentUser(authUser);
      } else {
        checkCurrentUser();
        loadUserData();
      }
      loadPurchasedCoupons();
    }
  }, [authUserData, authUser, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'uploaded' && isAuthenticated) {
      loadUploadedCoupons();
    }
  }, [activeTab, isAuthenticated]);

  const checkCurrentUser = () => {
    const user = auth().currentUser;
    setCurrentUser(user);
  };

  const loadUserData = async () => {
    try {
      setLoading(true);

      if (authUserData) {
        setUserData(authUserData);
        setCurrentUser(authUser);
        setLoading(false);
        return;
      }

      const user = authUser || auth().currentUser;

      if (user) {
        setCurrentUser(user);
        const phone = user.phoneNumber?.replace('+91', '') || '';

        try {
          // First try to get user data from backend
          console.log('🔍 Fetching user data from backend for phone:', phone);

          const idToken = await user.getIdToken();
          const response = await fetch(
            'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/phone',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({ phone }),
            },
          );

          if (response.ok) {
            const userDataFromBackend = await response.json();
            console.log('🔍 User data from backend:', userDataFromBackend);

            if (userDataFromBackend.user) {
              setUserData(userDataFromBackend.user);
              setLoading(false);
              return;
            }
          } else {
            console.log('🔍 Backend returned status:', response.status);
          }
        } catch (backendError) {
          console.log(
            '🔍 Backend fetch failed, trying local storage:',
            backendError,
          );
        }

        // Fallback to local storage
        try {
          const localUserData = await AsyncStorage.getItem(`user_${phone}`);
          if (localUserData) {
            const parsedData = JSON.parse(localUserData);
            setUserData(parsedData);
            setLoading(false);
            return;
          }
        } catch (localError) {
          console.log('🔍 No local user data found');
        }

        // Default user data if nothing found
        const basicUserData = {
          userId: user.uid,
          phoneNumber: user.phoneNumber,
          firstName: 'User',
          lastName: '',
          email: '',
          isProfileCompleted: false,
          isAdmin: isAdmin,
        };

        setUserData(basicUserData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUploadedCoupons = async () => {
    try {
      const user = currentUser || auth().currentUser;
      if (!user) return;

      // Try to get the backend user ID from user data first
      let userId = user.uid; // Default to Firebase UID

      // If we have userData with a backend userId, use that
      if (userData && userData.userId) {
        userId = userData.userId;
      }

      console.log('🔍 Loading uploaded coupons for user:', userId);

      const uploadedCoupons = await couponAPI.getByUser(userId);
      console.log('🔍 Uploaded coupons loaded:', uploadedCoupons?.length || 0);
      setUploadedCoupons(uploadedCoupons || []);
    } catch (error) {
      console.error('Error loading uploaded coupons:', error);
      // Don't throw error, just set empty array
      setUploadedCoupons([]);
    }
  };

  const loadPurchasedCoupons = async () => {
    try {
      const user = currentUser || auth().currentUser;
      if (!user) return;

      // Try to get the backend user ID from user data first
      let userId = user.uid; // Default to Firebase UID

      // If we have userData with a backend userId, use that
      if (userData && userData.userId) {
        userId = userData.userId;
      }

      console.log('🔍 Loading purchased coupons for user:', userId);

      const purchasedCoupons = await couponAPI.getByUser(userId);
      console.log(
        '🔍 Purchased coupons loaded:',
        purchasedCoupons?.length || 0,
      );
      setPurchasedCoupons(purchasedCoupons || []);
    } catch (error) {
      console.error('Error loading purchased coupons:', error);
      // Don't throw error, just set empty array
      setPurchasedCoupons([]);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadUserData(),
        loadUploadedCoupons(),
        loadPurchasedCoupons(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateUserLevel = () => {
    const totalCoupons = uploadedCoupons.length + purchasedCoupons.length;

    if (totalCoupons >= 67) {
      return { level: 3, name: 'Inferno', uploadLimit: 13, discount: '1.5-2%' };
    } else if (totalCoupons >= 30) {
      return { level: 2, name: 'Blaze', uploadLimit: 10, discount: '1%' };
    } else {
      return { level: 1, name: 'Spark', uploadLimit: 7, discount: '0%' };
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            Alert.alert('Success', 'You have been logged out successfully!', [
              {
                text: 'OK',
                onPress: () => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                }),
              },
            ]);
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setEditFormData({
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      dob: userData?.dob || '',
      upi: userData?.upi || '',
    });
    setShowEditModal(true);
  };

  const handleAdminDashboardPress = () => {
    if (isAdmin) {
      navigation.navigate('AdminDashboard');
    } else {
      Alert.alert('Access Denied', 'Admin access required');
    }
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) return;

    setEditLoading(true);
    try {
      const user = currentUser || auth().currentUser;
      if (!user) throw new Error('No user found');

      const updatedProfile = await userAPI.updateProfile(
        user.uid,
        editFormData,
      );

      if (updatedProfile.success) {
        setUserData({ ...userData, ...editFormData });
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error(updatedProfile.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const validateEditForm = () => {
    if (!editFormData.firstName?.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!editFormData.email?.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    return true;
  };

  const renderCouponCard = (coupon, isPurchased = false) => (
    <View key={coupon._id} style={styles.couponCard}>
      <View style={styles.couponHeader}>
        <View style={styles.brandLogo}>
          <Text style={styles.brandInitial}>
            {coupon.brandName?.charAt(0) || 'C'}
          </Text>
        </View>
        <View style={styles.couponInfo}>
          <Text style={styles.couponBrand}>{coupon.brandName}</Text>
          <Text style={styles.couponValue}>
            ₹{coupon.originalValue} - {coupon.discountPercentage}% OFF
          </Text>
        </View>
        <View style={styles.couponStatus}>
          <Text
            style={[
              styles.statusText,
              { color: coupon.status === 'approved' ? '#4CAF50' : '#FF9800' },
            ]}
          >
            {coupon.status}
          </Text>
        </View>
      </View>
      <Text style={styles.couponDescription}>{coupon.description}</Text>
    </View>
  );

  const userLevel = calculateUserLevel();

  if (loading && isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerButtons}>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadUserData}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>
                {loading ? '⏳' : '🔄'}
              </Text>
            </TouchableOpacity>
          )}
          {isAuthenticated ? (
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {/* User Status Section */}
        {isAuthenticated ? (
          <View style={styles.userStatusSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {userData?.firstName?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userStatus}>
                {userData?.isProfileCompleted ? 'Registered' : 'Not registered'}
              </Text>
              <Text style={styles.userPhone}>
                {userData?.phoneNumber || 'No phone number'}
              </Text>
              <Text style={styles.userLevel}>
                Level {userLevel.level} • {uploadedCoupons.length} coupons
                uploaded
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.userStatusSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>👤</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userStatus}>Not Logged In</Text>
              <Text style={styles.userPhone}>
                Please login to access your profile
              </Text>
              <Text style={styles.userLevel}>
                Login to upload coupons and track your progress
              </Text>
            </View>
          </View>
        )}

        {/* Menu Items - Only show when authenticated */}
        {isAuthenticated && (
          <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('UserInformation')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Your Information</Text>
              <Text style={styles.menuItemSubtitle}>
                {userData?.isProfileCompleted ? 'Registered' : 'Not registered'}
              </Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('UploadedCoupons')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Coupons Uploaded</Text>
              <Text style={styles.menuItemSubtitle}>
                {uploadedCoupons.length} coupons
              </Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PurchasedCoupons')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Coupons Purchased</Text>
              <Text style={styles.menuItemSubtitle}>
                {purchasedCoupons.length} coupons
              </Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('UserLevel')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>User Level</Text>
              <Text style={styles.menuItemSubtitle}>
                Level {userLevel.level}
              </Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Login Option for Non-Authenticated Users */}
        {!isAuthenticated && (
          <View style={styles.loginSection}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Login</Text>
              <Text style={styles.loginSubtext}>Sign in to your account</Text>
              <Text style={styles.loginArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Admin Dashboard Button - Only show for admins */}
        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.adminSectionTitle}>Admin Access</Text>
            <TouchableOpacity
              style={styles.adminDashboardButton}
              onPress={handleAdminDashboardPress}
            >
              <Text style={styles.adminDashboardButtonText}>
                👑 Admin Dashboard
              </Text>
              <Text style={styles.adminDashboardButtonSubtext}>
                Manage coupons, users, and analytics
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.modalInput}
                placeholder="First Name"
                value={editFormData.firstName}
                onChangeText={text =>
                  setEditFormData({ ...editFormData, firstName: text })
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Last Name"
                value={editFormData.lastName}
                onChangeText={text =>
                  setEditFormData({ ...editFormData, lastName: text })
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Email"
                value={editFormData.email}
                onChangeText={text =>
                  setEditFormData({ ...editFormData, email: text })
                }
                keyboardType="email-address"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Date of Birth"
                value={editFormData.dob}
                onChangeText={text =>
                  setEditFormData({ ...editFormData, dob: text })
                }
              />
              <TextInput
                style={styles.modalInput}
                placeholder="UPI ID"
                value={editFormData.upi}
                onChangeText={text =>
                  setEditFormData({ ...editFormData, upi: text })
                }
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  editLoading && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 15,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  userStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#B71C1C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userLevel: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  loginSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  loginText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  loginSubtext: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  loginArrow: {
    fontSize: 18,
    color: '#4CAF50',
  },
  adminSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  adminSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  adminDashboardButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  adminDashboardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 5,
  },
  adminDashboardButtonSubtext: {
    fontSize: 14,
    color: '#666',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  saveButton: {
    flex: 1,
    backgroundColor: '#B71C1C',
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  couponInfo: {
    flex: 1,
  },
  couponBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  couponValue: {
    fontSize: 14,
    color: '#666',
  },
  couponStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  couponDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
