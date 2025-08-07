/**
 * Utility functions for handling image processing in React Native
 */

/**
 * Convert bytes to base64 string (React Native compatible)
 * @param {Uint8Array|Array} bytes - The bytes to convert
 * @returns {string} - Base64 encoded string
 */
export const bytesToBase64 = bytes => {
  try {
    // Method 1: Use Buffer if available (Node.js environment)
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }

    // Method 2: Use global btoa if available
    if (typeof global.btoa !== 'undefined') {
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return global.btoa(binary);
    }

    // Method 3: Use react-native-base64 if available
    try {
      const base64 = require('react-native-base64');
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return base64.encode(binary);
    } catch (e) {
      console.warn(
        'react-native-base64 not available, using manual conversion',
      );
    }

    // Method 4: Manual base64 conversion
    const base64Chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < bytes.length) {
      const byte1 = bytes[i++];
      const byte2 = i < bytes.length ? bytes[i++] : 0;
      const byte3 = i < bytes.length ? bytes[i++] : 0;

      const enc1 = byte1 >> 2;
      const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
      const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
      const enc4 = byte3 & 63;

      result +=
        base64Chars[enc1] +
        base64Chars[enc2] +
        (i > bytes.length + 1 ? '=' : base64Chars[enc3]) +
        (i > bytes.length ? '=' : base64Chars[enc4]);
    }

    return result;
  } catch (error) {
    console.error('Error converting bytes to base64:', error);
    throw error;
  }
};

/**
 * Detect image format from bytes data
 * @param {Uint8Array|Array} bytes - The bytes to analyze
 * @returns {string} - Detected content type
 */
export const detectImageFormat = bytes => {
  try {
    const uint8Array = Array.isArray(bytes) ? new Uint8Array(bytes) : bytes;

    // Check for common image format signatures
    if (uint8Array.length >= 2) {
      // JPEG: starts with 0xFF 0xD8
      if (uint8Array[0] === 0xff && uint8Array[1] === 0xd8) {
        return 'image/jpeg';
      }

      // PNG: starts with 0x89 0x50
      if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) {
        return 'image/png';
      }

      // GIF: starts with "GIF"
      if (
        uint8Array[0] === 0x47 &&
        uint8Array[1] === 0x49 &&
        uint8Array[2] === 0x46
      ) {
        return 'image/gif';
      }

      // WebP: starts with "RIFF"
      if (
        uint8Array[0] === 0x52 &&
        uint8Array[1] === 0x49 &&
        uint8Array[2] === 0x46 &&
        uint8Array[3] === 0x46
      ) {
        return 'image/webp';
      }
    }

    // Default to JPEG if format cannot be detected
    return 'image/jpeg';
  } catch (error) {
    console.error('Error detecting image format:', error);
    return 'image/jpeg';
  }
};

/**
 * Detect image format from base64 string
 * @param {string} base64String - The base64 string to analyze
 * @returns {string} - Detected content type
 */
export const detectImageFormatFromBase64 = base64String => {
  try {
    // Check the first few characters of the base64 string
    // This is a simple heuristic - in practice, you might want to decode and check actual bytes
    const prefix = base64String.substring(0, 20).toLowerCase();

    // JPEG typically starts with /9j/
    if (prefix.includes('/9j/')) {
      return 'image/jpeg';
    }

    // PNG typically starts with iVBORw0KGgo
    if (prefix.includes('ivborw0kggo')) {
      return 'image/png';
    }

    // GIF typically starts with R0lGODlh
    if (prefix.includes('r0lgodlh')) {
      return 'image/gif';
    }

    // WebP typically starts with UklGR
    if (prefix.includes('uklgr')) {
      return 'image/webp';
    }

    // Default to JPEG if format cannot be detected
    return 'image/jpeg';
  } catch (error) {
    console.error('Error detecting image format from base64:', error);
    return 'image/jpeg';
  }
};

/**
 * Create blob URL from base64 string
 * @param {string} base64String - The base64 string to convert
 * @param {string} contentType - The content type of the image
 * @returns {string} - Blob URL
 */
export const createBlobUrlFromBase64 = (
  base64String,
  contentType = 'image/jpeg',
) => {
  try {
    // Convert base64 to bytes
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob
    const blob = new Blob([bytes], { type: contentType });

    // Create blob URL
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  } catch (error) {
    console.error('❌ Error creating blob URL from base64:', error);
    return null;
  }
};

/**
 * Create blob URL from bytes data (for web compatibility)
 * @param {Uint8Array|Array} bytes - The bytes to convert
 * @param {string} contentType - The content type of the image
 * @returns {string} - Blob URL
 */
export const createBlobUrl = (bytes, contentType = 'image/jpeg') => {
  try {
    // Convert bytes to Uint8Array if it's an array
    const uint8Array = Array.isArray(bytes) ? new Uint8Array(bytes) : bytes;

    // Create blob
    const blob = new Blob([uint8Array], { type: contentType });

    // Create blob URL
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  } catch (error) {
    console.error('❌ Error creating blob URL:', error);
    return null;
  }
};

/**
 * Process multer bytes to image (main function for backend bytes conversion)
 * @param {Array|Uint8Array|ArrayBuffer} bytesData - The bytes data from backend
 * @param {string} couponId - The coupon ID for logging
 * @returns {string|null} - Data URL or null if conversion fails
 */
export const processMulterBytes = (bytesData, couponId = 'unknown') => {
  try {
    // Convert to array if needed
    let bytesArray;
    if (Array.isArray(bytesData)) {
      bytesArray = bytesData;
    } else if (bytesData instanceof Uint8Array) {
      bytesArray = Array.from(bytesData);
    } else if (bytesData instanceof ArrayBuffer) {
      bytesArray = Array.from(new Uint8Array(bytesData));
    } else {
      console.error(`❌ Unsupported bytes format for coupon ${couponId}`);
      return null;
    }

    // Detect image format from bytes
    const imageFormat = detectImageFormat(bytesArray);

    // Convert bytes to base64
    const base64String = bytesToBase64(bytesArray);
    if (!base64String) {
      console.error(
        `❌ Failed to convert bytes to base64 for coupon ${couponId}`,
      );
      return null;
    }

    // Create data URL
    const dataUrl = `data:${imageFormat};base64,${base64String}`;

    return dataUrl;
  } catch (error) {
    console.error(
      `❌ Error processing multer bytes for coupon ${couponId}:`,
      error,
    );
    return null;
  }
};

/**
 * Check if data URL is too large for React Native
 * React Native has limitations on data URL size
 * @param {string} dataUrl - The data URL to check
 * @returns {boolean} - True if data URL is too large
 */
export const isDataUrlTooLarge = dataUrl => {
  // React Native can handle larger data URLs, but we'll set a reasonable limit
  const maxSize = 500 * 1024; // 500KB (allows most reasonable image sizes)
  return dataUrl.length > maxSize;
};

/**
 * Check if base64 string is too large for React Native
 * @param {string} base64String - The base64 string to check
 * @returns {boolean} - True if base64 string is too large
 */
export const isBase64TooLarge = base64String => {
  // Base64 strings can be larger, but we'll set a reasonable limit
  const maxSize = 500 * 1024; // 500KB (allows most reasonable image sizes)
  return base64String.length > maxSize;
};

/**
 * Fix URL-encoded base64 data
 * @param {string} data - The data to fix
 * @returns {string} - Fixed data
 */
const fixUrlEncodedBase64 = data => {
  if (!data || !data.startsWith('data:')) return data;

  const parts = data.split(',');
  if (parts.length !== 2) return data;

  const mimeType = parts[0];
  let base64Data = parts[1];

  // Decode URL-encoded characters
  base64Data = decodeURIComponent(base64Data);

  // Fix common URL encoding issues
  base64Data = base64Data
    .replace(/\+977\+9/g, '+') // Fix +977+9 -> +
    .replace(/\+9/g, '+') // Fix +9 -> +
    .replace(/%2B/g, '+') // Fix %2B -> +
    .replace(/%2F/g, '/') // Fix %2F -> /
    .replace(/%3D/g, '='); // Fix %3D -> =

  return mimeType + ',' + base64Data;
};

/**
 * Process image data from API and return a valid URI for React Native Image component
 * @param {Object|string} imageData - The image data from API
 * @param {string} couponId - Coupon ID for logging purposes
 * @returns {string|null} - Valid URI for Image component or null if processing fails
 */
export const processImageData = (imageData, couponId = 'unknown') => {
  try {
    // Handle null or undefined
    if (!imageData) {
      return null;
    }

    // Enhanced logging for bytes data debugging

    // Priority 1: Handle multer bytes array (most common from backend)
    if (Array.isArray(imageData)) {
      return processMulterBytes(imageData, couponId);
    }

    // Priority 2: Handle Uint8Array (another common bytes format)
    if (imageData instanceof Uint8Array) {
      return processMulterBytes(imageData, couponId);
    }

    // Priority 3: Handle ArrayBuffer
    if (imageData instanceof ArrayBuffer) {
      return processMulterBytes(imageData, couponId);
    }

    // Handle different data formats from API
    if (typeof imageData === 'string') {
      // Debug: Log the first 100 characters to see what we're dealing with

      // Check if it's a URL or data URL
      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        // Direct URL string
        return imageData;
      } else if (imageData.startsWith('data:')) {
        // Data URL - fix URL-encoded base64 first
        const fixedDataUrl = fixUrlEncodedBase64(imageData);

        // Check if data URL is too large - if so, return null to trigger fallback
        if (isDataUrlTooLarge(fixedDataUrl)) {
          console.warn(
            `⚠️ Data URL too large for coupon ${couponId}: ${
              fixedDataUrl.length
            } characters (${Math.round(
              fixedDataUrl.length / 1024,
            )}KB) - using fallback`,
          );
          return null; // Return null to trigger placeholder image
        }

        return fixedDataUrl;
      } else {
        // Assume it's base64 data (most common case from backend)

        // Check if base64 string is too large - if so, return null to trigger fallback
        if (isBase64TooLarge(imageData)) {
          console.warn(
            `⚠️ Base64 string too large for coupon ${couponId}: ${
              imageData.length
            } characters (${Math.round(
              imageData.length / 1024,
            )}KB) - using fallback`,
          );
          return null; // Return null to trigger placeholder image
        }

        // Try to detect image format from base64 data
        const detectedFormat = detectImageFormatFromBase64(imageData);

        const dataUrl = `data:${detectedFormat};base64,${imageData}`;

        // Check if data URL is too large - if so, return null to trigger fallback
        if (isDataUrlTooLarge(dataUrl)) {
          console.warn(
            `⚠️ Generated data URL too large for coupon ${couponId}: ${
              dataUrl.length
            } characters (${Math.round(
              dataUrl.length / 1024,
            )}KB) - using fallback`,
          );
          return null; // Return null to trigger placeholder image
        }

        return dataUrl;
      }
    } else if (imageData && typeof imageData === 'object') {
      // Handle object format

      // Check for different object formats
      if (imageData.uri) {
        return imageData.uri;
      }

      if (imageData.url) {
        return imageData.url;
      }

      if (imageData.data) {
        // Handle data property (could be bytes array or base64 string)

        // Check if data is bytes array (multer format)
        if (
          Array.isArray(imageData.data) ||
          imageData.data instanceof Uint8Array ||
          imageData.data instanceof ArrayBuffer
        ) {
          return processMulterBytes(imageData.data, couponId);
        }

        // Check if data is string (base64)
        if (typeof imageData.data === 'string') {
          // Detect content type from data or use provided contentType
          let contentType = imageData.contentType || 'image/jpeg';

          // Check if it's already a data URL
          if (imageData.data.startsWith('data:')) {
            return fixUrlEncodedBase64(imageData.data);
          } else {
            // Assume it's base64 data

            // Check if base64 string is too large
            if (isBase64TooLarge(imageData.data)) {
              console.warn(
                `Base64 string too large for coupon ${couponId}: ${imageData.data.length} characters`,
              );
              return null;
            }

            const detectedFormat = detectImageFormatFromBase64(imageData.data);
            const dataUrl = `data:${detectedFormat};base64,${imageData.data}`;

            return dataUrl;
          }
        }

        // If we reach here, data is not a string, so it should be bytes

        return processMulterBytes(imageData.data, couponId);
      }

      // If object has no recognizable image properties, log and return null
      console.error(
        'Image object has no recognizable image properties:',
        Object.keys(imageData),
      );
      return null;
    }

    return null;
  } catch (error) {
    console.error(`Error processing image for coupon ${couponId}:`, error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      imageDataType: typeof imageData,
      imageDataLength: typeof imageData === 'string' ? imageData.length : 'N/A',
    });
    return null;
  }
};

/**
 * Check if image data exists and is valid
 * @param {Object|string} imageData - The image data to check
 * @returns {boolean} - True if image data exists and is valid
 */
export const hasValidImageData = imageData => {
  if (!imageData) return false;

  // Check if it's a string and not too large
  if (typeof imageData === 'string') {
    // For base64 strings, check if they're not too large
    if (!imageData.startsWith('http') && !imageData.startsWith('data:')) {
      return !isBase64TooLarge(imageData);
    }
    return !isDataUrlTooLarge(imageData);
  }

  if (imageData.uri) return true;
  if (imageData.url) return true;
  if (imageData.data) return true;

  return false;
};

/**
 * Get image source object for React Native Image component
 * @param {Object|string} imageData - The image data from API
 * @param {string} couponId - Coupon ID for logging purposes
 * @returns {Object} - Source object for Image component
 */
export const getImageSource = (imageData, couponId = 'unknown') => {
  const uri = processImageData(imageData, couponId);
  return uri ? { uri } : null;
};

// Image utility functions for validation and processing

/**
 * Validates image file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSizeMB - Maximum size in MB (default: 4)
 * @returns {object} - Validation result with isValid and message
 */
export const validateImageSize = (fileSize, maxSizeMB = 4) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  if (!fileSize) {
    return {
      isValid: false,
      message:
        'Unable to determine image size. Please try selecting a different image.',
    };
  }

  if (fileSize > maxSize) {
    const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      message: `Image too large! Please select an image smaller than ${maxSizeMB}MB.\n\nCurrent size: ${sizeInMB}MB\n\nTip: Try reducing image quality or selecting a smaller image.`,
    };
  }

  return {
    isValid: true,
    message: 'Image size is acceptable.',
  };
};

/**
 * Validates image dimensions
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {number} maxDimension - Maximum dimension in pixels (default: 2000)
 * @returns {object} - Validation result with isValid and message
 */
export const validateImageDimensions = (width, height, maxDimension = 2000) => {
  if (!width || !height) {
    return {
      isValid: false,
      message:
        'Unable to determine image dimensions. Please try selecting a different image.',
    };
  }

  if (width > maxDimension || height > maxDimension) {
    return {
      isValid: false,
      message: `Image dimensions too large! Maximum allowed: ${maxDimension}x${maxDimension}px\n\nCurrent: ${width}x${height}px\n\nPlease select a smaller image.`,
    };
  }

  return {
    isValid: true,
    message: 'Image dimensions are acceptable.',
  };
};

/**
 * Comprehensive image validation
 * @param {object} image - Image object with fileSize, width, height
 * @param {object} options - Validation options
 * @returns {object} - Validation result with isValid and message
 */
export const validateImage = (image, options = {}) => {
  const { maxSizeMB = 4, maxDimension = 2000 } = options;

  // Validate file size
  const sizeValidation = validateImageSize(image.fileSize, maxSizeMB);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Validate dimensions
  const dimensionValidation = validateImageDimensions(
    image.width,
    image.height,
    maxDimension,
  );
  if (!dimensionValidation.isValid) {
    return dimensionValidation;
  }

  return {
    isValid: true,
    message: 'Image validation passed.',
  };
};

/**
 * Get recommended image picker options
 * @param {object} options - Custom options
 * @returns {object} - Image picker options
 */
export const getImagePickerOptions = (options = {}) => {
  const {
    quality = 0.7,
    maxWidth = 1500,
    maxHeight = 1500,
    includeBase64 = false,
  } = options;

  return {
    mediaType: 'photo',
    quality,
    maxWidth,
    maxHeight,
    includeBase64,
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = bytes => {
  if (!bytes) return 'Unknown';

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Process image for coupon upload
 * @param {object} selectedImage - Selected image from image picker
 * @param {object} options - Processing options
 * @returns {object} - Processed image data
 */
export const processImageForUpload = (selectedImage, options = {}) => {
  const { maxSizeMB = 4, maxDimension = 2000 } = options;

  // Validate the image
  const validation = validateImage(selectedImage, { maxSizeMB, maxDimension });
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  // Return processed image data
  return {
    uri: selectedImage.uri,
    type: selectedImage.type || 'image/jpeg',
    name: selectedImage.fileName || 'screenshot.jpg',
    fileSize: selectedImage.fileSize,
    width: selectedImage.width,
    height: selectedImage.height,
  };
};

/**
 * Extract readable text from base64 data
 * @param {string} base64String - The base64 string to analyze
 * @returns {string} - Extracted text or information about the data
 */
export const extractTextFromBase64 = base64String => {
  try {
    // Try to decode base64 to see if it contains text
    const decodedString = atob(base64String);

    // Check if the decoded data contains readable text
    const textPattern = /[A-Za-z\s.,!?;:'"()\-_]+/g;
    const textMatches = decodedString.match(textPattern);

    if (textMatches && textMatches.length > 0) {
      const extractedText = textMatches.join(' ').trim();
      if (extractedText.length > 10) {
        return extractedText;
      }
    }

    // If no readable text, return information about the data
    return `Binary data: ${decodedString.length} bytes`;
  } catch (error) {
    return `Invalid base64 data: ${error.message}`;
  }
};

/**
 * Convert bytes to human-readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Human-readable size
 */
export const bytesToHumanReadable = bytes => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Analyze base64 data and provide human-readable information
 * @param {string} base64String - The base64 string to analyze
 * @returns {object} - Analysis results
 */
export const analyzeBase64Data = base64String => {
  try {
    const decodedBytes = atob(base64String);
    const byteArray = new Uint8Array(decodedBytes.length);

    for (let i = 0; i < decodedBytes.length; i++) {
      byteArray[i] = decodedBytes.charCodeAt(i);
    }

    // Try to extract text
    const extractedText = extractTextFromBase64(base64String);

    // Check for common file signatures
    let fileType = 'Unknown';
    if (byteArray.length >= 2) {
      // JPEG signature: FF D8
      if (byteArray[0] === 0xff && byteArray[1] === 0xd8) {
        fileType = 'JPEG Image';
      }
      // PNG signature: 89 50
      else if (byteArray[0] === 0x89 && byteArray[1] === 0x50) {
        fileType = 'PNG Image';
      }
      // GIF signature: 47 49 46
      else if (
        byteArray[0] === 0x47 &&
        byteArray[1] === 0x49 &&
        byteArray[2] === 0x46
      ) {
        fileType = 'GIF Image';
      }
      // PDF signature: 25 50 44 46
      else if (
        byteArray[0] === 0x25 &&
        byteArray[1] === 0x50 &&
        byteArray[2] === 0x44 &&
        byteArray[3] === 0x46
      ) {
        fileType = 'PDF Document';
      }
    }

    return {
      originalSize: bytesToHumanReadable(base64String.length),
      decodedSize: bytesToHumanReadable(decodedBytes.length),
      fileType: fileType,
      extractedText: extractedText,
      byteCount: decodedBytes.length,
      base64Length: base64String.length,
      firstBytes: Array.from(byteArray.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' '),
      isImage: fileType.includes('Image'),
      isDocument: fileType.includes('Document'),
    };
  } catch (error) {
    return {
      error: error.message,
      originalSize: bytesToHumanReadable(base64String.length),
      base64Length: base64String.length,
    };
  }
};

/**
 * Convert base64 to readable format for debugging
 * @param {string} base64String - The base64 string
 * @param {string} couponId - Coupon ID for logging
 * @returns {object} - Readable information
 */
export const convertBase64ToReadable = (base64String, couponId = 'unknown') => {
  const analysis = analyzeBase64Data(base64String);

  return {
    couponId: couponId,
    fileType: analysis.fileType,
    originalSize: analysis.originalSize,
    decodedSize: analysis.decodedSize,
    byteCount: analysis.byteCount,
    firstBytes: analysis.firstBytes,
    extractedText: analysis.extractedText,
    isImage: analysis.isImage,
    isDocument: analysis.isDocument,
  };
};
