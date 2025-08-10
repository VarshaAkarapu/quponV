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
  Modal,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { setConfirmationResult } from './authStore';
import { initializeFirebase } from '../utils/firebaseInit';

export default function LoginScreen({ navigation, route }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
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

    if (!agreeTerms || !agreePrivacy) {
      Alert.alert(
        'Agreement required',
        'Please agree to the Terms & Conditions and Privacy Policy to continue.',
      );
      return;
    }

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
    <>
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

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
                onPress={() => setAgreeTerms(prev => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeTerms }}
              >
                {agreeTerms ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => setShowTermsModal(true)}
                >
                  Terms & Conditions
                </Text>
              </Text>
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  agreePrivacy && styles.checkboxChecked,
                ]}
                onPress={() => setAgreePrivacy(prev => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreePrivacy }}
              >
                {agreePrivacy ? (
                  <Text style={styles.checkboxTick}>✓</Text>
                ) : null}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => setShowPrivacyModal(true)}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.getOtpButton,
                (loading || !(agreeTerms && agreePrivacy)) &&
                  styles.getOtpButtonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={loading || !(agreeTerms && agreePrivacy)}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.getOtpText}>Get OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Qupon - Terms and Conditions
              </Text>
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator>
              <Text style={styles.modalBodyText}>
                {`Qupon - Terms and Conditions
Effective Date: Tuesday 22 July 2025
Last Updated: Tuesday 22 July 2025

Welcome to Qupon! By accessing or using our app and services, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.

1. Definitions
- "Qupon": The mobile application/platform operated by Qupon, allowing users to upload, browse, buy, and sell discount coupons.
- "User": Any individual who registers and uses the app, including coupon uploaders and buyers.
- "Coupon": A valid and transferable promotional code that offers a discount on a third-party platform or service.
- "Admin": The Qupon backend team that verifies, edits, and approves coupons before listing them.

2. Eligibility
- Users must be 13 years or older to use Qupon. Users below 18 years must use the app under parental or guardian supervision.
- All users must provide accurate personal and payment information when required for purchases or withdrawals.
- Bank account/UPI linking is optional but required to receive earnings from coupon sales.

3. User Account & OTP Verification
- Users can sign up via Email or Phone Number with OTP verification.
- OTP Disclaimer: Qupon uses a third-party cloud-based OTP provider. While the provider follows security standards, Qupon does not store OTP data on its own servers.
- User Consent Clause: By using Qupon, you agree to share your phone number for OTP verification and consent to receive SMS/OTP messages for login and account verification.
- Data Sharing Statement: Your phone number will only be shared with our trusted OTP provider for the purpose of authentication. We do not sell or misuse your personal data.
- Qupon is not liable for breaches, delays, or failures caused by the OTP provider.
- Users are responsible for keeping their login details confidential.

4. Coupon Uploading Policy
- To upload a coupon, the user must provide:
  1. Brand Name (Mandatory).
  2. Coupon Code (Mandatory).
  3. Coupon Heading (Mandatory).
  4. Expiry Date (Mandatory).
  5. Screenshot/Terms & Conditions (Mandatory - single upload).
  6. Category (Optional).
- Coupon Verification: Admin verifies the coupon, edits details if required, and sets the selling price.
- Status updates: Active (approved), Rejected, or Inactive (pending).
- Not Accepted: Expired, fake, tampered, or single-use coupons tied to specific phone numbers or IPs.

5. Coupon Browsing & Purchase
- All coupons are displayed under Browse Deals by default.
- Categories such as Food, Travel, Fashion, etc., can be selected.
- Each coupon card shows brand logo, coupon heading & value, and hidden coupon code until purchase.
- After payment, the coupon code is revealed in the user's Purchased Coupons section.
- If a coupon fails verification during purchase, the buyer receives a full refund.

6. Profile Levels & Upload Limits
- Level 1 (Spark): Default level. Upload limit: 7 coupons/day.
- Level 2 (Blaze): Unlocks after selling or buying 30 verified coupons. Upload limit: 10 coupons/day. Buyer discount: 1%.
- Level 3 (Inferno): Unlocks after selling or buying 67 total verified coupons (30 + 37). Upload limit: 13 coupons/day. Buyer discount: 1.5-2%. Top sellers receive badges.
- Note: Prepayment for uploaders has been removed.

7. Earnings & Payments
- Sellers receive payment after their uploaded coupons are purchased.
- All transactions are logged for security and compliance.
- Payments are made directly to the user's linked bank account/UPI after verification.

8. Admin Panel & Rights
- Admin can review, edit, accept, reject, or hold uploaded coupons.
- Admin may adjust coupon pricing for listing.
- Admin can suspend accounts involved in fraudulent activity.

9. User Obligations
- Users must upload only valid and transferable coupons.
- Fraudulent or spam activities (fake codes, misuse) can result in account suspension or a permanent ban.
- Users must comply with all app policies and category guidelines.

10. Limitation of Liability
Qupon is not responsible for:
- Errors or downtime on third-party brand platforms.
- Failures caused by payment gateways or OTP services.
- Misuse or unauthorized access caused by third-party platforms used for OTP verification.
- Incorrect uploads or purchases made due to user error.

11. Third-Party Services Disclaimer
- We use third-party service providers for OTP and verification services. While we ensure they comply with security standards, we are not liable for any unauthorized use or breach of data by these providers.

12. Intellectual Property
- All logos, designs, content, and app interface belong to Qupon.
- Unauthorized use or duplication is strictly prohibited.

13. Modifications
- Qupon reserves the right to update or modify these Terms & Conditions at any time without prior notice.
- Continued use of the app after changes implies acceptance of updates.

14. Governing Law
- These Terms are governed by the laws of India, under the jurisdiction of Hyderabad, Telangana.
- Disputes will be resolved via arbitration or civil courts.

15. Contact
For queries or legal issues:
- Email: businessqupon@gmail.com
- Customer Care: +91 9121289189`}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Qupon - Privacy Policy</Text>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator>
              <Text style={styles.modalBodyText}>
                {`Qupon - Privacy Policy
Effective Date: Tuesday 22 July 2025
Last Updated: Tuesday 22 July 2025

At Qupon, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information.

1. Information We Collect
- Phone number and email address (for login & OTP verification).
- Basic profile details (optional).
- Payment details (only when linking for withdrawals).
- Coupon data (uploaded by users).

2. How We Use Your Data
- To create and verify your account.
- To send OTPs for login and security verification.
- To process transactions (buying/selling coupons).
- To improve user experience and app performance.

3. OTP & Third-Party Services
- We use trusted third-party OTP providers for sending and verifying OTP codes.
- Third-Party Services Disclaimer: While we ensure these providers follow security standards, we are not liable for any unauthorized access or breach of data by these providers.

4. User Consent Clause
- By using Qupon, you agree to share your phone number for OTP verification and consent to receive SMS/OTP messages for login and account verification.

5. Data Sharing Statement
- Your phone number will only be shared with our trusted OTP provider for the purpose of authentication.
- We do not sell, rent, or misuse your personal data under any circumstances.

6. Payments
- Bank/UPI details (if provided) are encrypted and used only for processing withdrawals.
- We use secure payment gateways to protect your transactions.

7. Data Security
- We use encryption and security protocols to protect user data.
- However, no digital transmission or storage system can be guaranteed 100% secure.

8. User Rights
- You can request to delete or modify your account information anytime by contacting customer care.

9. Liability Limitation
- Qupon shall not be responsible for any misuse or unauthorized access caused by third-party OTP verification platforms.

10. Updates to Privacy Policy
- We may update this Privacy Policy from time to time. Users will be notified via email or app alerts.

11. Contact Us
For privacy concerns or queries:
- Email: businessqupon@gmail.com
- Customer Care: +91 9121289189`}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
    marginBottom: 8,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#B71C1C',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#B71C1C',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
    paddingRight: 8,
  },
  modalCloseButton: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#333',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalBodyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
