// Debug script for quponV app
// Run this to check for common issues

const fs = require('fs');
const path = require('path');

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
} catch (error) {}

// Check app.json
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
} catch (error) {}

// Check Firebase configs
const firebaseConfigs = [
  'android/app/google-services.json',
  'ios/GoogleService-Info.plist',
];

firebaseConfigs.forEach(config => {
  if (fs.existsSync(config)) {
  } else {
  }
});

// Check key files
const keyFiles = [
  'App.tsx',
  'index.js',
  'src/screens/appNavigator.js',
  'src/contexts/AuthContext.js',
  'src/screens/homeScreen.js',
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
  } else {
  }
});
