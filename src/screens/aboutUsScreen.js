import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';

export default function AboutUsScreen({ navigation }) {
  const handleContactPress = () => {
    Linking.openURL('mailto:Businessqupon@gmail.com');
  };

  const handleWebsitePress = () => {
    // Replace with actual website URL when available
    Linking.openURL('https://qupon.india');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Qupon</Text>
          <Text style={styles.tagline}>India's First Coupon Marketplace</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            At Qupon, we believe every deal deserves a second chance. We're
            building India's first marketplace where users can sell their unused
            coupons and others can buy them at incredible discounts.
          </Text>
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Upload</Text>
              <Text style={styles.stepDescription}>
                Submit your unused coupon to our platform with just a few
                clicks.
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Paid</Text>
              <Text style={styles.stepDescription}>
                Sellers receive 20% of the coupon value after it is successfully
                sold.
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Score a Deal</Text>
              <Text style={styles.stepDescription}>
                Buyers get up to 75% OFF the coupon's original value and save
                big.
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Qupon?</Text>

          <View style={styles.featureContainer}>
            <Text style={styles.featureIcon}>💰</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Save Money</Text>
              <Text style={styles.featureDescription}>
                Get incredible discounts on your favorite brands and services.
              </Text>
            </View>
          </View>

          <View style={styles.featureContainer}>
            <Text style={styles.featureIcon}>🔄</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Reduce Waste</Text>
              <Text style={styles.featureDescription}>
                Give unused coupons a new life instead of letting them expire.
              </Text>
            </View>
          </View>

          <View style={styles.featureContainer}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Secure & Safe</Text>
              <Text style={styles.featureDescription}>
                All transactions are secure and verified by our admin team.
              </Text>
            </View>
          </View>

          <View style={styles.featureContainer}>
            <Text style={styles.featureIcon}>📱</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Easy to Use</Text>
              <Text style={styles.featureDescription}>
                Simple and intuitive interface for both buyers and sellers.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleContactPress}
          >
            <Text style={styles.contactIcon}>📧</Text>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email</Text>
              <Text style={styles.contactValue}>Businessqupon@gmail.com</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Phone</Text>
              <Text style={styles.contactValue}>9121289189</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleWebsitePress}
          >
            <Text style={styles.contactIcon}>🌐</Text>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Website</Text>
              <Text style={styles.contactValue}>qupon.india</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <Text style={styles.socialText}>
            Stay updated with the latest deals and announcements on our social
            media platforms.
          </Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                Linking.openURL(
                  'https://www.facebook.com/share/1FFdNCkPm4/?mibextid=wwXIfr',
                )
              }
            >
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                Linking.openURL(
                  'https://x.com/_qupon?s=21&t=QXETnOLLjTYYRM5cun62Xw',
                )
              }
            >
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                Linking.openURL(
                  'https://www.instagram.com/qupon.india/profilecard/?igsh=MTVjb25vMW55Z2xyMA==',
                )
              }
            >
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2024 Qupon. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#B71C1C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 3,
  },
  contactValue: {
    fontSize: 14,
    color: '#666',
  },
  socialText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});
