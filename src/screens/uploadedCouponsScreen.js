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
import auth from '@react-native-firebase/auth';

export default function UploadedCouponsScreen({ navigation }) {
  const [uploadedCoupons, setUploadedCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    fetchUploadedCoupons();
  }, []);

  const fetchUploadedCoupons = async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'User not logged in');
        navigation.goBack();
        return;
      }

      // First get user info to get the user ID
      const userResponse = await fetch(
        `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/search?phone=${currentUser.phoneNumber}`,
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserInfo(userData);

        // Then fetch uploaded coupons using user ID
        if (userData && userData._id) {
          const couponsResponse = await fetch(
            `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons/user/${userData._id}`,
          );

          if (couponsResponse.ok) {
            const couponsData = await couponsResponse.json();
            setUploadedCoupons(couponsData);
          } else {
            console.error('Failed to fetch uploaded coupons');
          }
        }
      } else {
        Alert.alert('Error', 'Failed to fetch user information');
      }
    } catch (error) {
      console.error('Failed to fetch uploaded coupons:', error);
      Alert.alert('Error', 'Failed to fetch uploaded coupons');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Uploaded Coupons</Text>
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
        <Text style={styles.headerTitle}>Uploaded Coupons</Text>
        <View style={styles.placeholder} />
      </View>

      {uploadedCoupons.length > 0 ? (
        <View style={styles.content}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Upload Statistics</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{uploadedCoupons.length}</Text>
                <Text style={styles.statLabel}>Total Uploaded</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {uploadedCoupons.filter(c => c.status === 'approved').length}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {uploadedCoupons.filter(c => c.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {uploadedCoupons.map((coupon, index) => (
            <View key={index} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <Text style={styles.couponTitle}>
                  {coupon.title || 'Untitled Coupon'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(coupon.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(coupon.status)}
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
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>
                    {coupon.description || 'No description'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Upload Date:</Text>
                  <Text style={styles.detailValue}>
                    {coupon.createdAt
                      ? new Date(coupon.createdAt).toLocaleDateString()
                      : 'N/A'}
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
          <Text style={styles.noDataTitle}>No Uploaded Coupons</Text>
          <Text style={styles.noDataSubtitle}>
            You haven't uploaded any coupons yet. Start sharing your unused
            coupons with the community!
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('UploadCouponTab')}
          >
            <Text style={styles.uploadButtonText}>
              Upload Your First Coupon
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
  uploadButton: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
