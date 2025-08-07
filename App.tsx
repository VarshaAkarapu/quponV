import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/screens/appNavigator';
import { initializeFirebase } from './src/utils/firebaseInit';

export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        console.log('🔥 Initializing Firebase in App.tsx...');
        await initializeFirebase();
        console.log('🔥 Firebase initialized successfully in App.tsx');
        setFirebaseReady(true);
      } catch (error) {
        console.error('🔥 Firebase initialization failed in App.tsx:', error);
        // Still set ready to true so app can continue with fallback
        setFirebaseReady(true);
      }
    };

    initFirebase();
  }, []);

  if (!firebaseReady) {
    // You could show a loading screen here
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
