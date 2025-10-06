#!/bin/bash
set -euo pipefail

#!/bin/bash
set -euo pipefail

echo "🚀 FULL CLEAN: Removing node_modules and android folder for a fresh start..."

# Go to project root (where script is placed)
PROJECT_ROOT=$(pwd)

# Step 1: Remove node_modules and android folder (ignore errors if files are locked)
rm -rf $PROJECT_ROOT/node_modules || true
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/haste-* || true
npm cache clean --force || true

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install


# Step 3: Prompt for app name and update app.json
# read -p "Enter the app name to use (default: Menutha): " APPNAME
# APPNAME=${APPNAME:-Menutha}
# echo "Updating app.json with app name: $APPNAME"
# if [ -f "$PROJECT_ROOT/app.json" ]; then
# 	# Use jq if available, else fallback to sed
# 	if command -v jq &> /dev/null; then
# 		cat $PROJECT_ROOT/app.json | jq --arg name "$APPNAME" '.expo.name = $name' > $PROJECT_ROOT/app.tmp.json && mv $PROJECT_ROOT/app.tmp.json $PROJECT_ROOT/app.json
# 	else
# 		sed -i.bak "s/\("name"\): ".*"/\1: \"$APPNAME\"/" $PROJECT_ROOT/app.json
# 	fi
# fi

# Step 4: Regenerate android folder using Expo prebuild
# echo "🔄 Regenerating android folder with expo prebuild..."
# npx expo prebuild

# # Step 4: Build Android app only (no emulator)
# echo "🏗 Building Android app (no emulator)..."
# npx expo prebuild --platform android
cd android
chmod +x gradlew

# Step 4: Clean Android build
echo "🧹 Cleaning Android build..."
./gradlew clean
rm -rf .gradle app/build build .cxx
# Step 5: Copy network security config
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
# Step 5: Refresh Gradle dependencies
echo "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies

# Step 7: Build Debug APK
echo "🏗 Building Debug APK..."
./gradlew assembleDebug

# Step 8: Build Release APK + AAB
echo "🔑 Building Release APK and AAB..."
./gradlew assembleRelease
./gradlew bundleRelease

# Step 9: Show output paths
echo ""
echo "✅ Build complete!"
echo "📂 Debug APK:   app/build/outputs/apk/debug/app-debug.apk"
echo "📂 Release APK: app/build/outputs/apk/release/app-release.apk"
echo "📂 Release AAB: app/build/outputs/bundle/release/app-release.aab"


