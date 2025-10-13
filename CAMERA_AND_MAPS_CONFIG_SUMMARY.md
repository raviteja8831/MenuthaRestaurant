# Camera & Maps Configuration Summary

## Overview
This document summarizes the configuration changes made to support QR code scanning (expo-camera) and Google Maps functionality after running `npx expo prebuild`.

## Changes Made

### 1. Camera Setup (expo-camera)

#### Packages Installed
- `expo-camera@^17.0.8` - Camera component with built-in barcode/QR scanning
- `expo-barcode-scanner@^13.0.1` - Barcode scanning support

#### Permissions Configured

**app.json** - iOS Camera Permission:
```json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "This app needs access to the camera to scan QR codes for table orders."
  }
}
```

**app.json** - Android Camera Permission:
```json
"android": {
  "permissions": [
    "CAMERA",
    "INTERNET",
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION"
  ]
}
```

**AndroidManifest.xml** - Already includes:
```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

#### QRScannerScreen.js
- Updated to use `expo-camera` instead of `react-native-vision-camera`
- Uses `CameraView` component with `onBarcodeScanned` prop
- Supports both Android and iOS platforms
- Handles QR code formats: JSON and deep link (`menutha://order?data=...`)

### 2. Google Maps Configuration

#### app.json Configuration

**iOS Maps API Key:**
```json
"ios": {
  "config": {
    "googleMapsApiKey": AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ"
  }
}
```

**Android Maps API Key:**
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ"
    }
  }
}
```

#### AndroidManifest.xml
```xml
<meta-data android:name="com.google.android.geo.API_KEY" 
           android:value=AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

#### build.gradle Dependencies
```gradle
// Google Play Services for Maps
implementation 'com.google.android.gms:play-services-maps:18.2.0'
implementation 'com.google.android.gms:play-services-location:21.0.1'
```

### 3. Build Script Updates (build_multi_app_cleartext.sh)

#### Version Updated
- Changed from v12 to **v13**
- Added camera and maps configuration notes

#### New Function: `configure_maps_dependencies()`
```bash
configure_maps_dependencies() {
  local BUILD_GRADLE="android/app/build.gradle"
  print_status "Ensuring Google Maps dependencies in build.gradle..."
  
  # Check if Google Maps dependencies exist
  if ! grep -q "play-services-maps" "$BUILD_GRADLE"; then
    # Add Google Maps dependencies
    sed -i '/implementation("com.facebook.react:react-android")/a\    \n    // Google Play Services for Maps\n    implementation '\''com.google.android.gms:play-services-maps:18.2.0'\''\n    implementation '\''com.google.android.gms:play-services-location:21.0.1'\''' "$BUILD_GRADLE"
  fi
}
```

#### Build Process Updated
All build targets now call:
1. `configure_manifest` - Sets up cleartext traffic, network security, camera permissions, and Google Maps API key
2. `configure_maps_dependencies` - Ensures Google Maps dependencies are in build.gradle

### 4. Network Security

**network_security_config.xml** (auto-configured by build script):
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">13.127.228.119</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

## After Prebuild Checklist

When you run `npx expo prebuild --clean`, the following will be automatically configured:

✅ **Camera Permissions**
- Android: CAMERA permission in AndroidManifest.xml
- iOS: NSCameraUsageDescription in Info.plist
- expo-camera native modules linked

✅ **Google Maps**
- Android: Google Maps API key meta-data in AndroidManifest.xml
- iOS: Google Maps API key in Info.plist
- react-native-maps native modules linked

✅ **Location Permissions**
- Android: ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
- iOS: Location usage descriptions (if configured in app.json)

✅ **Network Security**
- Cleartext traffic enabled for development API server
- Network security config applied

## Build Commands

```bash
# Build Customer App only
./build_multi_app_cleartext.sh menutha

# Build Restaurant App only
./build_multi_app_cleartext.sh menuva

# Build both apps
./build_multi_app_cleartext.sh both
```

## Testing

### Test QR Scanner
1. Build and install APK: `adb install -r builds/app-menutha-release.apk`
2. Navigate to QR Scanner screen
3. Grant camera permission when prompted
4. Scan a QR code with format:
   ```json
   {
     "type": "table_order",
     "restaurantId": "123",
     "tableId": "456",
     "tableName": "Table 5"
   }
   ```

### Test Google Maps
1. Navigate to any screen with maps functionality
2. Verify map loads correctly
3. Verify location permissions work
4. Test location-based features

## Important Notes

1. **Prebuild**: Always run `npx expo prebuild --clean` when:
   - Installing new native modules (like expo-camera)
   - Changing app.json configuration
   - Switching between customer/restaurant apps

2. **Maps API Key**: The current API key is for development. For production:
   - Generate a new API key in Google Cloud Console
   - Restrict the key to your app's package name
   - Update in both app.json and build script

3. **Camera on iOS**: Requires physical device testing (iOS Simulator doesn't support camera)

4. **Build Script**: The `build_multi_app_cleartext.sh` script automatically:
   - Preserves camera permissions after prebuild
   - Ensures Google Maps dependencies are present
   - Configures network security for API access
   - Handles both customer and restaurant app builds

## Cross-Platform Support

| Feature | Android | iOS | Notes |
|---------|---------|-----|-------|
| QR Scanner (expo-camera) | ✅ | ✅ | Works on both platforms |
| Google Maps | ✅ | ✅ | API key configured for both |
| Camera Permissions | ✅ | ✅ | Auto-requested on first use |
| Location Services | ✅ | ✅ | Requires user permission |

