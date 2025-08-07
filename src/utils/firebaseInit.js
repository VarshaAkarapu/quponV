import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import { firebaseConfig } from '../config/firebaseConfig';

let firebaseInitialized = false;
let firebaseApp = null;

export const initializeFirebase = async () => {
  if (firebaseInitialized && firebaseApp) {
    console.log('🔥 Firebase already initialized');
    return firebaseApp;
  }

  try {
    console.log('🔥 Attempting Firebase initialization...');

    // First, check if there are any existing apps
    const existingApps = getApps();
    console.log('🔥 Existing Firebase apps:', existingApps.length);

    if (existingApps.length > 0) {
      // Use existing app
      firebaseApp = getApp();
      console.log('🔥 Using existing Firebase app:', firebaseApp.name);
      firebaseInitialized = true;
      return firebaseApp;
    }

    // No existing apps, try to initialize explicitly with config
    console.log('🔥 No existing apps, initializing with config...');

    try {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('🔥 Firebase initialized successfully:', firebaseApp.name);
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
