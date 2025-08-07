import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAdminRole } from '../utils/authUtils';
import { initializeFirebase } from '../utils/firebaseInit';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Debug isAdmin state changes
  useEffect(() => {
    console.log('🔐 isAdmin state changed to:', isAdmin);
    console.log('🔐 Current auth state:', {
      isAdmin,
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      userPhone: currentUser?.phoneNumber,
    });
  }, [isAdmin, isAuthenticated, currentUser]);

  // Debug currentUser changes
  useEffect(() => {
    console.log('🔐 currentUser changed:', {
      hasUser: !!currentUser,
      phoneNumber: currentUser?.phoneNumber,
      uid: currentUser?.uid,
      isAuthenticated,
    });
  }, [currentUser, isAuthenticated]);

  // Manual admin status check function
  const checkAdminStatus = async () => {
    try {
      const adminUserData = await AsyncStorage.getItem('adminUser');
      if (adminUserData) {
        const adminUser = JSON.parse(adminUserData);

        // Normalize phone numbers for comparison
        const adminPhone = adminUser.phoneNumber?.replace(/[^0-9]/g, '');
        const currentPhone = currentUser?.phoneNumber?.replace(/[^0-9]/g, '');

        // Try different phone number formats for comparison
        const adminPhoneWithoutPlus = adminPhone?.replace(/^\+/, '');
        const currentPhoneWithoutPlus = currentPhone?.replace(/^\+/, '');

        // Remove country code (91) from both numbers for comparison
        const adminPhoneWithoutCountry = adminPhone?.replace(/^91/, '');
        const currentPhoneWithoutCountry = currentPhone?.replace(/^91/, '');

        const isAdminUser =
          adminPhone === currentPhone ||
          adminPhoneWithoutPlus === currentPhoneWithoutPlus ||
          adminPhone === currentPhoneWithoutPlus ||
          adminPhoneWithoutPlus === currentPhone ||
          adminPhoneWithoutCountry === currentPhoneWithoutCountry ||
          adminPhoneWithoutCountry === currentPhone ||
          adminPhone === currentPhoneWithoutCountry;

        console.log('🔐 Manual admin check:', {
          isAdminUser,
          adminUserPhone: adminUser.phoneNumber,
          adminPhoneNormalized: adminPhone,
          adminPhoneWithoutPlus,
          adminPhoneWithoutCountry,
          currentPhone: currentUser?.phoneNumber,
          currentPhoneNormalized: currentPhone,
          currentPhoneWithoutPlus,
          currentPhoneWithoutCountry,
          adminUserRole: adminUser.role,
          adminUserData: adminUser,
        });
        setIsAdmin(isAdminUser);
        return isAdminUser;
      }
      return false;
    } catch (error) {
      console.error('Error in manual admin check:', error);
      return false;
    }
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  };

  // Save user data to AsyncStorage
  const saveUserData = async data => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Clear user data from AsyncStorage
  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('adminUser');
      await AsyncStorage.removeItem('userUserId');
      setUserData(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await auth().signOut();
      await clearUserData();
      setCurrentUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      console.log('🔐 User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if Firebase signOut fails, clear local data
      await clearUserData();
      setCurrentUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
    }
  };

  // Check if user exists in backend
  const checkUserExists = async phoneNumber => {
    try {
      const response = await fetch(
        `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/phone?phone=${encodeURIComponent(
          phoneNumber,
        )}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        return data.success && data.user;
      }
      return false;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('🔥 Setting up auth state listener...');

    let unsubscribe;

    const setupAuthListener = async () => {
      try {
        // Wait a bit for native Firebase to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check Firebase availability
        const firebaseApp = await initializeFirebase();

        if (firebaseApp) {
          console.log('🔥 Firebase available, setting up auth listener');

          // Now try to use Firebase Auth
          const authInstance = auth();
          unsubscribe = authInstance.onAuthStateChanged(async user => {
            console.log('🔐 Auth state changed:', {
              hasUser: !!user,
              userId: user?.uid,
              phoneNumber: user?.phoneNumber,
            });

            setCurrentUser(user);

            if (user) {
              // User is signed in
              const phoneNumber = user.phoneNumber;
              setIsAuthenticated(true);

              // Check admin status
              await checkAdminStatus();

              // Load or create user data
              let existingData = await loadUserData();
              if (!existingData) {
                const newUserData = {
                  userId: user.uid,
                  phoneNumber: phoneNumber,
                  isAdmin: false,
                  lastLogin: new Date().toISOString(),
                };
                await saveUserData(newUserData);
              } else {
                existingData.lastLogin = new Date().toISOString();
                await saveUserData(existingData);
              }
            } else {
              // User is signed out
              console.log('🚪 User signed out');
              setIsAdmin(false);
              setUserData(null);
              setIsAuthenticated(false);
            }

            setLoading(false);
          });
        } else {
          console.log('🔥 Firebase not available, using fallback mode');
          setLoading(false);

          // Try to load any existing user data from storage
          try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (storedUserData) {
              const userData = JSON.parse(storedUserData);
              setUserData(userData);
              setIsAuthenticated(true);
              console.log('🔄 Loaded user data from storage in fallback mode');
            }
          } catch (storageError) {
            console.error('🔄 Error loading stored user data:', storageError);
          }
        }
      } catch (error) {
        console.error('Firebase auth initialization error:', error);
        console.log('🔄 Firebase auth failed, using fallback mode...');
        setLoading(false);

        // Try to load any existing user data from storage
        try {
          const storedUserData = await AsyncStorage.getItem('userData');
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            setUserData(userData);
            setIsAuthenticated(true);
            console.log('🔄 Loaded user data from storage in fallback mode');
          }
        } catch (storageError) {
          console.error('🔄 Error loading stored user data:', storageError);
        }
      }
    };

    setupAuthListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
    userData,
    isAuthenticated,
    signOut,
    saveUserData,
    loadUserData,
    clearUserData,
    checkAdminStatus,
    checkUserExists,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
