import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  } else {
    return (
      pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
    );
  }
};

export const isSmallDevice = () => {
  return SCREEN_WIDTH < 375;
};

export const isMediumDevice = () => {
  return SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
};

export const isLargeDevice = () => {
  return SCREEN_WIDTH >= 414;
};

// Responsive scaling
export const scale = size => {
  const newSize = size * (SCREEN_WIDTH / 375); // Base width is 375 (iPhone X)
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

export const verticalScale = size => {
  const newSize = size * (SCREEN_HEIGHT / 812); // Base height is 812 (iPhone X)
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Responsive font sizes
export const fontSize = {
  xs: scale(10),
  sm: scale(12),
  md: scale(14),
  lg: scale(16),
  xl: scale(18),
  xxl: scale(20),
  xxxl: scale(24),
  title: scale(28),
  largeTitle: scale(32),
};

// Responsive padding/margin
export const padding = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Responsive border radius
export const borderRadius = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  xxl: scale(24),
};

// Device-specific adjustments
export const getDeviceSpecificStyles = () => {
  try {
    if (isSmallDevice()) {
      return {
        containerPadding: padding.sm,
        modalWidth: '98%',
        modalHeight: '90%',
        buttonHeight: scale(44),
        inputHeight: scale(44),
      };
    } else if (isMediumDevice()) {
      return {
        containerPadding: padding.md,
        modalWidth: '95%',
        modalHeight: '85%',
        buttonHeight: scale(48),
        inputHeight: scale(48),
      };
    } else if (isLargeDevice()) {
      return {
        containerPadding: padding.lg,
        modalWidth: '90%',
        modalHeight: '80%',
        buttonHeight: scale(52),
        inputHeight: scale(52),
      };
    } else {
      return {
        containerPadding: padding.md,
        modalWidth: '95%',
        modalHeight: '85%',
        buttonHeight: scale(48),
        inputHeight: scale(48),
      };
    }
  } catch (error) {
    // Fallback to default values if there's an error
    return {
      containerPadding: 16,
      modalWidth: '95%',
      modalHeight: '85%',
      buttonHeight: 48,
      inputHeight: 48,
    };
  }
};

// Platform-specific adjustments
export const getPlatformSpecificStyles = () => {
  if (Platform.OS === 'ios') {
    return {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    };
  } else {
    return {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    };
  }
};

// Responsive modal styles
export const getResponsiveModalStyles = () => {
  const deviceStyles = getDeviceSpecificStyles();

  return {
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: padding.md,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: borderRadius.lg,
      width: deviceStyles.modalWidth,
      maxHeight: deviceStyles.modalHeight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 1001,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: padding.lg,
      paddingBottom: padding.md,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      backgroundColor: '#fafafa',
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
    },
    modalBody: {
      flex: 1,
      paddingHorizontal: padding.lg,
      paddingVertical: padding.md,
      minHeight: 200,
      backgroundColor: '#fff',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: padding.lg,
      paddingTop: padding.md,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      backgroundColor: '#fafafa',
      borderBottomLeftRadius: borderRadius.lg,
      borderBottomRightRadius: borderRadius.lg,
    },
  };
};

// Responsive button styles
export const getResponsiveButtonStyles = () => {
  const deviceStyles = getDeviceSpecificStyles();

  return {
    button: {
      backgroundColor: '#B71C1C',
      paddingVertical: padding.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: deviceStyles.buttonHeight,
    },
    buttonText: {
      color: '#fff',
      fontSize: fontSize.lg,
      fontWeight: 'bold',
    },
  };
};

// Responsive input styles
export const getResponsiveInputStyles = () => {
  const deviceStyles = getDeviceSpecificStyles();

  return {
    input: {
      flex: 1,
      fontSize: fontSize.md,
      color: '#333',
      minHeight: deviceStyles.inputHeight,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: borderRadius.md,
      backgroundColor: '#fff',
      paddingHorizontal: padding.md,
      paddingVertical: padding.md,
      minHeight: deviceStyles.inputHeight,
    },
  };
};

export default {
  scale,
  verticalScale,
  moderateScale,
  screenWidth,
  screenHeight,
  spacing,
  fontSize,
  padding,
  borderRadius,
  isTablet,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  getDeviceSpecificStyles,
  getPlatformSpecificStyles,
  getResponsiveModalStyles,
  getResponsiveButtonStyles,
  getResponsiveInputStyles,
};
