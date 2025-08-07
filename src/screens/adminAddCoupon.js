import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function AdminAddCoupon({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    expiryDate: '',
    brandName: '',
    categoryName: '',
    terms: '',
    price: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/categories',
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/brands',
      );
      if (response.ok) {
        const data = await response.json();
        // Filter out the flights brand from the brands list
        const filteredData = data.filter(brand => 
          brand.brandName && brand.brandName.toLowerCase() !== 'flights'
        );
        setBrands(filteredData);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!formData.brandName.trim()) {
      Alert.alert('Error', 'Please select a brand');
      return false;
    }
    if (!formData.categoryName.trim()) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.discount.trim()) {
      Alert.alert('Error', 'Please enter discount percentage');
      return false;
    }
    if (!formData.price.trim()) {
      Alert.alert('Error', 'Please enter coupon price');
      return false;
    }
    if (!formData.expiryDate.trim()) {
      Alert.alert('Error', 'Please enter expiry date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        'https://m8igs45g3a.execute-api.ap-south-1.amazonaws.com/dev/api/coupons',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            discount: parseInt(formData.discount),
            price: parseFloat(formData.price),
            status: 'approved', // Admin coupons are auto-approved
          }),
        },
      );

      if (response.ok) {
        Alert.alert('Success', 'Coupon added successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to add coupon');
      }
    } catch (error) {
      console.error('Failed to add coupon:', error);
      Alert.alert('Error', 'Failed to add coupon');
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    label,
    field,
    placeholder,
    keyboardType = 'default',
    multiline = false,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={formData[field]}
        onChangeText={value => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Coupon</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form */}
        <View style={styles.formContainer}>
          {renderInputField('Title', 'title', 'Enter coupon title')}

          {renderInputField(
            'Description',
            'description',
            'Enter coupon description',
            'default',
            true,
          )}

          {/* Brand Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Brand</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.brandName}
                onValueChange={value => handleInputChange('brandName', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select a brand" value="" />
                {brands.map(brand => (
                  <Picker.Item
                    key={brand.brandId}
                    label={brand.brandName}
                    value={brand.brandName}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.categoryName}
                onValueChange={value =>
                  handleInputChange('categoryName', value)
                }
                style={styles.picker}
              >
                <Picker.Item label="Select a category" value="" />
                {categories.map(category => (
                  <Picker.Item
                    key={category.categoryId}
                    label={category.name}
                    value={category.name}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.discount}
                onChangeText={value => handleInputChange('discount', value)}
                placeholder="e.g., 50"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.inputLabel}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={value => handleInputChange('price', value)}
                placeholder="e.g., 100"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          {renderInputField('Expiry Date', 'expiryDate', 'YYYY-MM-DD')}

          {renderInputField(
            'Terms & Conditions',
            'terms',
            'Enter terms and conditions',
            'default',
            true,
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Coupon</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
