import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminAnalytics({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [localStatusChanges, setLocalStatusChanges] = useState({});
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalCoupons: 0,
    pendingCoupons: 0,
    approvedCoupons: 0,
    rejectedCoupons: 0,
    categoryStats: [],
    brandStats: [],
    recentActivity: [],
  });

  useEffect(() => {
    loadLocalStatusChanges();
    fetchAnalytics();
  }, []);

  // Add focus listener to reload data when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('AdminAnalytics screen focused - reloading data');
      await loadLocalStatusChanges();
      fetchAnalytics();
    });

    return unsubscribe;
  }, [navigation]);

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

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersResponse = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users',
      );
      const users = await usersResponse.json();

      // Fetch coupons
      const couponsResponse = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
      );
      const coupons = await couponsResponse.json();

      // Fetch categories
      const categoriesResponse = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/categories',
      );
      const categories = await categoriesResponse.json();

      // Fetch brands
      const brandsResponse = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/brands',
      );
      const brandsData = await brandsResponse.json();
      // Filter out the flights brand from the brands list
      const brands = brandsData.filter(brand => 
        brand.brandName && brand.brandName.toLowerCase() !== 'flights'
      );

      // Merge local status changes with fetched data
      const mergedCoupons = coupons.map(coupon => ({
        ...coupon,
        status:
          localStatusChanges[coupon.couponId] || coupon.status || 'pending',
      }));

      // Calculate statistics
      const pendingCoupons = mergedCoupons.filter(c => c.status === 'pending');
      const approvedCoupons = mergedCoupons.filter(
        c => c.status === 'approved',
      );
      const rejectedCoupons = mergedCoupons.filter(
        c => c.status === 'rejected',
      );

      // Category statistics
      const categoryStats = categories.map(category => {
        const categoryCoupons = mergedCoupons.filter(
          c => c.categoryName === category.name,
        );
        return {
          name: category.name,
          total: categoryCoupons.length,
          approved: categoryCoupons.filter(c => c.status === 'approved').length,
          pending: categoryCoupons.filter(c => c.status === 'pending').length,
        };
      });

      // Brand statistics
      const brandStats = brands.map(brand => {
        const brandCoupons = mergedCoupons.filter(
          c => c.brandName === brand.brandName,
        );
        return {
          name: brand.brandName,
          total: brandCoupons.length,
          approved: brandCoupons.filter(c => c.status === 'approved').length,
          pending: brandCoupons.filter(c => c.status === 'pending').length,
        };
      });

      // Recent activity (last 10 coupons)
      const recentActivity = mergedCoupons
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setAnalytics({
        totalUsers: users.length,
        totalCoupons: coupons.length,
        pendingCoupons: pendingCoupons.length,
        approvedCoupons: approvedCoupons.length,
        rejectedCoupons: rejectedCoupons.length,
        categoryStats,
        brandStats,
        recentActivity,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      Alert.alert('Error', 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title, value, subtitle, color = '#B71C1C') => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderCategoryStat = category => (
    <View key={category.name} style={styles.categoryStat}>
      <Text style={styles.categoryName}>{category.name}</Text>
      <View style={styles.categoryNumbers}>
        <Text style={styles.categoryTotal}>Total: {category.total}</Text>
        <Text style={styles.categoryApproved}>
          Approved: {category.approved}
        </Text>
        <Text style={styles.categoryPending}>Pending: {category.pending}</Text>
      </View>
    </View>
  );

  const renderRecentActivity = activity => (
    <View key={activity.couponId} style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityBrand}>
          {activity.brandName || 'Unknown Brand'}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(activity.status) },
          ]}
        >
          <Text style={styles.statusText}>{activity.status}</Text>
        </View>
      </View>
      <Text style={styles.activityTitle}>{activity.title || 'No Title'}</Text>
      <Text style={styles.activityDate}>
        {activity.createdAt
          ? new Date(activity.createdAt).toLocaleDateString()
          : 'Unknown Date'}
      </Text>
    </View>
  );

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B71C1C" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : (
        <>
          {/* Overview Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platform Overview</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('Total Users', analytics.totalUsers)}
              {renderStatCard('Total Coupons', analytics.totalCoupons)}
              {renderStatCard(
                'Pending',
                analytics.pendingCoupons,
                'Awaiting Approval',
                '#FF9800',
              )}
              {renderStatCard(
                'Approved',
                analytics.approvedCoupons,
                'Live Coupons',
                '#4CAF50',
              )}
              {renderStatCard(
                'Rejected',
                analytics.rejectedCoupons,
                'Declined',
                '#F44336',
              )}
            </View>
          </View>

          {/* Category Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Statistics</Text>
            <View style={styles.categoryStats}>
              {analytics.categoryStats.map(renderCategoryStat)}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map(renderRecentActivity)
              ) : (
                <Text style={styles.emptyText}>No recent activity</Text>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminAddCoupon')}
              >
                <Text style={styles.actionButtonText}>Add New Coupon</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminCouponManagement')}
              >
                <Text style={styles.actionButtonText}>Manage Coupons</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
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
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  categoryStats: {
    gap: 10,
  },
  categoryStat: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryTotal: {
    fontSize: 14,
    color: '#333',
  },
  categoryApproved: {
    fontSize: 14,
    color: '#4CAF50',
  },
  categoryPending: {
    fontSize: 14,
    color: '#FF9800',
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  activityBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#B71C1C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
