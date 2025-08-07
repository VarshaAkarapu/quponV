import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { TEXT_STYLES } from '../config/fontConfig';
import { getBrandLogo } from '../config/brandConfig';

export default function PurchaseSuccessScreen({ route, navigation }) {
  const { coupon, paymentId } = route.params || {};
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coupon || !paymentId) {
      Alert.alert('Error', 'Missing purchase information');
      navigation.replace('BrowseDeals');
      return;
    }
  }, [coupon, paymentId]);

  const handleBackToBrowse = () => {
    navigation.replace('BrowseDeals');
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  // Using centralized brand configuration
  // The getBrandLogo function is now imported from brandConfig.js

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
        <Text style={styles.loadingText}>Processing your purchase...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Purchase Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your payment has been processed successfully
        </Text>
      </View>

      {/* Coupon Card */}
      <View style={styles.couponCard}>
        <View style={styles.brandSection}>
          <Image
            source={getBrandLogo(coupon.brandName)}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{coupon.brandName}</Text>
            <Text style={styles.couponTitle}>{coupon.title}</Text>
          </View>
        </View>

        <View style={styles.couponCodeSection}>
          <Text style={styles.couponCodeLabel}>Purchase Complete!</Text>
          <View style={styles.successMessageContainer}>
            <Text style={styles.successMessageText}>
              Your coupon has been successfully purchased and added to your
              account. You can view your purchased coupons in the "My Coupons"
              section.
            </Text>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentLabel}>Payment Details:</Text>
          <Text style={styles.paymentAmount}>₹{coupon.price}</Text>
          <Text style={styles.paymentId}>Payment ID: {paymentId}</Text>
        </View>

        {coupon.termsAndConditionImage && (
          <View style={styles.termsSection}>
            <Text style={styles.termsLabel}>Terms & Conditions:</Text>
            <Image
              source={{
                uri:
                  typeof coupon.termsAndConditionImage === 'string'
                    ? coupon.termsAndConditionImage
                    : `data:${
                        coupon.termsAndConditionImage.contentType
                      };base64,${coupon.termsAndConditionImage.data.toString(
                        'base64',
                      )}`,
              }}
              style={styles.termsImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleBackToBrowse}
        >
          <Text style={styles.primaryButtonText}>Browse More Deals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('PurchasedCoupons')}
        >
          <Text style={styles.secondaryButtonText}>View My Coupons</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  successHeader: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  couponTitle: {
    fontSize: 14,
    color: '#666',
  },
  couponCodeSection: {
    marginBottom: 20,
  },
  couponCodeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },

  successMessageContainer: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  successMessageText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
  paymentInfo: {
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  paymentId: {
    fontSize: 12,
    color: '#666',
  },
  termsSection: {
    marginBottom: 20,
  },
  termsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  termsImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  actionButtons: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B71C1C',
  },
  secondaryButtonText: {
    color: '#B71C1C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
