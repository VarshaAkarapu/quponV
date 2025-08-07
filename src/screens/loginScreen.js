import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { setConfirmationResult } from './authStore';
import { initializeFirebase } from '../utils/firebaseInit';

export default function LoginScreen({ navigation, route }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const redirectTo = route?.params?.redirectTo;

  const sendOtp = async phone => {
    try {
      const firebaseApp = await initializeFirebase();
      if (!firebaseApp) {
        throw new Error('Firebase is not available. Please try again.');
      }

      const newConfirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      setConfirmationResult(newConfirmation);
      navigation.navigate('OTP', { phone, redirectTo });
    } catch (error) {
      console.log('OTP send failed:', error);
      Alert.alert('OTP failed', error.message || 'Try again later');
    }
  };

  const handleSendOtp = async () => {
    const phoneNumber = phone.trim();

    if (phoneNumber.length !== 10 || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 10-digit Indian mobile number',
      );
      return;
    }

    setLoading(true);
    await sendOtp(phoneNumber);
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo and Branding Section */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Qupon</Text>
          <Text style={styles.tagline}>
            Because every deal deserves a second chance.
          </Text>
        </View>

        {/* Phone Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.phoneIcon}>📱</Text>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              style={styles.phoneInput}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.getOtpButton,
              loading && styles.getOtpButtonDisabled,
            ]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.getOtpText}>Get OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By continuing, you agree to{'\n'}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  brandingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 40,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  phoneIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  getOtpButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#B71C1C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  getOtpButtonDisabled: {
    backgroundColor: '#ccc',
  },
  getOtpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#B71C1C',
    textDecorationLine: 'underline',
  },
});
