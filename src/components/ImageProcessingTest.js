import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  processImageData,
  compressBase64Image,
  processLargeImage,
} from '../utils/imageUtils';

export default function ImageProcessingTest() {
  const [testResults, setTestResults] = useState([]);

  // Test data - simulate large base64 images like the ones from user uploads
  const testImages = [
    {
      id: 'test1',
      name: 'Large JPEG (460KB)',
      // Simulate a large base64 string (this is just a placeholder)
      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='.repeat(
        1000,
      ), // This creates a large string
    },
    {
      id: 'test2',
      name: 'Large PNG (394KB)',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='.repeat(
        1000,
      ), // This creates a large string
    },
  ];

  const runTest = testImage => {
    try {
      // Test the old approach (would return null for large images)
      const oldResult = processImageData(testImage.data, testImage.id);

      // Test the new approach
      const newResult = processImageData(testImage.data, testImage.id);

      const result = {
        id: testImage.id,
        name: testImage.name,
        originalSize: Math.round(testImage.data.length / 1024),
        oldResult: oldResult ? 'Success' : 'Failed (returned null)',
        newResult: newResult ? 'Success' : 'Failed (returned null)',
        processedSize: newResult ? Math.round(newResult.length / 1024) : 'N/A',
        timestamp: new Date().toLocaleTimeString(),
      };

      setTestResults(prev => [result, ...prev]);
    } catch (error) {
      console.error(`❌ Test failed for ${testImage.name}:`, error);

      const result = {
        id: testImage.id,
        name: testImage.name,
        originalSize: Math.round(testImage.data.length / 1024),
        oldResult: 'Error',
        newResult: 'Error',
        processedSize: 'N/A',
        error: error.message,
        timestamp: new Date().toLocaleTimeString(),
      };

      setTestResults(prev => [result, ...prev]);
    }
  };

  const runAllTests = () => {
    testImages.forEach(testImage => {
      setTimeout(() => runTest(testImage), 100); // Small delay between tests
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Image Processing Test</Text>
      <Text style={styles.subtitle}>
        Testing improved image processing for large user-uploaded screenshots
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={runAllTests}>
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>

        {testResults.map((result, index) => (
          <View key={`${result.id}-${index}`} style={styles.resultItem}>
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultDetails}>
              Original Size: {result.originalSize}KB
            </Text>
            <Text style={styles.resultDetails}>
              Old Result: {result.oldResult}
            </Text>
            <Text style={styles.resultDetails}>
              New Result: {result.newResult}
            </Text>
            {result.processedSize !== 'N/A' && (
              <Text style={styles.resultDetails}>
                Processed Size: {result.processedSize}KB
              </Text>
            )}
            {result.error && (
              <Text style={styles.errorText}>Error: {result.error}</Text>
            )}
            <Text style={styles.timestamp}>{result.timestamp}</Text>
          </View>
        ))}

        {testResults.length === 0 && (
          <Text style={styles.noResults}>
            No test results yet. Run tests to see results.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

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
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});
