#!/bin/bash
set -euo pipefail

#!/bin/bash
set -euo pipefail

echo "🚀 FULL CLEAN: Removing node_modules and android folder for a fresh start..."

# Go to project root (where script is placed)
PROJECT_ROOT=$(pwd)

# Step 1: Remove node_modules and android folder
rm -rf $PROJECT_ROOT/node_modules
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
npm cache clean --force

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

# Step 5: Refresh Gradle dependencies
echo "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies

# Step 6: Build Debug APK
echo "🏗 Building Debug APK..."
./gradlew assembleDebug

# Step 7: Build Release APK + AAB
echo "🔑 Building Release APK and AAB..."
# ./gradlew assembleRelease
#./gradlew bundleRelease

# Step 8: Show output paths
echo ""
echo "✅ Build complete!"
echo "📂 Debug APK:   app/build/outputs/apk/debug/app-debug.apk"
echo "📂 Release APK: app/build/outputs/apk/release/app-release.apk"
echo "📂 Release AAB: app/build/outputs/bundle/release/app-release.aab"


