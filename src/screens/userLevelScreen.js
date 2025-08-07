import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function UserLevelScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedCoupons, setUploadedCoupons] = useState([]);
  const [purchasedCoupons, setPurchasedCoupons] = useState([]);

  useEffect(() => {
    fetchUserLevelData();
  }, []);

  const fetchUserLevelData = async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'User not logged in');
        navigation.goBack();
        return;
      }

      // Fetch user information
      const userResponse = await fetch(
        `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/search?phone=${currentUser.phoneNumber}`,
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserInfo(userData);

        // Fetch uploaded coupons
        if (userData && userData._id) {
          const uploadedResponse = await fetch(
            `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons/user/${userData._id}`,
          );
          if (uploadedResponse.ok) {
            const uploadedData = await uploadedResponse.json();
            setUploadedCoupons(uploadedData);
          }
        }
      } else {
        Alert.alert('Error', 'Failed to fetch user information');
      }
    } catch (error) {
      console.error('Failed to fetch user level data:', error);
      Alert.alert('Error', 'Failed to fetch user level data');
    } finally {
      setLoading(false);
    }
  };

  const calculateUserLevel = () => {
    if (!userInfo)
      return { level: 1, name: 'Spark', uploadLimit: 7, discount: '0%' };

    const totalCoupons = uploadedCoupons.length + purchasedCoupons.length;

    if (totalCoupons >= 67) {
      return { level: 3, name: 'Inferno', uploadLimit: 13, discount: '1.5-2%' };
    } else if (totalCoupons >= 34) {
      return { level: 2, name: 'Blaze', uploadLimit: 10, discount: '1%' };
    } else {
      return { level: 1, name: 'Spark', uploadLimit: 7, discount: '0%' };
    }
  };

  const getLevelProgress = () => {
    if (!userInfo) return 0;

    const totalCoupons = uploadedCoupons.length + purchasedCoupons.length;

    if (totalCoupons >= 67) return 100;
    if (totalCoupons >= 34) return 50 + ((totalCoupons - 34) / 33) * 50;
    return (totalCoupons / 34) * 50;
  };

  const getNextLevelRequirements = () => {
    const currentLevel = calculateUserLevel();
    const totalCoupons = uploadedCoupons.length + purchasedCoupons.length;

    if (currentLevel.level === 1) {
      return { required: 34 - totalCoupons, nextLevel: 'Blaze' };
    } else if (currentLevel.level === 2) {
      return { required: 67 - totalCoupons, nextLevel: 'Inferno' };
    } else {
      return { required: 0, nextLevel: 'Max Level' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Level</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const userLevel = calculateUserLevel();
  const progress = getLevelProgress();
  const nextLevel = getNextLevelRequirements();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Level</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Current Level Card */}
        <View style={styles.levelCard}>
          <Text style={styles.levelTitle}>
            Level {userLevel.level} - {userLevel.name}
          </Text>

          <View style={styles.levelStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userLevel.uploadLimit}</Text>
              <Text style={styles.statLabel}>Upload Limit/day</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userLevel.discount}</Text>
              <Text style={styles.statLabel}>Buyer Discount</Text>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Level Progress</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.progressText}>
            {Math.round(progress)}% Complete
          </Text>

          {nextLevel.required > 0 ? (
            <Text style={styles.nextLevelText}>
              {nextLevel.required} more coupons needed for {nextLevel.nextLevel}
            </Text>
          ) : (
            <Text style={styles.maxLevelText}>
              You've reached the maximum level!
            </Text>
          )}
        </View>

        {/* Coupon Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Coupon Statistics</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{uploadedCoupons.length}</Text>
              <Text style={styles.statLabel}>Uploaded</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{purchasedCoupons.length}</Text>
              <Text style={styles.statLabel}>Purchased</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {uploadedCoupons.length + purchasedCoupons.length}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Level Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Level Benefits</Text>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitTitle}>Spark (Level 1)</Text>
            <Text style={styles.benefitDesc}>
              • Upload up to 7 coupons per day
            </Text>
            <Text style={styles.benefitDesc}>• No buyer discount</Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitTitle}>Blaze (Level 2)</Text>
            <Text style={styles.benefitDesc}>
              • Upload up to 10 coupons per day
            </Text>
            <Text style={styles.benefitDesc}>
              • 1% buyer discount on purchases
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitTitle}>Inferno (Level 3)</Text>
            <Text style={styles.benefitDesc}>
              • Upload up to 13 coupons per day
            </Text>
            <Text style={styles.benefitDesc}>
              • 1.5-2% buyer discount on purchases
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('UploadCouponTab')}
          >
            <Text style={styles.actionButtonText}>Upload Coupon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('BrowseDealsTab')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Browse Coupons
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  levelCard: {
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
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B71C1C',
    textAlign: 'center',
    marginBottom: 20,
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  progressCard: {
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
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#B71C1C',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  nextLevelText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  maxLevelText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: 'bold',
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
  benefitsCard: {
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
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  benefitItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 5,
  },
  benefitDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#B71C1C',
  },
  secondaryButtonText: {
    color: '#B71C1C',
  },
});
