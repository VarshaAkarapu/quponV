import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';

export default function UserInformationScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    upi: '',
  });

  useEffect(() => {
    fetchUserInformation();
  }, []);

  const fetchUserInformation = async () => {
    try {
      setLoading(true);

      const currentUser = auth().currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'User not logged in');
        navigation.goBack();
        return;
      }

      const apiUrl = `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/search?phone=${currentUser.phoneNumber}`;

      const response = await fetch(apiUrl);

      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData);

        // Initialize edit form with current user data
        const formData = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          dob: userData.dob
            ? new Date(userData.dob).toISOString().split('T')[0]
            : '',
          upi: userData.upi || '',
        };

        setEditForm(formData);
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        console.error('❌ Response status:', response.status);
        Alert.alert(
          'Error',
          `Failed to fetch user information. Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error('❌ Network/Other error:', error);
      console.error('❌ Error message:', error.message);
      Alert.alert(
        'Error',
        `Failed to fetch user information: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setEditForm({
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      email: userInfo.email || '',
      dob: userInfo.dob
        ? new Date(userInfo.dob).toISOString().split('T')[0]
        : '',
      upi: userInfo.upi || '',
    });
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const currentUser = auth().currentUser;

      if (!currentUser || !userInfo) {
        Alert.alert('Error', 'User not found');
        return;
      }

      if (!userInfo._id && !userInfo.userId) {
        Alert.alert(
          'Error',
          'User ID not found. Please refresh and try again.',
        );
        return;
      }

      // Use userId if available, otherwise use _id
      const userId = userInfo.userId || userInfo._id;

      // Validate required fields
      if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
        Alert.alert('Error', 'First name and last name are required');
        return;
      }

      if (!editForm.email.trim()) {
        Alert.alert('Error', 'Email is required');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      const updateData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        dob: editForm.dob
          ? new Date(editForm.dob).toISOString().split('T')[0]
          : null, // Format as YYYY-MM-DD
        upi: editForm.upi.trim(),
      };

      // Update user profile using the correct profile endpoint with userId in URL
      const apiUrl = `https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/users/profile/${userId}`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        let updatedUserData;
        try {
          updatedUserData = await response.json();
        } catch (parseError) {
          updatedUserData = null;
        }

        // Extract the actual user data from the response
        const actualUserData = updatedUserData?.data ||
          updatedUserData || { ...userInfo, ...updateData };

        // Force immediate state update with a new object reference
        const newUserInfo = {
          ...actualUserData,
          lastUpdated: new Date().toISOString(), // Force re-render
        };
        setUserInfo(newUserInfo);

        // Also update editForm state to reflect the changes
        setEditForm(updateData);
        setIsEditing(false);

        Alert.alert('Success', 'Profile updated successfully!');

        // Verify backend update by fetching fresh data
        setTimeout(() => {
          fetchUserInformation();
        }, 1000);
      } else {
        const errorText = await response.text();
        console.error('❌ Profile update failed:', errorText);

        Alert.alert(
          'Update Failed',
          `Failed to update profile. Status: ${response.status}. Please try again.`,
        );
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Error',
        'Failed to update profile. Please check your internet connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Information</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Information</Text>
        {userInfo && !isEditing && (
          <TouchableOpacity onPress={handleEditPress}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}
        {userInfo && isEditing && (
          <View style={styles.editButtons}>
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveProfile}
              style={styles.saveButton}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        {!userInfo && <View style={styles.placeholder} />}
      </View>

      {userInfo ? (
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Personal Information</Text>

            {isEditing ? (
              // Edit Mode - Form Inputs
              <>
                <View style={styles.editRow}>
                  <Text style={styles.infoLabel}>First Name:</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.firstName}
                    onChangeText={value =>
                      handleInputChange('firstName', value)
                    }
                    placeholder="Enter first name"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.editRow}>
                  <Text style={styles.infoLabel}>Last Name:</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.lastName}
                    onChangeText={value => handleInputChange('lastName', value)}
                    placeholder="Enter last name"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.editRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.email}
                    onChangeText={value => handleInputChange('email', value)}
                    placeholder="Enter email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.editRow}>
                  <Text style={styles.infoLabel}>Date of Birth:</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.dob}
                    onChangeText={value => handleInputChange('dob', value)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.editRow}>
                  <Text style={styles.infoLabel}>UPI ID:</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.upi}
                    onChangeText={value => handleInputChange('upi', value)}
                    placeholder="Enter UPI ID"
                    placeholderTextColor="#999"
                  />
                </View>
              </>
            ) : (
              // View Mode - Display Only
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>
                    {userInfo.firstName || 'Not provided'}{' '}
                    {userInfo.lastName || ''}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>
                    {userInfo.email || 'Not provided'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date of Birth:</Text>
                  <Text style={styles.infoValue}>
                    {userInfo.dob
                      ? new Date(userInfo.dob).toLocaleDateString()
                      : 'Not provided'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>UPI ID:</Text>
                  <Text style={styles.infoValue}>
                    {userInfo.upi || 'Not provided'}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Account Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{userInfo._id || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>
                {userInfo.role === 'admin' || userInfo.role === 'Admin'
                  ? 'Admin'
                  : 'User'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User Level:</Text>
              <Text style={styles.infoValue}>
                Level {userInfo.userLevel || 1}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Registration Date:</Text>
              <Text style={styles.infoValue}>
                {userInfo.createdAt
                  ? new Date(userInfo.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataTitle}>No Information Available</Text>
          <Text style={styles.noDataSubtitle}>
            You need to login to see your information.
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.registerButtonText}>Login to Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 18,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  editButton: {
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  editButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#B71C1C',
    minWidth: 50,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
    marginLeft: 10,
  },
  editInput: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  registerButton: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
