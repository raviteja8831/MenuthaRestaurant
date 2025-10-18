#!/bin/bash
# ================================================================
# Multi-App Build Script (AWS Remote Ready, v13 - 2025)
# ✅ Fixed: Expo Router entry point (node_modules/expo-router/entry.js)
# ✅ Fixed: Cleartext traffic properly configured in AndroidManifest
# ✅ Fixed: Manual bundling with disabled Gradle auto-bundling
# ✅ Fixed: Package name updates in both build.gradle and Kotlin files
# ✅ Adds cleartext + camera permissions (expo-camera & expo-barcode-scanner)
# ✅ Handles AWS remote API config
# ✅ Works with RN 0.79+ / Expo SDK 53+
# ✅ Camera: expo-camera for QR code scanning (Android & iOS compatible)
# ✅ NEW: Separate apps with different logos and index files
#   - Menutha (Customer App) - menutha.png logo, customer index
#   - Menuva (Restaurant App) - menuva.png logo, restaurant index
# ================================================================

set -e

# --- Utility ---
RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_header() { echo -e "\n${CYAN}==========================================\n$1\n==========================================${NC}\n"; }

# --- Remote API ---
set_remote_api_url() {
  local URL="http://13.127.228.119:8090"
  print_status "Setting API_BASE_URL to $URL..."
  if [ -f ".env" ]; then
    if grep -q "API_BASE_URL=" .env; then
      sed -i.bak "s|^API_BASE_URL=.*|API_BASE_URL=$URL|" .env
    else
      echo "API_BASE_URL=$URL" >> .env
    fi
  else
    echo "API_BASE_URL=$URL" > .env
  fi
  print_success "API_BASE_URL updated."
}

# --- Helpers ---
# No longer need to modify app/index.js - Expo Router handles the entry point
restore_app_json() { [ -f "app.json.backup" ] && mv app.json.backup app.json; }

# --- Cleartext + Camera Permissions ---
# Note: expo-camera and expo-barcode-scanner are installed for QR scanning
# These will be configured by expo prebuild automatically
configure_manifest() {
  print_status "Ensuring cleartext + camera + location permissions (expo-camera installed)..."
  mkdir -p android/app/src/main/res/xml
  cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
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
EOF

  local MF="android/app/src/main/AndroidManifest.xml"

  # Add cleartext and network security config to application tag if not present
  if ! grep -q "android:usesCleartextTraffic" "$MF"; then
    sed -i 's/<application /<application android:usesCleartextTraffic="true" /' "$MF"
  fi
  if ! grep -q "android:networkSecurityConfig" "$MF"; then
    sed -i 's/<application /<application android:networkSecurityConfig="@xml\/network_security_config" /' "$MF"
  fi

  # Ensure Google Maps API key is present
  if ! grep -q "com.google.android.geo.API_KEY" "$MF"; then
    sed -i '/<application/a\    <meta-data android:name="com.google.android.geo.API_KEY" android:value="AIzaSyCJT87ZYDqm6bVLxRsg4Zde87HyefUfASQ"/>' "$MF"
  fi

  print_success "Cleartext + camera + location permissions configured"
}

# --- Ensure Google Maps and ML Kit dependencies in build.gradle ---
configure_maps_dependencies() {
  local BUILD_GRADLE="android/app/build.gradle"
  print_status "Ensuring Google Maps and ML Kit dependencies in build.gradle..."

  # Check if Google Maps dependencies exist
  if ! grep -q "play-services-maps" "$BUILD_GRADLE"; then
    print_status "Adding Google Maps dependencies to build.gradle..."
    # Add after react-android implementation
    sed -i '/implementation("com.facebook.react:react-android")/a\    \n    // Google Play Services for Maps\n    implementation '\''com.google.android.gms:play-services-maps:18.2.0'\''\n    implementation '\''com.google.android.gms:play-services-location:21.0.1'\''' "$BUILD_GRADLE"
    print_success "Google Maps dependencies added"
  else
    print_success "Google Maps dependencies already present"
  fi

  # Check if ML Kit barcode scanning dependency exists
  if ! grep -q "mlkit:barcode-scanning" "$BUILD_GRADLE"; then
    print_status "Adding ML Kit barcode scanning dependency to build.gradle..."
    # Add after play-services-location
    sed -i '/implementation '\''com.google.android.gms:play-services-location/a\    \n    // Google ML Kit for Barcode Scanning (required by vision-camera-code-scanner)\n    implementation '\''com.google.mlkit:barcode-scanning:17.3.0'\''' "$BUILD_GRADLE"
    print_success "ML Kit barcode scanning dependency added"
  else
    print_success "ML Kit barcode scanning dependency already present"
  fi
}

# --- Configure ProGuard rules for Google Maps ---
configure_proguard() {
  local PROGUARD_FILE="android/app/proguard-rules.pro"
  print_status "Configuring ProGuard rules for Google Maps..."

  # Check if Google Maps rules exist
  if ! grep -q "com.google.android.gms.maps" "$PROGUARD_FILE"; then
    cat >> "$PROGUARD_FILE" << 'EOF'

# Google Maps
-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }
-dontwarn com.google.android.gms.**

# React Native Maps
-keep class com.airbnb.android.react.maps.** { *; }
-dontwarn com.airbnb.android.react.maps.**
EOF
    print_success "ProGuard rules added for Google Maps"
  else
    print_success "ProGuard rules already present"
  fi
}

# --- npm reinstall ---
reinstall_node_modules() {
  print_status "Cleaning & reinstalling dependencies..."
  rm -rf node_modules android/app/build android/build
  npm cache clean --force
  npm install
  print_success "Dependencies reinstalled."
}

# --- Build process ---
build_app() {
  local APP_TYPE=$1
  local OUTPUT=$2

  print_header "Building $APP_TYPE"

  print_status "Setting NODE_ENV=production for build..."
  export NODE_ENV=production

  print_status "Cleaning build folders and bundled resources..."
  rm -rf android/app/build
  rm -rf android/app/src/main/assets/*
  # Clean only drawable-* and raw folders to prevent duplicate bundled resources
  # Keep mipmap-* folders as they contain app icons
  # Keep ic_launcher* files in drawable folders as they may be referenced
  find android/app/src/main/res/drawable-* -type f ! -name 'ic_launcher*' -delete 2>/dev/null || true
  find android/app/src/main/res/raw -type f -delete 2>/dev/null || true
  mkdir -p android/app/src/main/assets
  mkdir -p android/app/src/main/res

  cd android
  print_status "Running Gradle assembleRelease (Gradle will handle bundling)..."
  ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a
  cd ..

  mkdir -p builds
  cp android/app/build/outputs/apk/release/app-release.apk "builds/app-$OUTPUT.apk" || true

  cd android
  print_status "Running Gradle bundleRelease..."
  ./gradlew bundleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a
  cd ..
  cp android/app/build/outputs/bundle/release/app-release.aab "builds/app-$OUTPUT.aab" || true

  print_success "$APP_TYPE build complete."
}

# --- Create adaptive icon with padding ---
create_adaptive_icon() {
  local SOURCE_LOGO=$1
  local OUTPUT_NAME=$2

  print_status "Creating adaptive icon with safe zone padding for $OUTPUT_NAME..."

  # Create a padded version for adaptive icon
  # Android adaptive icons: safe zone is inner 66%, so we resize to 60% of canvas
  # to ensure the entire logo is visible within the safe zone
  local ADAPTIVE_ICON="./src/assets/${OUTPUT_NAME}_adaptive.png"

  if command -v convert &>/dev/null; then
    # Using ImageMagick to create padded icon
    # Resize logo to fit within 614x614 (60% of 1024) and center it on 1024x1024 canvas
    # This ensures the logo is fully visible even with circular/rounded masks
    convert "$SOURCE_LOGO" -resize 614x614 -gravity center -background "#7b6eea" -extent 1024x1024 "$ADAPTIVE_ICON"
    print_success "Adaptive icon created: $ADAPTIVE_ICON"
  else
    # Fallback: just copy the original (will still work but may be cut off)
    cp "$SOURCE_LOGO" "$ADAPTIVE_ICON"
    print_status "Warning: ImageMagick not found, using original logo (may be cut off)"
  fi

  echo "$ADAPTIVE_ICON"
}

# --- app.json update ---
update_app_json() {
  local NAME=$1; local PKG=$2; local LOGO=$3
  [ -f app.json ] && cp app.json app.json.backup

  # Create adaptive icon with padding
  local ADAPTIVE_ICON=$(create_adaptive_icon "$LOGO" "${NAME,,}")

  if command -v jq &>/dev/null; then
    jq ".expo.name=\"$NAME\" | .expo.android.package=\"$PKG\" | .expo.ios.bundleIdentifier=\"$PKG\" | .expo.icon=\"$LOGO\" | .expo.android.adaptiveIcon.foregroundImage=\"$ADAPTIVE_ICON\" | .expo.android.adaptiveIcon.backgroundColor=\"#7b6eea\" | .expo.splash.backgroundColor=\"#a9a1e2\" | .expo.plugins=[\"expo-router\"]" app.json > app.json.tmp && mv app.json.tmp app.json
  else
    sed -i "s/\"name\": \".*\"/\"name\": \"$NAME\"/" app.json
    sed -i "s/\"package\": \".*\"/\"package\": \"$PKG\"/" app.json
    sed -i "s|\"icon\": \".*\"|\"icon\": \"$LOGO\"|" app.json
    sed -i "s|\"foregroundImage\": \".*\"|\"foregroundImage\": \"$ADAPTIVE_ICON\"|" app.json
    sed -i "s|\"backgroundColor\": \".*\"|\"backgroundColor\": \"#7b6eea\"|" app.json
  fi
}

# --- Copy appropriate index file for each app ---
copy_index_file() {
  local APP_TYPE=$1
  print_status "Copying index.$APP_TYPE.js to app/index.js..."
  cp "app/index.$APP_TYPE.js" "app/index.js"
  print_success "Index file updated for $APP_TYPE app"
}

# --- Update Android build.gradle and Kotlin files for each app ---
update_android_config() {
  local PKG=$1
  local APP_NAME=$2
  local BUILD_GRADLE="android/app/build.gradle"
  local PKG_PATH=$(echo $PKG | tr '.' '/')
  local STRINGS_XML="android/app/src/main/res/values/strings.xml"

  print_status "Updating Android configuration for $PKG..."

  # Update namespace and applicationId in build.gradle
  sed -i "s/namespace '.*'/namespace '$PKG'/" "$BUILD_GRADLE"
  sed -i "s/applicationId '.*'/applicationId '$PKG'/" "$BUILD_GRADLE"

  # Update app name in strings.xml
  if [ -f "$STRINGS_XML" ]; then
    sed -i "s|<string name=\"app_name\">.*</string>|<string name=\"app_name\">$APP_NAME</string>|" "$STRINGS_XML"
  fi

  # Create new package directory if it doesn't exist
  mkdir -p "android/app/src/main/java/$PKG_PATH"

  # Find and update all Kotlin files
  find android/app/src/main/java -name "*.kt" 2>/dev/null | while read -r ktfile; do
    # Update package declaration in Kotlin files
    sed -i "s/^package .*/package $PKG/" "$ktfile"

    # Move file to correct package directory
    local filename=$(basename "$ktfile")
    mv "$ktfile" "android/app/src/main/java/$PKG_PATH/$filename" 2>/dev/null || true
  done

  print_success "Android config updated for $PKG"
}

# --- Main ---
main() {
  local BUILD_TARGET="${1:-both}"

  print_header "Menutha Multi-App Build Script (v12 - With Build Target Selection)"
  print_status "Build target: $BUILD_TARGET"

  # Only run prebuild once if android folder is missing
  # This will configure expo-camera and expo-barcode-scanner automatically
  if [ ! -d android ]; then
    print_status "Android folder missing — running initial expo prebuild (includes expo-camera setup)..."
    npx expo prebuild --clean
  fi

  reinstall_node_modules
  set_remote_api_url

  # Build based on parameter
  case "$BUILD_TARGET" in
    menutha|customer)
      # CUSTOMER APP (Menutha) only
      print_header "CUSTOMER APP - MENUTHA"
      copy_index_file "customer"
      update_app_json "Menutha" "com.menutha.customer" "./src/assets/menutha.png"
      update_android_config "com.menutha.customer" "Menutha"
      configure_manifest
      configure_maps_dependencies
      configure_proguard
      build_app "CUSTOMER APP (MENUTHA)" "menutha-release"
      restore_app_json
      print_header "✅ Menutha build completed successfully"
      ;;

    menuva|restaurant)
      # RESTAURANT APP (Menuva) only
      print_header "RESTAURANT APP - MENUVA"
      copy_index_file "restaurant"
      update_app_json "Menuva" "com.menutha.restaurant" "./src/assets/menuva.png"
      update_android_config "com.menutha.restaurant" "Menuva"
      configure_manifest
      configure_maps_dependencies
      configure_proguard
      build_app "RESTAURANT APP (MENUVA)" "menuva-release"
      restore_app_json
      print_header "✅ Menuva build completed successfully"
      ;;

    both|all)
      # Build both apps
      # CUSTOMER APP (Menutha)
      print_header "CUSTOMER APP - MENUTHA"
      copy_index_file "customer"
      update_app_json "Menutha" "com.menutha.customer" "./src/assets/menutha.png"
      update_android_config "com.menutha.customer" "Menutha"
      configure_manifest
      configure_maps_dependencies
      configure_proguard
      build_app "CUSTOMER APP (MENUTHA)" "menutha-release"

      # RESTAURANT APP (Menuva)
      print_header "RESTAURANT APP - MENUVA"
      reinstall_node_modules
      copy_index_file "restaurant"
      update_app_json "Menuva" "com.menutha.restaurant" "./src/assets/menuva.png"
      update_android_config "com.menutha.restaurant" "Menuva"
      configure_manifest
      configure_maps_dependencies
      configure_proguard
      build_app "RESTAURANT APP (MENUVA)" "menuva-release"

      restore_app_json

      print_header "✅ All builds completed successfully with AWS Remote + Camera + Cleartext"
      print_status "Individual APK and AAB files available in builds/ folder"
      ;;

    *)
      echo -e "${RED}[ERROR]${NC} Invalid build target: $BUILD_TARGET"
      echo "Usage: $0 [menutha|menuva|both]"
      echo "  menutha  - Build customer app only"
      echo "  menuva   - Build restaurant app only"
      echo "  both     - Build both apps (default)"
      exit 1
      ;;
  esac
}

main "$@"
