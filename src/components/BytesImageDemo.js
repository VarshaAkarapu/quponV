/**
 * Demo component showing how to convert byte arrays to base64 images
 * This demonstrates the exact approach you mentioned:
 * 1. Convert byte array to base64-encoded image string
 * 2. Use it as the src of an Image component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  processImageData,
  bytesToBase64,
  detectImageFormat,
} from '../utils/imageUtils';

/**
 * Demo component showing how to convert byte arrays to base64 images
 * This demonstrates the exact approach you mentioned:
 * 1. Convert byte array to base64-encoded image string
 * 2. Use it as the src of an Image component
 */
const BytesImageDemo = () => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sample byte array (JPEG image bytes)
  const sampleBytes = [
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x64,
    0x00, 0x64, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02,
    0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00,
    0xb5, 0x10, 0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05,
    0x04, 0x04, 0x00, 0x00, 0x01, 0x7d, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11,
    0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71,
    0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52,
    0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18,
    0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37,
    0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53,
    0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67,
    0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83,
    0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96,
    0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9,
    0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
    0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6,
    0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8,
    0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
    0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00,
    0x3f, 0x00, 0xff, 0xd9,
  ];

  const convertBytesToImage = () => {
    setLoading(true);

    try {
      // Step 1: Convert byte array to base64 string
      const base64String = bytesToBase64(sampleBytes);

      // Step 2: Detect image format from bytes
      const imageFormat = detectImageFormat(sampleBytes);

      // Step 3: Create data URL (data:image/jpeg;base64,...)
      const dataUrl = `data:${imageFormat};base64,${base64String}`;

      // Step 4: Set as image source
      setImageUri(dataUrl);

      Alert.alert(
        'Success!',
        `✅ Byte array converted to image!\n\n` +
          `Format: ${imageFormat}\n` +
          `Base64 length: ${base64String.length}\n` +
          `Data URL length: ${dataUrl.length}`,
      );
    } catch (error) {
      console.error('❌ Error converting bytes to image:', error);
      Alert.alert('Error', 'Failed to convert byte array to image');
    } finally {
      setLoading(false);
    }
  };

  const useProcessImageData = () => {
    setLoading(true);

    try {
      // Use the existing processImageData function
      const result = processImageData(sampleBytes, 'DEMO_COUPON');

      if (result) {
        setImageUri(result);
        Alert.alert(
          'Success!',
          `✅ processImageData worked!\n\n` +
            `Result type: ${typeof result}\n` +
            `Length: ${result.length}`,
        );
      } else {
        Alert.alert('Error', 'processImageData returned null');
      }
    } catch (error) {
      console.error('❌ Error using processImageData:', error);
      Alert.alert('Error', 'processImageData failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Byte Array to Image Demo</Text>
      <Text style={styles.subtitle}>
        Demonstrating how to convert byte arrays to base64 images
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={convertBytesToImage}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Converting...' : 'Manual Conversion'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={useProcessImageData}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Use processImageData'}
          </Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageTitle}>Converted Image:</Text>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => {}}
            onError={error => console.error('❌ Image load error:', error)}
          />
          <Text style={styles.imageInfo}>
            Data URL length: {imageUri.length}
          </Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoText}>
          1. Byte array comes from backend API{'\n'}
          2. Convert to base64 using bytesToBase64(){'\n'}
          3. Detect format using detectImageFormat(){'\n'}
          4. Create data URL: data:image/jpeg;base64,...{'\n'}
          5. Use as Image source in React Native
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  image: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default BytesImageDemo;
