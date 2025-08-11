import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

export default function PaymentScreen({ route, navigation }) {
  const { coupon } = route.params || {};

  console.log('💳 PaymentScreen loaded with coupon:', coupon);

  useEffect(() => {
    console.log('💳 PaymentScreen useEffect triggered');
    if (!coupon || !coupon.price) {
      console.log('💳 Invalid coupon data:', coupon);
      Alert.alert('Invalid Coupon', 'Missing coupon data');
      navigation.goBack();
      return;
    }
    // Add a small delay to show the white background before opening Razorpay
    const timer = setTimeout(() => {
      // Resolve local logo asset to a URI usable by Razorpay
      const logoUri = Image.resolveAssetSource(
        require('../assets/logo.png'),
      ).uri;
      const options = {
        description: `${coupon.brandName || 'Coupon'} Purchase`,
        // image: logoUri, // Razorpay expects a URI (local resolved or remote URL)
        currency: 'INR',
        key: 'rzp_test_D8xoDNEFQq0XCM',
        amount: coupon.price * 100,
        name: 'Qupon',
        prefill: {
          email: 'emailaddredd@gmail.com',
          contact: 'Phone number',
          name: 'Test User',
        },
        theme: { color: '#B71C1C' },
        modal: {
          ondismiss: () => {
            navigation.goBack();
          },
        },
      };

      RazorpayCheckout.open(options)
        .then(data => {
          navigation.replace('PurchaseSuccess', {
            coupon,
            paymentId: data.razorpay_payment_id,
          });
        })
        .catch(error => {
          // Handle specific error cases
          if (error.code === 'PAYMENT_CANCELLED') {
            Alert.alert(
              'Payment Cancelled',
              'You cancelled the payment. You can try again anytime.',
            );
          } else {
            Alert.alert(
              'Payment Failed',
              error.description ||
                'Something went wrong with the payment. Please try again.',
            );
          }
          navigation.goBack();
        });
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [coupon, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Initializing Payment Gateway...</Text>
      <Text style={styles.subText}>
        {coupon?.brandName || 'Coupon'}: ₹{coupon?.price || 0}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
