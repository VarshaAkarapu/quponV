import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard({ navigation }) {
  const {
    currentUser,
    isAdmin,
    signOut,
    debugAdminStatus,
    checkAdminStatus,
    restoreAdminStatus,
  } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoupons: 0,
    pendingCoupons: 0,
    approvedCoupons: 0,
    rejectedCoupons: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [localStatusChanges, setLocalStatusChanges] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    // Initial data loading is now handled by the auth check useEffect
  }, []);

  // Add focus listener to reload data when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (currentUser) {
        // Always check admin status when screen is focused
        const adminStatus = await checkAdminStatus();

        if (adminStatus) {
          await loadLocalStatusChanges();
          fetchStats();
        }
      }
    });

    return unsubscribe;
  }, [navigation, currentUser, checkAdminStatus]);

  // Check admin authentication on component mount
  useEffect(() => {
    if (!currentUser) {
      // Not authenticated, redirect to home

      Alert.alert('Access Denied', 'Please login to access admin features.', [
        {
          text: 'Go to Admin Login',
          onPress: () => navigation.navigate('AdminLogin'),
        },
        {
          text: 'Go Home',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            }),
        },
      ]);
      return;
    }

    if (!isAdmin) {
      // User is logged in but not admin, try to refresh admin status

      checkAdminStatus().then(adminStatus => {
        if (adminStatus) {
          // Admin status will be updated in AuthContext, which will trigger this useEffect again
        } else {
          // Try to restore admin status from stored data

          restoreAdminStatus().then(restored => {
            if (restored) {
              // Admin status will be updated in AuthContext
            } else {
              Alert.alert(
                'Access Denied',
                'Admin access required. Please use the admin login to access this section.',
                [
                  {
                    text: 'Go to Admin Login',
                    onPress: () => navigation.navigate('AdminLogin'),
                  },
                  {
                    text: 'Go Home',
                    onPress: () =>
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      }),
                  },
                ],
              );
            }
          });
        }
      });
    } else {
      // Admin is authenticated, proceed with loading data
      loadLocalStatusChanges();
      fetchStats();
    }
  }, [currentUser, isAdmin, navigation, checkAdminStatus, restoreAdminStatus]);

  // Set up real-time refresh interval
  useEffect(() => {
    if (isAdmin && currentUser) {
      // Start real-time refresh every 30 seconds
      const interval = setInterval(() => {
        loadLocalStatusChanges();
        fetchStats(false); // Don't show updating indicator for auto-refresh
      }, 30000); // 30 seconds

      setRefreshInterval(interval);

      // Cleanup interval on unmount or when admin status changes
      return () => {
        if (interval) {
          clearInterval(interval);
          setRefreshInterval(null);
        }
      };
    }
  }, [isAdmin, currentUser]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    };
  }, [refreshInterval]);

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

  const fetchStats = async (showUpdating = true) => {
    if (showUpdating) {
      setIsUpdating(true);
    }

    // Optional network connectivity tests - don't block API calls if they fail
    let networkTestsPassed = true;
    try {
      // Test 1: Basic internet connectivity

      const basicTest = await fetch('https://www.google.com', {
        method: 'GET',
      });

      // Test 2: API base connectivity

      const apiBaseTest = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api',
        {
          method: 'GET',
        },
      );
    } catch (connectivityError) {
      networkTestsPassed = false;
      // Don't block the API calls - just log the issue
    }

    // Proceed with API calls regardless of network test results
    try {
      const [usersResponse, couponsResponse] = await Promise.all([
        fetch(
          'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users',
        ),
        fetch(
          'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
        ),
      ]);

      // Check if responses are successful
      if (!usersResponse.ok) {
        console.error('❌ Users API failed:', {
          status: usersResponse.status,
          statusText: usersResponse.statusText,
          url: usersResponse.url,
        });

        // For 502 errors, provide a more helpful message
        if (usersResponse.status === 502) {
          throw new Error(
            `Users API server is temporarily unavailable (502 Bad Gateway). Please try again later.`,
          );
        }

        throw new Error(
          `Users API failed: ${usersResponse.status} ${usersResponse.statusText}`,
        );
      }
      if (!couponsResponse.ok) {
        console.error('❌ Coupons API failed:', {
          status: couponsResponse.status,
          statusText: couponsResponse.statusText,
          url: couponsResponse.url,
        });

        // For 502 errors, provide a more helpful message
        if (couponsResponse.status === 502) {
          throw new Error(
            `Coupons API server is temporarily unavailable (502 Bad Gateway). Please try again later.`,
          );
        }

        throw new Error(
          `Coupons API failed: ${couponsResponse.status} ${couponsResponse.statusText}`,
        );
      }

      const usersData = await usersResponse.json();
      const couponsData = await couponsResponse.json();

      // Handle different API response structures
      const users = usersData.success ? usersData.users : usersData;
      const coupons = couponsData.success ? couponsData.coupons : couponsData;

      // Merge local status changes with fetched data
      const mergedCoupons = coupons.map(coupon => ({
        ...coupon,
        status:
          localStatusChanges[coupon.couponId] || coupon.status || 'pending',
      }));

      // Filter coupons according to Coupon model structure
      const pendingCoupons = mergedCoupons.filter(
        c => c.status === 'not_verified',
      ).length;
      const approvedCoupons = mergedCoupons.filter(
        c => c.status === 'approved',
      ).length;
      const rejectedCoupons = mergedCoupons.filter(
        c => c.status === 'rejected',
      ).length;

      setStats({
        totalUsers: users.length,
        totalCoupons: coupons.length,
        pendingCoupons,
        approvedCoupons,
        rejectedCoupons,
        lastUpdated: new Date().toLocaleString(),
      });

      setLoading(false);
      setIsUpdating(false);
      setIsOffline(false);

      // Show warning if network tests failed but API calls succeeded
      if (!networkTestsPassed) {
      }
    } catch (error) {
      console.error('📊 Error fetching stats:', error);

      // Set loading to false
      setLoading(false);
      setIsUpdating(false);
      setIsOffline(true);

      Alert.alert(
        'Data Loading Error',
        `Failed to load admin statistics: ${error.message}\n\nThis could be due to:\n• API server issues\n• Network connectivity problems\n• Authentication issues\n\nYou can still access admin features in offline mode.`,
        [
          {
            text: 'Continue Offline',
            onPress: () => {
              // Set default stats for offline mode
              setStats({
                totalUsers: 0,
                totalCoupons: 0,
                pendingCoupons: 0,
                approvedCoupons: 0,
                rejectedCoupons: 0,
                lastUpdated: new Date().toLocaleString(),
              });
            },
          },
          {
            text: 'Retry',
            onPress: () => fetchStats(showUpdating),
          },
        ],
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(); // Use the signOut from AuthContext
            await AsyncStorage.removeItem('couponStatusChanges');
            // Navigate back to home screen after logout
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch (error) {
            console.error('Error logging out:', error);
            // Even if there's an error, still navigate to home screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        },
      },
    ]);
  };

  const StatCard = ({ title, value, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statValue}>{value}</Text>
        {isUpdating && <Text style={styles.updatingIndicator}>🔄</Text>}
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const MenuCard = ({ title, description, icon, onPress }) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {currentUser?.phoneNumber || 'Admin'}
          </Text>
          {stats.lastUpdated && (
            <Text style={styles.lastUpdatedText}>
              Last updated: {stats.lastUpdated}
              {isUpdating && ' (Updating...)'}
            </Text>
          )}
          {isOffline && (
            <Text style={styles.offlineIndicator}>
              🔴 Offline Mode - Some features may be limited
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.refreshButton,
              isUpdating && styles.refreshButtonUpdating,
            ]}
            onPress={() => {
              loadLocalStatusChanges();
              fetchStats();
            }}
            disabled={isUpdating}
          >
            <Text style={styles.refreshButtonText}>
              {isUpdating ? '🔄' : '🔄'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Approval Alert */}
        {stats.pendingCoupons > 0 && (
          <View style={styles.pendingAlert}>
            <Text style={styles.pendingAlertText}>
              ⚠️ {stats.pendingCoupons} coupon(s) waiting for approval
            </Text>
            <TouchableOpacity
              style={styles.pendingAlertButton}
              onPress={() => navigation.navigate('AdminCouponManagement')}
            >
              <Text style={styles.pendingAlertButtonText}>Review Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              color="#4CAF50"
              onPress={() => navigation.navigate('AdminUserManagement')}
            />
            <StatCard
              title="Total Coupons"
              value={stats.totalCoupons}
              color="#2196F3"
              onPress={() => navigation.navigate('AdminCouponManagement')}
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingCoupons}
              color="#FF9800"
              onPress={() => navigation.navigate('AdminCouponManagement')}
            />
            <StatCard
              title="Approved"
              value={stats.approvedCoupons}
              color="#4CAF50"
              onPress={() => navigation.navigate('AdminCouponManagement')}
            />
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <MenuCard
            title="Upload Coupon"
            description="Add new limited edition coupons"
            icon="📤"
            onPress={() => navigation.navigate('AdminUploadCoupon')}
          />

          <MenuCard
            title="Manage Coupons"
            description="Review, approve, or reject user submissions"
            icon="🎫"
            onPress={() => navigation.navigate('AdminCouponManagement')}
          />

          <MenuCard
            title="User Management"
            description="View and manage user information"
            icon="👥"
            onPress={() => navigation.navigate('AdminUserManagement')}
          />

          <MenuCard
            title="Admin Profile"
            description="View your admin statistics and data"
            icon="👤"
            onPress={() => navigation.navigate('AdminProfile')}
          />
        </View>
      </ScrollView>
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
    backgroundColor: '#B71C1C',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginTop: 4,
  },
  offlineIndicator: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  refreshButtonUpdating: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '48%',
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  updatingIndicator: {
    fontSize: 16,
    opacity: 0.7,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    padding: 20,
  },
  menuCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
  menuArrow: {
    fontSize: 18,
    color: '#B71C1C',
  },
  pendingAlert: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    margin: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingAlertText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '600',
    flex: 1,
  },
  pendingAlertButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  pendingAlertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
