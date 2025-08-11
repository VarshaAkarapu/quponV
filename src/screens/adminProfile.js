import React, { useState, useEffect, useCallback } from 'react';
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
import auth from '@react-native-firebase/auth';

export default function AdminProfile({ navigation }) {
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalUploaded: 0,
    totalPurchased: 0,
    totalRevenue: 0,
    activeCoupons: 0,
    pendingCoupons: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
    fetchAdminStats();
  }, [loadAdminData, fetchAdminStats]);

  const loadAdminData = useCallback(async () => {
    try {
      const adminData = await AsyncStorage.getItem('adminUser');
      if (adminData) {
        setAdminUser(JSON.parse(adminData));
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, []);

  const fetchAdminStats = useCallback(async () => {
    try {
      const [couponsResponse, usersResponse] = await Promise.all([
        fetch(
          'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
        ),
        fetch(
          'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users',
        ),
      ]);

      const couponsData = await couponsResponse.json();
      const usersData = await usersResponse.json();

      if (couponsData.success && usersData.success) {
        const adminCoupons = couponsData.coupons.filter(
          c => c.uploadedBy === adminUser?._id,
        );
        const uploadedCoupons = adminCoupons.filter(
          c => c.status === 'approved',
        );
        const pendingCoupons = adminCoupons.filter(c => c.status === 'pending');

        // Calculate revenue (this would need to be implemented based on your business logic)
        const totalRevenue = uploadedCoupons.reduce((sum, coupon) => {
          return sum + (coupon.discountedPrice || 0);
        }, 0);

        setStats({
          totalUploaded: adminCoupons.length,
          totalPurchased: 0, // This would need to be fetched from purchase history
          totalRevenue: totalRevenue,
          activeCoupons: uploadedCoupons.length,
          pendingCoupons: pendingCoupons.length,
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Error', 'Failed to load admin statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminUser]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminStats();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth().signOut();
            await AsyncStorage.removeItem('adminUser');
            // AppNavigator will automatically show login screen when auth state changes
          } catch (error) {
            console.error('Error logging out:', error);
          }
        },
      },
    ]);
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
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
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Admin Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarText}>
                  {adminUser?.firstName?.charAt(0) || 'A'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {adminUser?.firstName} {adminUser?.lastName}
                </Text>
                <Text style={styles.profileEmail}>{adminUser?.email}</Text>
                <Text style={styles.profilePhone}>{adminUser?.phone}</Text>
              </View>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileDetail}>
                <Text style={styles.detailLabel}>Role: </Text>Administrator
              </Text>
              <Text style={styles.profileDetail}>
                <Text style={styles.detailLabel}>Joined: </Text>
                {adminUser?.createdAt
                  ? new Date(adminUser.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Coupons Uploaded"
              value={stats.totalUploaded}
              subtitle="Total uploaded"
              color="#4CAF50"
              icon="📤"
            />
            <StatCard
              title="Active Coupons"
              value={stats.activeCoupons}
              subtitle="Currently active"
              color="#2196F3"
              icon="✅"
            />
            <StatCard
              title="Pending Review"
              value={stats.pendingCoupons}
              subtitle="Awaiting approval"
              color="#FF9800"
              icon="⏳"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue}`}
              subtitle="From coupons"
              color="#B71C1C"
              icon="💰"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <MenuCard
            title="Upload New Coupon"
            description="Add limited edition coupons"
            icon="➕"
            onPress={() => navigation.navigate('AdminUploadCoupon')}
          />

          <MenuCard
            title="Review Coupons"
            description="Approve or reject user submissions"
            icon="👀"
            onPress={() => navigation.navigate('AdminCouponManagement')}
          />

          <MenuCard
            title="Manage Users"
            description="View and manage user accounts"
            icon="👥"
            onPress={() => navigation.navigate('AdminUserManagement')}
          />

          <MenuCard
            title="View Analytics"
            description="Detailed platform statistics"
            icon="📊"
            onPress={() => navigation.navigate('AdminAnalytics')}
          />
        </View>

        {/* Account Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <MenuCard
            title="Edit Profile"
            description="Update your personal information"
            icon="✏️"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Profile editing will be available soon',
              )
            }
          />

          <MenuCard
            title="Change Password"
            description="Update your login credentials"
            icon="🔒"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Password change will be available soon',
              )
            }
          />

          <MenuCard
            title="Notification Settings"
            description="Manage your notification preferences"
            icon="🔔"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Notification settings will be available soon',
              )
            }
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
  logoutText: {
    color: '#B71C1C',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#B71C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  profileDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: '600',
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
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  actionsSection: {
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
  settingsSection: {
    padding: 20,
    paddingBottom: 40,
  },
});
