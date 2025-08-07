import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { userAPI } from '../services/apiService';

export default function RegistrationScreen({ route, navigation }) {
  const { userId, redirectTo, coupon } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      // Use the correct API endpoint and method
      const result = await userAPI.completeProfile(userId, {
        name,
        email,
      });

      if (result.success) {
        // Navigate based on redirectTo parameter
        if (redirectTo === 'Payment' && coupon) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Payment', params: { coupon } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo || 'UploadCoupon' }],
          });
        }
      } else {
        Alert.alert('Registration failed', result.message || 'Try again');
      }
    } catch (e) {
      console.error('Registration error:', e);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#e53935',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
