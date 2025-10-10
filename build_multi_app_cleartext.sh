#!/bin/bash

# ================================================================
# Multi-App Build Script (AWS Remote Ready, v4 - 2025)
# ✅ Removes deprecated react.gradle after prebuild
# ✅ Bundles JS manually (modern RN compatible)
# ✅ Ensures cleartext + camera permissions
# ✅ Builds Customer + Restaurant apps for AWS
# ================================================================

set -e

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_header() { echo -e "\n${CYAN}==========================================\n$1\n==========================================${NC}\n"; }

# ------------------------------------------------
# Remote API setup (AWS)
# ------------------------------------------------
set_remote_api_url() {
  local REMOTE_URL="http://13.127.228.119:8090"
  print_status "Setting API_BASE_URL to AWS remote endpoint..."

  if [ -f ".env" ]; then
    if grep -q "API_BASE_URL=" .env; then
      sed -i.bak "s|^API_BASE_URL=.*|API_BASE_URL=${REMOTE_URL}|" .env
    else
      echo "API_BASE_URL=${REMOTE_URL}" >> .env
    fi
  else
    echo "API_BASE_URL=${REMOTE_URL}" > .env
  fi

  if [ -f "src/config/api.js" ]; then
    sed -i.bak "s|http[s]*://[^\"']*|${REMOTE_URL}|g" src/config/api.js
  fi

  print_success "API_BASE_URL set to ${REMOTE_URL}"
}

# ------------------------------------------------
# Helper: Backup & Restore
# ------------------------------------------------
backup_index() { [ -f "app/index.js" ] && cp app/index.js app/index.js.backup && print_success "Backed up index.js"; }
restore_index() { [ -f "app/index.js.backup" ] && mv app/index.js.backup app/index.js && print_success "Restored index.js"; }
restore_app_json() { [ -f "app.json.backup" ] && mv app.json.backup app.json && print_success "Restored app.json"; }

# ------------------------------------------------
# Create Customer index.js
# ------------------------------------------------
create_customer_index() {
  print_status "Creating Customer index.js..."
  cat > app/index.js << 'EOF'
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("INDEX: Starting authentication check [CUSTOMER APP]");
    (async () => await checkAuthAndRedirect())();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const initResult = await initializeAuth();
      const authenticated = await isAuthenticated();
      if (!authenticated || !initResult) {
        router.replace("/Customer-Login");
        return;
      }
      const userType = await getUserType();
      if (userType === USER_TYPES.CUSTOMER) router.replace("/customer-home");
      else router.replace("/Customer-Login");
    } catch (e) {
      console.error(e);
      router.replace("/Customer-Login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>{isLoading ? "Loading Customer App..." : "Redirecting..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#a6a6e7" },
  loadingText: { fontSize: 16, color: "#fff", fontWeight: "500" },
});
EOF
  print_success "Customer index.js created"
}

# ------------------------------------------------
# Create Restaurant index.js
# ------------------------------------------------
create_restaurant_index() {
  print_status "Creating Restaurant index.js..."
  cat > app/index.js << 'EOF'
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("INDEX: Starting authentication check [RESTAURANT APP]");
    (async () => await checkAuthAndRedirect())();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const initResult = await initializeAuth();
      const authenticated = await isAuthenticated();
      if (!authenticated || !initResult) {
        router.replace("/login");
        return;
      }
      const userType = await getUserType();
      if (userType === USER_TYPES.MANAGER) router.replace("/dashboard");
      else if (userType === USER_TYPES.CHEF) router.replace("/chef-home");
      else router.replace("/login");
    } catch (e) {
      console.error(e);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>{isLoading ? "Loading Restaurant App..." : "Redirecting..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#a6a6e7" },
  loadingText: { fontSize: 16, color: "#fff", fontWeight: "500" },
});
EOF
  print_success "Restaurant index.js created"
}

# ------------------------------------------------
# Remove legacy react.gradle (fix modern RN)
# ------------------------------------------------
remove_legacy_react_gradle() {
  local GRADLE_FILE="android/app/build.gradle"
  if grep -q "react.gradle" "$GRADLE_FILE"; then
    sed -i '/react.gradle/d' "$GRADLE_FILE"
    print_warning "Removed deprecated react.gradle reference from app/build.gradle"
  fi
}

# ------------------------------------------------
# Configure Android cleartext policy
# ------------------------------------------------
configure_cleartext_policy() {
  print_status "Configuring cleartext network policy..."
  mkdir -p android/app/src/main/res/xml
  cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true" />
</network-security-config>
EOF
  local MANIFEST="android/app/src/main/AndroidManifest.xml"
  if ! grep -q "android:usesCleartextTraffic" "$MANIFEST"; then
    sed -i.bak '/<application/a\
    android:usesCleartextTraffic="true"' "$MANIFEST"
  fi
  if ! grep -q "android:networkSecurityConfig" "$MANIFEST"; then
    sed -i.bak '/<application/a\
    android:networkSecurityConfig="@xml/network_security_config"' "$MANIFEST"
  fi
  print_success "Manifest ensured for cleartext access"
}

# ------------------------------------------------
# Ensure Camera permissions (for scanner module)
# ------------------------------------------------
ensure_camera_permission() {
  print_status "Ensuring CAMERA permission in manifest..."
  local MANIFEST="android/app/src/main/AndroidManifest.xml"

  # Insert camera permission if missing
  if ! grep -q "android.permission.CAMERA" "$MANIFEST"; then
    sed -i '/<application/i\
    <uses-permission android:name="android.permission.CAMERA" />\
    <uses-feature android:name="android.hardware.camera" android:required="false" />\
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />' "$MANIFEST"
    print_success "Added CAMERA permission + features"
  else
    print_status "Camera permissions already exist"
  fi
}

# ------------------------------------------------
# Update app.json
# ------------------------------------------------
update_app_json() {
  local APP_TYPE=$1
  local APP_NAME=$2
  local PACKAGE_NAME=$3
  print_status "Updating app.json for $APP_TYPE..."
  [ -f "app.json" ] && cp app.json app.json.backup
  if command -v jq &> /dev/null; then
    jq ".expo.name = \"$APP_NAME\" | .expo.android.package = \"$PACKAGE_NAME\"" app.json > app.json.tmp && mv app.json.tmp app.json
  else
    sed -i.bak "s/\"name\": \".*\"/\"name\": \"$APP_NAME\"/" app.json
    sed -i.bak "s/\"package\": \".*\"/\"package\": \"$PACKAGE_NAME\"/" app.json
  fi
  print_success "Updated app.json -> $APP_NAME ($PACKAGE_NAME)"
}

# ------------------------------------------------
# Build function
# ------------------------------------------------
build_app() {
  local APP_TYPE=$1
  local OUTPUT_SUFFIX=$2
  print_header "Building $APP_TYPE"
  remove_legacy_react_gradle
  mkdir -p android/app/src/main/assets android/app/src/main/res

  print_status "Bundling JS manually..."
  npx react-native bundle --platform android --dev false \
    --entry-file app/index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res

  cd android && ./gradlew clean || print_warning "Gradle clean warning"; cd ..
  cd android && ./gradlew assembleRelease; cd ..
  mkdir -p builds
  cp android/app/build/outputs/apk/release/app-release.apk "builds/app-$OUTPUT_SUFFIX.apk" || print_error "$APP_TYPE APK build failed"
  cd android && ./gradlew bundleRelease; cd ..
  cp android/app/build/outputs/bundle/release/app-release.aab "builds/app-$OUTPUT_SUFFIX.aab" || print_error "$APP_TYPE AAB build failed"
}

# ------------------------------------------------
# Main
# ------------------------------------------------
main() {
  print_header "Multi-App Build Script (AWS Remote Enabled - v4)"
  [ ! -d android ] && print_error "Android folder not found — run 'npx expo prebuild' first" && exit 1

  npm install
  backup_index
  set_remote_api_url

  # --- CUSTOMER APP ---
  print_header "BUILDING CUSTOMER APP"
  create_customer_index
  update_app_json "Customer App" "Menutha Customer" "com.menutha.customer"
  npx expo prebuild --clean
  remove_legacy_react_gradle
  configure_cleartext_policy
  ensure_camera_permission
  build_app "CUSTOMER APP" "customer-release"

  # --- RESTAURANT APP ---
  print_header "BUILDING RESTAURANT APP"
  create_restaurant_index
  update_app_json "Restaurant App" "Menutha Restaurant" "com.menutha.restaurant"
  npx expo prebuild --clean
  remove_legacy_react_gradle
  configure_cleartext_policy
  ensure_camera_permission
  build_app "RESTAURANT APP" "restaurant-release"

  restore_index
  restore_app_json
  print_header "✅ All builds completed successfully with AWS Remote URL and Camera Permissions"
}

main
