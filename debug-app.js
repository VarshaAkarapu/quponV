// Debug script for quponV app
// Run this to check for common issues

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging quponV app...\n');

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ Package.json is valid');
  console.log(`   React Native version: ${packageJson.dependencies['react-native']}`);
  console.log(`   React version: ${packageJson.dependencies['react']}`);
} catch (error) {
  console.log('❌ Package.json error:', error.message);
}

// Check app.json
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  console.log('✅ App.json is valid');
  console.log(`   App name: ${appJson.name}`);
  console.log(`   Display name: ${appJson.displayName}`);
} catch (error) {
  console.log('❌ App.json error:', error.message);
}

// Check Firebase configs
const firebaseConfigs = [
  'android/app/google-services.json',
  'ios/GoogleService-Info.plist'
];

firebaseConfigs.forEach(config => {
  if (fs.existsSync(config)) {
    console.log(`✅ Firebase config exists: ${config}`);
  } else {
    console.log(`❌ Missing Firebase config: ${config}`);
  }
});

// Check key files
const keyFiles = [
  'App.tsx',
  'index.js',
  'src/screens/appNavigator.js',
  'src/contexts/AuthContext.js',
  'src/screens/homeScreen.js'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Key file exists: ${file}`);
  } else {
    console.log(`❌ Missing key file: ${file}`);
  }
});

console.log('\n🔧 Common fixes to try:');
console.log('1. Clear Metro cache: npx react-native start --reset-cache');
console.log('2. Clean and rebuild Android: cd android && ./gradlew clean && cd .. && npx react-native run-android');
console.log('3. Clean and rebuild iOS: cd ios && rm -rf build && cd .. && npx react-native run-ios');
console.log('4. Clear AsyncStorage data from device');
console.log('5. Check device logs: npx react-native log-android or npx react-native log-ios');

console.log('\n🚨 If app still crashes:');
console.log('1. Check the simplified AuthContext and AppNavigator');
console.log('2. Verify Firebase initialization');
console.log('3. Test with minimal components first');
console.log('4. Check for memory leaks in useEffect hooks'); 