import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEXT_STYLES } from '../config/fontConfig';

const FontTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Font Test Component</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brand Text (Poppins Bold)</Text>
        <Text style={styles.brandText}>Qupon</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heading (Poppins Semi-Bold)</Text>
        <Text style={styles.headingText}>This is a heading</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Text (Nunito Regular)</Text>
        <Text style={styles.bodyText}>
          This is body text using Nunito font family.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Button Text (Poppins Semi-Bold)</Text>
        <Text style={styles.buttonText}>Button Text</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Caption Text (Nunito Regular)</Text>
        <Text style={styles.captionText}>This is caption text</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    ...TEXT_STYLES.HEADING,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  sectionTitle: {
    ...TEXT_STYLES.LABEL,
    marginBottom: 10,
    color: '#666',
  },
  brandText: {
    ...TEXT_STYLES.BRAND_LOGO,
    color: '#B71C1C',
  },
  headingText: {
    ...TEXT_STYLES.HEADING,
    color: '#333',
  },
  bodyText: {
    ...TEXT_STYLES.BODY_TEXT,
    color: '#333',
  },
  buttonText: {
    ...TEXT_STYLES.BUTTON_PRIMARY,
    color: '#B71C1C',
  },
  captionText: {
    ...TEXT_STYLES.CAPTION_TEXT,
    color: '#666',
  },
});

export default FontTest;
