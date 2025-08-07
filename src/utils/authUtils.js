import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { initializeFirebase } from './firebaseInit';

// Simple utility functions for authentication

// Centralized admin role checking function
export const isAdminRole = role => {
  if (!role) return false;

  const normalizedRole =
    typeof role === 'string' ? role.trim().toLowerCase() : '';
  return normalizedRole === 'admin';
};

// Check if user is logged in
export const isUserLoggedIn = async () => {
  try {
    const firebaseApp = await initializeFirebase();
    if (!firebaseApp) return false;
    return auth().currentUser !== null;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const firebaseApp = await initializeFirebase();
    if (!firebaseApp) return null;
    return auth().currentUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get user phone number
export const getUserPhone = async () => {
  try {
    const firebaseApp = await initializeFirebase();
    if (!firebaseApp) return null;
    const user = auth().currentUser;
    return user?.phoneNumber;
  } catch (error) {
    console.error('Error getting user phone:', error);
    return null;
  }
};

// Check if user is admin (simple AsyncStorage check)
export const isUserAdmin = async () => {
  try {
    const adminUserData = await AsyncStorage.getItem('adminUser');
    if (!adminUserData) return false;

    const adminUser = JSON.parse(adminUserData);

    const firebaseApp = await initializeFirebase();
    if (!firebaseApp) return false;

    const currentUser = auth().currentUser;

    if (!currentUser) return false;

    // Simple phone number comparison
    const adminPhone = adminUser.phoneNumber?.replace(/[^0-9]/g, '');
    const currentPhone = currentUser.phoneNumber?.replace(/[^0-9]/g, '');

    return adminPhone === currentPhone;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Store admin user data
export const storeAdminUser = async adminData => {
  try {
    await AsyncStorage.setItem('adminUser', JSON.stringify(adminData));
    return true;
  } catch (error) {
    console.error('Error storing admin user:', error);
    return false;
  }
};

// Clear admin user data
export const clearAdminUser = async () => {
  try {
    await AsyncStorage.removeItem('adminUser');
    return true;
  } catch (error) {
    console.error('Error clearing admin user:', error);
    return false;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    const firebaseApp = await initializeFirebase();
    if (firebaseApp) {
      await auth().signOut();
    }
    await clearAdminUser();
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

// Get user data from AsyncStorage
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Store user data
export const storeUserData = async userData => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

// Clear user data
export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};
