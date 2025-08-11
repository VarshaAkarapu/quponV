import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Clipboard,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';
import { getConfirmationResult, setConfirmationResult } from './authStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function OtpScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeInput, setActiveInput] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const inputRefs = useRef([]);
  const { updateUserAfterLogin } = useAuth();

  useEffect(() => {
    // Start resend timer
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    }
  };

  const handleInputFocus = index => {
    setActiveInput(index);
  };

  const pasteOtp = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      const otpDigits = clipboardContent.replace(/\D/g, '').slice(0, 6);

      if (otpDigits.length === 6) {
        const newOtp = otpDigits.split('');
        setOtp(newOtp);
        inputRefs.current[5]?.focus();
        setActiveInput(5);
      }
    } catch (error) {
      console.error('Failed to paste OTP:', error);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      const phone = route.params.phone;
      const newConfirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      setConfirmationResult(newConfirmation);
      setResendTimer(60);
      Alert.alert('Success', 'OTP resent successfully');
    } catch (error) {
      setErrorMessage('Failed to resend OTP. Please try again.');
      setErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP');
      setErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const confirmation = getConfirmationResult();
      if (!confirmation) {
        throw new Error(
          'No confirmation object. Please try resending the OTP.',
        );
      }

      const credential = await confirmation.confirm(otpString);
      // Get Firebase ID token to authenticate with backend
      const idToken = await credential.user.getIdToken();

      console.log('🔐 OTP verified successfully, making API call...');
      console.log('🔐 Phone number from route params:', route.params.phone);

      // Call backend to create/fetch user using Firebase idToken (GET /users/phone?idToken=...)
      const url = `${buildApiUrl(
        API_ENDPOINTS.USERS.LOGIN,
      )}?idToken=${encodeURIComponent(idToken)}`;
      const res = await fetch(url, { method: 'GET' });
      console.log('🔐 Request URL:', url);

      console.log('🔐 API response status:', res.status);

      let data;
      const responseText = await res.text();
      console.log('🔐 Raw response:', responseText);

      try {
        data = JSON.parse(responseText);
        console.log('🔐 Parsed response data:', data);
      } catch (jsonError) {
        console.error('Server returned non-JSON:', responseText);
        throw new Error('Unexpected server response');
      }

      if (res.ok && (data.user || data.userId)) {
        const userObj = data.user || {};
        const isProfileCompleted = userObj.isProfileCompleted === true;
        const userId = userObj.userId || data.userId;
        const isAdmin = userObj.role === 'admin' || userObj.isAdmin === true;

        console.log('🔐 User data received:', {
          isProfileCompleted,
          userId,
          isAdmin,
          redirectTo: route.params.redirectTo,
        });

        // Update AuthContext with user data
        await updateUserAfterLogin(userObj);

        // Check if user is admin first
        if (isAdmin) {
          console.log('🔐 User is admin, navigating to AdminDashboard');
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
          });
          return;
        }

        // For regular users, check profile completion
        if (isProfileCompleted) {
          console.log('🔐 User profile completed, checking redirect...');

          // If redirecting to Payment, pass the coupon parameter
          if (route.params.redirectTo === 'Payment' && route.params.coupon) {
            console.log('🔐 Redirecting to Payment with coupon');
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Payment',
                  params: { coupon: route.params.coupon },
                },
              ],
            });
          } else {
            // Default to Home screen if no specific redirect
            console.log('🔐 Redirecting to Home screen');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        } else {
          // First time user - go to registration
          console.log(
            '🔐 User profile not completed, redirecting to Registration',
          );
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Registration',
                params: {
                  userId,
                  redirectTo: route.params.redirectTo,
                  coupon: route.params.coupon,
                },
              },
            ],
          });
        }
      } else {
        throw new Error(data.message || 'User lookup failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setErrorMessage(
        err.message || 'OTP verification failed. Please try again.',
      );
      setErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>OTP Verification</Text>

            <Text style={styles.subtitle}>
              Code sent to +91{' '}
              {route.params.phone?.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3')}
            </Text>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    activeInput === index && styles.otpInputActive,
                  ]}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  onFocus={() => handleInputFocus(index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Instructions and Paste Button */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructions}>
                Enter the 6-digit code sent to your phone
              </Text>
              <TouchableOpacity style={styles.pasteButton} onPress={pasteOtp}>
                <Text style={styles.pasteIcon}>📋</Text>
                <Text style={styles.pasteText}>Paste OTP</Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                loading && styles.verifyButtonDisabled,
              ]}
              onPress={verifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Didn't receive the code?"}
              </Text>
              {resendTimer === 0 && (
                <TouchableOpacity onPress={resendOtp} disabled={loading}>
                  <Text style={styles.resendButton}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error Modal */}
          <Modal
            visible={errorModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setErrorModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.errorModal}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
                <TouchableOpacity
                  style={styles.okButton}
                  onPress={() => setErrorModal(false)}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#B71C1C',
    backgroundColor: '#fff5f5',
  },
  otpInputActive: {
    borderColor: '#B71C1C',
    borderWidth: 2,
    shadowColor: '#B71C1C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  pasteIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  pasteText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#B71C1C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resendButton: {
    fontSize: 14,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
