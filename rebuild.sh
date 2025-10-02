#!/bin/bash
set -euo pipefail

echo "🚀 Starting full clean build for Android..."

# Step 1: Uninstall old app and clean everything
echo "📱 Uninstalling old app from device..."
adb uninstall com.anonymous.ft 2>/dev/null || echo "No existing app to uninstall"

echo "🧹 Removing old build artifacts..."
rm -rf node_modules
rm -rf android
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-* 2>/dev/null || true
rm -rf .expo
npm cache clean --force

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Regenerate android folder using Expo prebuild
echo "🔄 Regenerating android folder with expo prebuild..."
npx expo prebuild --platform android --clean

# Step 4: Copy network security config
echo "📋 Copying network security config..."
mkdir -p android/app/src/main/res/xml
cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">frootcity.com</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
EOF

# Step 4a: Add network security config to AndroidManifest
sed -i 's/android:usesCleartextTraffic="true"/android:usesCleartextTraffic="true" android:networkSecurityConfig="@xml\/network_security_config"/g' android/app/src/main/AndroidManifest.xml

# Step 4b: Disable Hermes to fix Symbol error (ensure it's set correctly)
echo "🔧 Ensuring Hermes is disabled..."
if grep -q "hermesEnabled=" android/gradle.properties; then
    sed -i 's/hermesEnabled=.*/hermesEnabled=false/g' android/gradle.properties
else
    echo "hermesEnabled=false" >> android/gradle.properties
fi
echo "✅ Hermes disabled: $(grep hermesEnabled android/gradle.properties)"

# Step 5: Navigate to android folder
cd android
chmod +x gradlew

# Step 6: Kill any existing Gradle daemons and clean
echo "🧹 Stopping Gradle daemons and cleaning build..."
./gradlew --stop 2>/dev/null || true
pkill -f gradle 2>/dev/null || true
rm -rf .gradle app/build build .cxx 2>/dev/null || true
rm -rf ~/.gradle/caches/transforms-* ~/.gradle/caches/*/fileHashes 2>/dev/null || true
./gradlew clean --no-daemon

# Step 7: Refresh Gradle dependencies
echo "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies --no-daemon

# Step 8: Generate JS bundle for Debug APK
echo "📦 Generating JS bundle for Debug..."
cd ..
mkdir -p android/app/src/main/assets
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Step 9: Build Debug APK with bundle
echo "🏗 Building Debug APK..."
cd android
./gradlew assembleDebug --no-daemon

# Step 10: Build Release APK (uses same bundle from step 8)
#echo "🔑 Building Release APK..."
#./gradlew assembleRelease --no-daemon

# Step 11: Build Release AAB (optional - uncomment if needed)
# echo "📦 Building Release AAB..."
# ./gradlew bundleRelease

# Step 12: Show output paths
echo ""
echo "✅ Build complete!"
echo "📂 Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk"
# echo "📂 Release APK: android/app/build/outputs/apk/release/app-release.apk"
# echo "📂 Release AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "To install debug APK on device: adb install android/app/build/outputs/apk/debug/app-debug.apk"