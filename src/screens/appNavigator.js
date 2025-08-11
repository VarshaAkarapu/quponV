import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from './loginScreen';
import OtpScreen from './otpVerificationScreen';
import RegistrationScreen from './RegisterScreen';
import UploadCouponScreen from './uploadCouponScreen';
import HomeScreen from './homeScreen';
import SplashScreen from './splashScreen';
import BrowseDealsScreen from './browseDealsScreen';
import PaymentScreen from './paymentScreen';
import ProfileScreen from './profileScreen';
import AdminDashboard from './adminDashboard';
import AdminCouponManagement from './adminCouponManagement';
import AdminUserManagement from './adminUserManagement';
import AdminAddCoupon from './adminAddCoupon';
import AdminAnalytics from './adminAnalytics';
import AdminLoginScreen from './adminLoginScreen';
import AdminUploadCoupon from './adminUploadCoupon';
import AdminProfile from './adminProfile';
import AdminUserDetails from './adminUserDetails';
import AboutUsScreen from './aboutUsScreen';

import UserInformationScreen from './userInformationScreen';
import UploadedCouponsScreen from './uploadedCouponsScreen';
import PurchasedCouponsScreen from './purchasedCouponsScreen';
import UserLevelScreen from './userLevelScreen';
import PurchaseSuccessScreen from './purchaseSuccessScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { currentUser, isAdmin, loading, isAuthenticated, restoreAdminStatus } =
    useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(async () => {
      // Try to restore admin status if user is authenticated
      if (currentUser && isAuthenticated) {
        await restoreAdminStatus();
      }

      setShowSplash(false);
    }, 2000);

    // Fallback: Force navigation after 5 seconds if still on splash
    const fallbackTimer = setTimeout(async () => {
      // Try to restore admin status if user is authenticated
      if (currentUser && isAuthenticated) {
        await restoreAdminStatus();
      }

      setShowSplash(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [currentUser, isAuthenticated, restoreAdminStatus]);

  // Navigate to appropriate screen after splash
  useEffect(() => {
    if (!showSplash && !loading) {
      // Determine which screen to navigate to
      let targetScreen = 'Home'; // Default to Home

      if (isAuthenticated && currentUser) {
        if (isAdmin) {
          targetScreen = 'AdminDashboard';
        } else {
          targetScreen = 'Home';
        }
      }

      console.log('🎬 Navigating to:', targetScreen);

      // Use navigation.replace to navigate to the target screen
      // This will be handled by the parent navigator
    }
  }, [showSplash, loading, isAuthenticated, currentUser, isAdmin]);

  // Determine initial screen based on authentication and admin status
  const getInitialScreen = () => {
    // Always start with splash screen
    if (showSplash || loading) {
      return 'Splash';
    }

    // If user is authenticated
    if (isAuthenticated && currentUser) {
      // Only show admin dashboard if user is explicitly an admin
      if (isAdmin) {
        return 'AdminDashboard'; // Admin user, show admin dashboard
      }

      return 'Home'; // Regular authenticated user, show home screen
    }

    // If not authenticated, show home screen
    return 'Home'; // Not authenticated, show home screen
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialScreen()}
      screenOptions={{ headerShown: false }}
    >
      {/* Splash Screen */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* Main app screens - accessible to everyone */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BrowseDeals" component={BrowseDealsScreen} />
      <Stack.Screen name="UploadCoupon" component={UploadCouponScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PurchaseSuccess" component={PurchaseSuccessScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />

      {/* Profile Drawer Screens */}
      <Stack.Screen name="UserInformation" component={UserInformationScreen} />
      <Stack.Screen name="UploadedCoupons" component={UploadedCouponsScreen} />
      <Stack.Screen
        name="PurchasedCoupons"
        component={PurchasedCouponsScreen}
      />
      <Stack.Screen name="UserLevel" component={UserLevelScreen} />

      {/* Auth screens - only accessible when not authenticated */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          gestureEnabled: !isAuthenticated, // Disable back gesture if authenticated
        }}
      />
      <Stack.Screen
        name="OTP"
        component={OtpScreen}
        options={{
          gestureEnabled: !isAuthenticated, // Disable back gesture if authenticated
        }}
      />
      <Stack.Screen
        name="Registration"
        component={RegistrationScreen}
        options={{
          gestureEnabled: !isAuthenticated, // Disable back gesture if authenticated
        }}
      />

      {/* Admin screens - accessible when needed */}
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          gestureEnabled: false, // Prevent swipe back for admin screens
        }}
      />
      <Stack.Screen
        name="AdminCouponManagement"
        component={AdminCouponManagement}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AdminUserManagement"
        component={AdminUserManagement}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AdminUserDetails"
        component={AdminUserDetails}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AdminAddCoupon"
        component={AdminAddCoupon}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AdminUploadCoupon"
        component={AdminUploadCoupon}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AdminAnalytics"
        component={AdminAnalytics}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfile}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    </Stack.Navigator>
  );
}
