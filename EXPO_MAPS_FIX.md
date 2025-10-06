# 🗺️ Expo Maps Error Fix Guide

## Error: "Cannot find native module 'ExpoMaps'"

This error occurs when expo-maps is not properly linked to the native modules. Here's how to fix it:

### 📋 **Quick Fix Steps:**

#### **1. Verify Installation**
```bash
# Check if expo-maps is installed
npm list expo-maps

# Should show: expo-maps@~0.11.0
```

#### **2. Reinstall Expo Maps**
```bash
# Remove and reinstall expo-maps
npx expo install expo-maps

# Or if using npm
npm install expo-maps@~0.11.0
```

#### **3. Clear Cache and Rebuild**
```bash
# Clear Expo cache
npx expo start --clear

# For development build
npx expo run:android --clear
# or
npx expo run:ios --clear
```

#### **4. Development Build Required**
Expo Maps requires a **development build** - it won't work with Expo Go:

```bash
# Create development build for Android
npx expo run:android

# Create development build for iOS
npx expo run:ios
```

### 🔧 **Alternative Solutions:**

#### **Option 1: Use React Native Maps Instead**
If you prefer a more stable solution:

```bash
npm install react-native-maps
```

#### **Option 2: Conditional Loading (Current Implementation)**
The app now gracefully handles missing expo-maps with:
- ✅ Proper error handling
- ✅ Helpful fallback message
- ✅ Clear fix instructions
- ✅ App continues to work without maps

### 📱 **Platform Support:**

- **Web**: Uses Google Maps (works out of the box)
- **iOS/Android**: Requires expo-maps + development build
- **Expo Go**: Maps not supported (limitation of Expo Go)

### 🛠️ **Debugging Commands:**

Check the console logs for:
- `✅ Expo-maps loaded successfully` (working)
- `⚠️  Expo-maps not available: [error]` (not working)
- `💡 To fix: Run "npx expo install expo-maps" and rebuild the app`

### 🎯 **Current Status:**

The app now works regardless of expo-maps status:
- **Maps available**: Shows interactive map with restaurant markers
- **Maps unavailable**: Shows helpful fallback with instructions
- **Functionality preserved**: Restaurant list still works normally

---

**Note**: This is a common issue when running on development simulators or when expo-maps native modules aren't properly linked. The fixes above should resolve it.