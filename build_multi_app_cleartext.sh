#!/bin/bash

# ================================================================
# Multi-App Build Script
# ✅ Handles dynamic package updates (Kotlin + Manifest)
# ✅ Configures Android cleartext policy
# ✅ Builds both Customer and Restaurant apps
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
  if ! grep -q "android:networkSecurityConfig" "$MANIFEST"; then
    sed -i.bak '/<application/a\
    android:usesCleartextTraffic="true"\
    android:networkSecurityConfig="@xml/network_security_config"' "$MANIFEST"
    print_success "Manifest updated with cleartext config"
  else
    print_warning "Cleartext policy already set"
  fi
}

# ------------------------------------------------
# Update Kotlin MainActivity package + Manifest activity path
# ------------------------------------------------
update_kotlin_package() {
  local APP_PACKAGE=$1
  local APP_PATH="android/app/src/main/java"
  local PACKAGE_DIR=$(echo "$APP_PACKAGE" | tr '.' '/')
  local MAIN_ACTIVITY="$APP_PATH/$PACKAGE_DIR/MainActivity.kt"
  local MANIFEST="android/app/src/main/AndroidManifest.xml"

  print_status "Updating Kotlin + Manifest for $APP_PACKAGE..."

  # Find MainActivity (any existing)
  local OLD_PATH=$(find "$APP_PATH" -type f -name "MainActivity.kt" | head -n 1)
  [ -z "$OLD_PATH" ] && print_error "MainActivity.kt not found" && return

  mkdir -p "$(dirname "$MAIN_ACTIVITY")"
  mv "$OLD_PATH" "$MAIN_ACTIVITY"

  # Update Kotlin package and import
  sed -i "s/^package .*/package $APP_PACKAGE/" "$MAIN_ACTIVITY"
  sed -i "s|import .*BuildConfig|import $APP_PACKAGE.BuildConfig|" "$MAIN_ACTIVITY"

  # Update AndroidManifest activity reference
  sed -i "s|android:name=\"[^\"]*MainActivity\"|android:name=\"${APP_PACKAGE}.MainActivity\"|" "$MANIFEST"

  # Sanity check
  if ! grep -q "$APP_PACKAGE" "$MAIN_ACTIVITY"; then
    print_error "Failed to set Kotlin package to $APP_PACKAGE"
  else
    print_success "Updated Kotlin + Manifest for $APP_PACKAGE"
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
  print_header "Multi-App Build Script (Dynamic Kotlin + Manifest + Cleartext)"
  [ ! -d android ] && print_error "Android folder not found — run 'npx expo prebuild' first" && exit 1

  npm install
  backup_index

  # --- Customer App ---
  print_header "BUILDING CUSTOMER APP"
  create_customer_index
  update_app_json "Customer App" "Menutha Customer" "com.menutha.customer"
  update_kotlin_package "com.menutha.customer"
  npx expo prebuild --clean
  configure_cleartext_policy
  build_app "CUSTOMER APP" "customer-release"

  # --- Restaurant App ---
  print_header "BUILDING RESTAURANT APP"
  create_restaurant_index
  update_app_json "Restaurant App" "Menutha Restaurant" "com.menutha.restaurant"
  update_kotlin_package "com.menutha.restaurant"
  npx expo prebuild --clean
  configure_cleartext_policy
  build_app "RESTAURANT APP" "restaurant-release"

  restore_index
  restore_app_json
  print_header "✅ All builds completed successfully!"
}

main
