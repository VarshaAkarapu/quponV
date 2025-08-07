import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

export default function PurchasedCouponsScreen({ navigation }) {
  const [purchasedCoupons, setPurchasedCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchasedCoupons();
  }, []);

  const fetchPurchasedCoupons = async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'User not logged in');
        navigation.goBack();
        return;
      }

      const phone = currentUser.phoneNumber?.replace('+91', '') || '';
      const purchasedData = await AsyncStorage.getItem(`purchased_${phone}`);

      if (purchasedData) {
        const coupons = JSON.parse(purchasedData);
        setPurchasedCoupons(coupons);
      } else {
        setPurchasedCoupons([]);
      }
    } catch (error) {
      console.error('Failed to fetch purchased coupons:', error);
      Alert.alert('Error', 'Failed to fetch purchased coupons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchased Coupons</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchased Coupons</Text>
        <View style={styles.placeholder} />
      </View>

      {purchasedCoupons.length > 0 ? (
        <View style={styles.content}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Purchase Statistics</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{purchasedCoupons.length}</Text>
                <Text style={styles.statLabel}>Total Purchased</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {purchasedCoupons.filter(c => c.status === 'active').length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {purchasedCoupons.filter(c => c.status === 'used').length}
                </Text>
                <Text style={styles.statLabel}>Used</Text>
              </View>
            </View>
          </View>

          {purchasedCoupons.map((coupon, index) => (
            <View key={index} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <Text style={styles.couponTitle}>
                  {coupon.title || 'Untitled Coupon'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        coupon.status === 'active' ? '#4CAF50' : '#999',
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {coupon.status === 'active' ? 'Active' : 'Used'}
                  </Text>
                </View>
              </View>

              <View style={styles.couponDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand:</Text>
                  <Text style={styles.detailValue}>
                    {coupon.brandName || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>
                    {coupon.categoryName || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Coupon Code:</Text>
                  <Text style={styles.detailValue}>
                    {coupon.couponCode || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Purchase Date:</Text>
                  <Text style={styles.detailValue}>
                    {coupon.purchasedAt
                      ? new Date(coupon.purchasedAt).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price Paid:</Text>
                  <Text style={styles.detailValue}>
                    ₹{coupon.price || 'N/A'}
                  </Text>
                </View>
              </View>

              {coupon.termsAndConditionImage && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: coupon.termsAndConditionImage }}
                    style={styles.couponImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataTitle}>No Purchased Coupons</Text>
          <Text style={styles.noDataSubtitle}>
            You haven't purchased any coupons yet. Browse through available
            coupons and start saving money!
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('BrowseDealsTab')}
          >
            <Text style={styles.browseButtonText}>
              Browse Available Coupons
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 18,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
    marginBottom: 15,
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  imageContainer: {
    alignItems: 'center',
  },
  couponImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
