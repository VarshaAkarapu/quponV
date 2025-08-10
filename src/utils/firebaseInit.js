import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import { firebaseConfig } from '../config/firebaseConfig';

let firebaseInitialized = false;
let firebaseApp = null;

export const initializeFirebase = async () => {
  if (firebaseInitialized && firebaseApp) {
    return firebaseApp;
  }

  try {
    // First, check if there are any existing apps
    const existingApps = getApps();

    if (existingApps.length > 0) {
      // Use existing app
      firebaseApp = getApp();
      firebaseInitialized = true;
      return firebaseApp;
    }

    // No existing apps, try to initialize explicitly with config

    try {
      firebaseApp = initializeApp(firebaseConfig);
      firebaseInitialized = true;
      return firebaseApp;
    } catch (initError) {
      console.error('🔥 Firebase initialization failed:', initError);
      firebaseInitialized = true;
      firebaseApp = null;
      return null;
    }
  } catch (error) {
    console.error('🔥 Firebase initialization error:', error);
    firebaseInitialized = true;
    firebaseApp = null;
    return null;
  }
};

export const isFirebaseInitialized = () => {
  return firebaseInitialized && firebaseApp !== null;
};
