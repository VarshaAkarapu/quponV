import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeAdminUser, isAdminRole } from '../utils/authUtils';

export default function AdminLoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth(getApp()).onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        checkAdminStatus(user.phoneNumber);
      }
    });

    return unsubscribe;
  }, [checkAdminStatus]);

  const checkAdminStatus = useCallback(
    async phone => {
      try {
        console.log('🔐 Starting admin status check for phone:', phone);

        // Use POST method with phone in body
        const apiUrl =
          'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/phone';
        console.log('🔐 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        });

        console.log('🔐 Response status:', response.status);
        console.log('🔐 Response ok:', response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('🔐 AdminLogin check result:', data);
          console.log(
            '🔐 User role:',
            data.user?.role,
            'Type:',
            typeof data.user?.role,
          );

          if (data.success && data.user && isAdminRole(data.user.role)) {
            console.log('✅ Admin verified - storing admin user data');
            console.log('✅ Admin user data to store:', data.user);

            // Add phone number to admin user data for proper comparison
            const adminUserDataWithPhone = {
              ...data.user,
              phoneNumber: phone, // Add the phone number from current user
            };
            console.log(
              '✅ Admin user data with phone:',
              adminUserDataWithPhone,
            );
            await storeAdminUser(adminUserDataWithPhone);
            console.log(
              '✅ Admin user data stored, waiting for state update...',
            );

            // Force a small delay to ensure AsyncStorage is written
            await new Promise(resolve => setTimeout(resolve, 200));

            // Verify the data was stored correctly
            const storedData = await AsyncStorage.getItem('adminUser');
            console.log(
              '✅ Verified stored admin data:',
              storedData ? 'exists' : 'missing',
            );
            if (storedData) {
              const parsedStoredData = JSON.parse(storedData);
              console.log('✅ Stored admin data content:', parsedStoredData);
            }

            // Show success alert before navigation
            Alert.alert(
              'Admin Login Successful',
              'Redirecting to Admin Dashboard...',
              [],
              { cancelable: false },
            );

            console.log('✅ Navigating to AdminDashboard');
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }],
            });
          } else {
            console.log('❌ Admin verification failed - user is not admin');
            console.log('❌ User data:', data.user);
            console.log('❌ User role:', data.user?.role);
            Alert.alert(
              'Access Denied',
              'This phone number is not authorized for admin access.',
            );
            auth(getApp()).signOut();
          }
        } else {
          const errorText = await response.text();
          console.log('❌ Backend error response:', errorText);
          console.log('❌ Backend status:', response.status);

          if (response.status === 404) {
            console.log('❌ User not found in database');
            Alert.alert(
              'Access Denied',
              'User not found in database. Please register first.',
            );
          } else {
            console.log('❌ Backend error during admin check');
            Alert.alert(
              'Error',
              'Failed to verify admin status. Please try again.',
            );
          }
          auth(getApp()).signOut();
        }
      } catch (error) {
        console.error('❌ Network error checking admin status:', error);
        Alert.alert(
          'Error',
          'Network error. Please check your connection and try again.',
        );
        auth(getApp()).signOut();
      }
    },
    [navigation],
  );

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+91')
        ? phoneNumber
        : `+91${phoneNumber}`;
      const confirmation = await auth(getApp()).signInWithPhoneNumber(
        formattedPhone,
      );
      setConfirm(confirmation);
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await confirm.confirm(otp);
      if (result.user) {
        await checkAdminStatus(result.user.phoneNumber);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>Login with phone number</Text>

            {!otpSent ? (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInput}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity
                  style={styles.sendOtpButton}
                  onPress={sendOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.sendOtpButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.verifyOtpButton}
                  onPress={verifyOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.verifyOtpButtonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => setOtpSent(false)}
                >
                  <Text style={styles.resendButtonText}>
                    Change Phone Number
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryCode: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  sendOtpButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOtpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyOtpButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  verifyOtpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#B71C1C',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
