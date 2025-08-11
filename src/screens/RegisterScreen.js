import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const navigation = useNavigation();
  const route = useRoute();

  // Validate age (must be 13+ years)
  const validateAge = date => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  // Validate email format
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate UPI ID format
  const validateUpiId = upi => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(upi);
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!upiId.trim()) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!validateUpiId(upiId)) {
      newErrors.upiId = 'Please enter a valid UPI ID (e.g., name@bank)';
    }

    const age = validateAge(dob);
    if (age < 13) {
      newErrors.dob = 'You must be at least 13 years old';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = date => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors before proceeding',
      );
      return;
    }

    try {
      const userId = route.params?.userId;
      if (!userId) {
        throw new Error('User ID is required for registration');
      }

      const res = await fetch(
        `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/register/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            upi: upiId,
            dob: dob.toISOString().split('T')[0], // Format as YYYY-MM-DD
          }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        // Handle navigation based on where user came from
        const redirectTo = route.params?.redirectTo;
        const coupon = route.params?.coupon;

        if (redirectTo === 'Payment' && coupon) {
          // User came from payment flow - go back to payment
          navigation.reset({
            index: 0,
            routes: [{ name: 'Payment', params: { coupon } }],
          });
        } else if (redirectTo === 'UploadCoupon') {
          // User came from upload flow - go back to upload
          navigation.reset({
            index: 0,
            routes: [{ name: 'UploadCoupon' }],
          });
        } else {
          // Default - go to home screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to complete registration');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Complete Your Profile</Text>

      <TextInput
        style={[styles.input, errors.firstName && styles.inputError]}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      {errors.firstName && (
        <Text style={styles.errorText}>{errors.firstName}</Text>
      )}

      <TextInput
        style={[styles.input, errors.lastName && styles.inputError]}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      {errors.lastName && (
        <Text style={styles.errorText}>{errors.lastName}</Text>
      )}

      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, errors.upiId && styles.inputError]}
        placeholder="UPI ID (e.g., name@bank)"
        value={upiId}
        onChangeText={setUpiId}
        autoCapitalize="none"
      />
      {errors.upiId && <Text style={styles.errorText}>{errors.upiId}</Text>}

      <TouchableOpacity
        style={[
          styles.input,
          styles.dateInput,
          errors.dob && styles.inputError,
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{formatDate(dob)}</Text>
        <Text style={styles.dateLabel}>Date of Birth</Text>
      </TouchableOpacity>
      {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

      <Text style={styles.ageText}>Age: {validateAge(dob)} years</Text>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Complete Registration</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()} // Can't select future dates
          minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  ageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e53935',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
