#!/bin/bash

# Restaurant App - Multi-App Build Script (with HTTP cleartext policy setup)
# Builds separate APKs and AABs for Customer and Restaurant apps

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Utility functions
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_header() {
  echo ""; echo -e "${CYAN}==========================================";
  echo -e "$1"; echo -e "==========================================${NC}"; echo "";
}

# Backup and restore index.js
backup_index() { [ -f "app/index.js" ] && cp app/index.js app/index.js.backup && print_success "Backed up original index.js"; }
restore_index() { [ -f "app/index.js.backup" ] && mv app/index.js.backup app/index.js && print_success "Restored original index.js"; }

# Create Customer App index.js
create_customer_index() {
  print_status "Creating Customer App index.js..."
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
    (async () => {
      await checkAuthAndRedirect();
    })();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      console.log("INDEX: calling initializeAuth() [CUSTOMER APP]");
      const initResult = await initializeAuth();
      const authenticated = await isAuthenticated();
      console.log("INDEX: isAuthenticated ->", authenticated);
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
  print_success "Created Customer App index.js"
}

# Create Restaurant App index.js
create_restaurant_index() {
  print_status "Creating Restaurant App index.js..."
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
    (async () => {
      await checkAuthAndRedirect();
    })();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      console.log("INDEX: calling initializeAuth() [RESTAURANT APP]");
      const initResult = await initializeAuth();
      const authenticated = await isAuthenticated();
      console.log("INDEX: isAuthenticated ->", authenticated);
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
  print_success "Created Restaurant App index.js"
}

# 🆕 Configure Android HTTP cleartext policy
configure_cleartext_policy() {
  print_status "Configuring Android cleartext network policy..."
  mkdir -p android/app/src/main/res/xml
  cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">13.127.228.119</domain>
  </domain-config>
</network-security-config>
EOF

  MANIFEST_FILE="android/app/src/main/AndroidManifest.xml"
  if ! grep -q "android:networkSecurityConfig" "$MANIFEST_FILE"; then
    print_status "Updating AndroidManifest.xml to include networkSecurityConfig..."
    sed -i.bak '/<application/a\
    android:usesCleartextTraffic="true"\
    android:networkSecurityConfig="@xml/network_security_config"' "$MANIFEST_FILE"
    print_success "AndroidManifest.xml updated successfully"
  else
    print_warning "Network security config already set in AndroidManifest.xml"
  fi
}

# Update app.json
update_app_json() {
  local APP_TYPE=$1
  local APP_NAME=$2
  local PACKAGE_NAME=$3
  print_status "Updating app.json for $APP_TYPE..."
  [ -f "app.json" ] && cp app.json app.json.backup
  if command -v jq &> /dev/null; then
    jq ".expo.name = \"$APP_NAME\" | .expo.android.package = \"$PACKAGE_NAME\"" app.json > app.json.tmp && mv app.json.tmp app.json
  else
    print_warning "jq not found, using sed replacement"
    sed -i.bak "s/\"name\": \".*\"/\"name\": \"$APP_NAME\"/" app.json
    sed -i.bak "s/\"package\": \".*\"/\"package\": \"$PACKAGE_NAME\"/" app.json
  fi
  print_success "Updated app.json for $APP_TYPE"
}

restore_app_json() { [ -f "app.json.backup" ] && mv app.json.backup app.json && print_success "Restored original app.json"; }

# Build function
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

# Main
main() {
  print_header "Multi-App Build Script (with cleartext policy)"
  [ ! -d android ] && print_error "Android directory not found. Run 'npx expo prebuild' first" && exit 1
  npm install
  backup_index

  # Build Customer App
  print_header "BUILDING CUSTOMER APP"
  create_customer_index
  update_app_json "Customer App" "Menutha Customer" "com.menutha.customer"
  print_status "Applying network security config for Customer App..."
  configure_cleartext_policy
  npx expo prebuild --clean
  build_app "CUSTOMER APP" "customer-release"

  # Build Restaurant App
  print_header "BUILDING RESTAURANT APP"
  create_restaurant_index
  update_app_json "Restaurant App" "Menutha Restaurant" "com.menutha.restaurant"
  print_status "Applying network security config for Restaurant App..."
  configure_cleartext_policy
  npx expo prebuild --clean
  build_app "RESTAURANT APP" "restaurant-release"

  restore_index
  restore_app_json
  print_header "All builds completed successfully!"
}

main