const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      'use-latest-callback': 'use-latest-callback/lib/src/index.js',
    },
    unstable_enableSymlinks: false,
    unstable_enablePackageExports: false,
  },
  transformer: {
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
  maxWorkers: 1,
  resetCache: false,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
