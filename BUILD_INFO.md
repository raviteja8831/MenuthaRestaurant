# Menutha Restaurant - Android Release Build Information

## Build Status: SUCCESS

### Generated Files

**APK (for direct installation):**
- Location: `android/app/build/outputs/apk/release/app-release.apk`
- Size: 121 MB
- Version: 1.0.0 (versionCode: 1)

**AAB (for Google Play Store):**
- Location: `android/app/build/outputs/bundle/release/app-release.aab`
- Size: 79 MB
- Version: 1.0.0 (versionCode: 1)

### Release Keystore Information

**IMPORTANT: Keep this information secure!**

- Keystore File: `android/app/menutha-release.keystore`
- Keystore Password: `menutha2025`
- Key Alias: `menutha-key-alias`
- Key Password: `menutha2025`

**Backup Instructions:**
1. Make a secure backup of the keystore file (`android/app/menutha-release.keystore`)
2. Store the credentials in a secure password manager
3. Never commit the keystore file to version control
4. You MUST use the same keystore for all future app updates

### Issues Fixed

1. **API URL Error**: Fixed invalid API URL in `.env` file
   - Before: `http://13.127.228.119.com:8090` (invalid - extra `.com`)
   - After: `http://13.127.228.119:8090` (correct)

2. **API Configuration for Release Builds**: Added API URLs to `app.json` extra config
   - API_BASE_URL: `http://13.127.228.119:8090/api`
   - IMG_BASE_URL: `http://13.127.228.119:8090/`

3. **Package Name Error**: Fixed Kotlin import statements
   - Changed from `com.menutha.restaurant.BuildConfig` to `com.menutha.org.BuildConfig`

4. **Release Signing**: Created production keystore and configured proper signing

### App Configuration

- Package Name: `com.menutha.org`
- Application ID: `com.menutha.org`
- Min SDK: 24
- Target SDK: 35
- Compile SDK: 35

### Network Settings

- Cleartext Traffic: Enabled (for HTTP API access)
- Network Security Config: Configured in `android/app/src/main/res/xml/network_security_config.xml`

### Next Steps

1. **Test the APK:**
   - Install on a physical device: `adb install android/app/build/outputs/apk/release/app-release.apk`
   - Test all API connections and features

2. **Google Play Store Upload:**
   - Use the AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
   - Follow Google Play Console upload instructions

3. **Future Builds:**
   - To build APK: `cd android && ./gradlew assembleRelease`
   - To build AAB: `cd android && ./gradlew bundleRelease`

### Security Recommendations

1. **Consider HTTPS**: For production, migrate your API from HTTP to HTTPS for better security
2. **API Keys**: Consider moving sensitive API keys to a secure backend configuration
3. **Keystore Security**: Store the keystore file in a secure, backed-up location separate from the codebase

---

## QR Scanner Fix (Added: October 9, 2025)

### Issue
The app was crashing when navigating to the QR Scanner screen with error:
```
java.lang.RuntimeException: Unable to access internal_backingMap via reflection
at expo.modules.kotlin.views.GroupViewManagerWrapper.updateProperties
```

### Root Cause
**Incompatibility between Expo modules (expo-camera, expo-maps) and React Native's New Architecture (Fabric)**

### Permanent Fix Applied

**1. app.json (Line 10):**
- Changed: `"newArchEnabled": false`

**2. android/gradle.properties (Line 39):**
- Changed: `newArchEnabled=false`
- Added comment explaining Expo compatibility

**3. android/app/src/main/java/com/menutha/org/MainActivity.kt (Line 44):**
- Changed: `false // Disable Fabric to fix expo-camera crash`

### What This Means
- App now uses React Native's stable legacy bridge
- All Expo modules (camera, maps, location) work correctly
- No performance impact for this app
- Can re-enable when Expo fully supports Fabric

---
Build Date: October 9, 2025
Build System: Gradle 8.13
