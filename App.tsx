import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, Alert } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/screens/appNavigator';
import { initializeFirebase } from './src/utils/firebaseInit';

export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        console.log('🔥 Starting Firebase initialization...');
        await initializeFirebase();
        console.log('🔥 Firebase initialization completed');
        setFirebaseReady(true);
      } catch (error) {
        console.error('🔥 Firebase initialization failed in App.tsx:', error);
        setError(error.message);
        // Still set ready to true so app can continue with fallback
        setFirebaseReady(true);
      }
    };

    initFirebase();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!firebaseReady) {
    // You could show a loading screen here
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
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
