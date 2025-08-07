// Font Configuration for Qupon App
// This file defines consistent font families and weights throughout the application
import { Platform } from 'react-native';

// Font Families
export const FONT_FAMILIES = {
  // Primary font for headings and brand text
  PRIMARY: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  // Secondary font for body text and descriptions
  SECONDARY: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  // Brand font for logo text - modern rounded sans-serif with better Q
  BRAND: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-black',
  // Fallback fonts for cross-platform compatibility
  FALLBACK: {
    ANDROID: 'sans-serif-black',
    IOS: 'Helvetica Neue',
  },
};

// Font Objects for useFonts hook
export const FONT_OBJECTS = {
  // Will be added when custom fonts are properly configured
};

// Font Weights
export const FONT_WEIGHTS = {
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMI_BOLD: '600',
  BOLD: '700',
  EXTRA_BOLD: '800',
};

// Font Sizes
export const FONT_SIZES = {
  XS: 10,
  SM: 12,
  BASE: 14,
  LG: 16,
  XL: 18,
  XXL: 20,
  XXXL: 24,
  TITLE: 28,
  HEADING: 32,
  HERO: 36,
};

// Typography Styles
export const TYPOGRAPHY = {
  // Brand/Logo text (Qupon)
  BRAND: {
    fontFamily: FONT_FAMILIES.BRAND,
    fontWeight: '900', // Maximum boldness
    fontSize: FONT_SIZES.HERO,
    letterSpacing: 1,
  },

  // Main headings
  HEADING: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    fontSize: FONT_SIZES.XXL,
  },

  // H1 heading style
  H1: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontWeight: FONT_WEIGHTS.BOLD,
    fontSize: FONT_SIZES.HEADING,
    color: '#333',
  },

  // Sub headings
  SUB_HEADING: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    fontSize: FONT_SIZES.LG,
  },

  // Body text
  BODY: {
    fontFamily: FONT_FAMILIES.SECONDARY,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
  },

  // Button text
  BUTTON: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    fontSize: FONT_SIZES.BASE,
  },

  // Caption/Small text
  CAPTION: {
    fontFamily: FONT_FAMILIES.SECONDARY,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontSize: FONT_SIZES.SM,
  },

  // Label text
  LABEL: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
  },

  // Price text
  PRICE: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontWeight: FONT_WEIGHTS.BOLD,
    fontSize: FONT_SIZES.LG,
  },

  // Navigation text
  NAVIGATION: {
    fontFamily: FONT_FAMILIES.PRIMARY,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    fontSize: FONT_SIZES.BASE,
  },
};

// Hook to load fonts - simplified for now
export const useAppFonts = () => {
  // Return true since we're using system fonts for now
  return true;
};

// Helper function to get font family with fallbacks
export const getFontFamily = fontFamily => {
  const platform = Platform.OS;
  const fallback =
    platform === 'ios'
      ? FONT_FAMILIES.FALLBACK.IOS
      : FONT_FAMILIES.FALLBACK.ANDROID;
  return `${fontFamily}, ${fallback}`;
};

// Helper function to create consistent text styles
export const createTextStyle = (typographyKey, additionalStyles = {}) => {
  const baseStyle = TYPOGRAPHY[typographyKey];
  return {
    ...baseStyle,
    ...additionalStyles,
  };
};

// Pre-defined text styles for common use cases
export const TEXT_STYLES = {
  // Brand/Logo styles
  BRAND_LOGO: createTextStyle('BRAND'),
  BRAND_HEADING: createTextStyle('HEADING'),

  // Navigation styles
  NAV_TITLE: createTextStyle('NAVIGATION'),
  NAV_ITEM: createTextStyle('NAVIGATION'),

  // Content styles
  H1: createTextStyle('H1'),
  PAGE_TITLE: createTextStyle('HEADING'),
  SECTION_TITLE: createTextStyle('SUB_HEADING'),
  BODY_TEXT: createTextStyle('BODY'),
  CAPTION_TEXT: createTextStyle('CAPTION'),

  // Interactive elements
  BUTTON_PRIMARY: createTextStyle('BUTTON'),
  BUTTON_SECONDARY: createTextStyle('BUTTON', {
    fontWeight: FONT_WEIGHTS.MEDIUM,
  }),
  INPUT_LABEL: createTextStyle('LABEL'),
  INPUT_TEXT: createTextStyle('BODY'),

  // Special elements
  PRICE_TEXT: createTextStyle('PRICE'),
  COUPON_CODE: createTextStyle('BUTTON', {
    fontFamily: 'monospace',
  }),
  STATUS_TEXT: createTextStyle('LABEL'),
};

export default {
  FONT_FAMILIES,
  FONT_WEIGHTS,
  FONT_SIZES,
  TYPOGRAPHY,
  TEXT_STYLES,
  FONT_OBJECTS,
  useAppFonts,
  getFontFamily,
  createTextStyle,
};
