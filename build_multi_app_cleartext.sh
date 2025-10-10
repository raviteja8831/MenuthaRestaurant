#!/bin/bash
# ================================================================
# Multi-App Build Script (AWS Remote Ready, v9 - 2025)
# ✅ Fix: no obsolete Gradle task exclusions
# ✅ Auto reinstalls node_modules
# ✅ Adds cleartext + camera permissions
# ✅ Handles AWS remote API config
# ✅ Works with RN 0.74+ / Expo SDK 51+
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
backup_index() { [ -f "app/index.js" ] && cp app/index.js app/index.js.backup; }
restore_index() { [ -f "app/index.js.backup" ] && mv app/index.js.backup app/index.js; }
restore_app_json() { [ -f "app.json.backup" ] && mv app.json.backup app.json; }

# --- Cleartext + Camera Permissions ---
configure_manifest() {
  print_status "Ensuring cleartext + camera permissions..."
  mkdir -p android/app/src/main/res/xml
  cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true" />
</network-security-config>
EOF

  local MF="android/app/src/main/AndroidManifest.xml"
  if ! grep -q "android:usesCleartextTraffic" "$MF"; then
    sed -i '/<application/a\
    android:usesCleartextTraffic="true"' "$MF"
  fi
  if ! grep -q "android:networkSecurityConfig" "$MF"; then
    sed -i '/<application/a\
    android:networkSecurityConfig="@xml/network_security_config"' "$MF"
  fi
  if ! grep -q "android.permission.CAMERA" "$MF"; then
    sed -i '/<application/i\
    <uses-permission android:name="android.permission.CAMERA" />\
    <uses-feature android:name="android.hardware.camera" android:required="false" />\
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />' "$MF"
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

  print_status "Manual JS bundle..."
  npx react-native bundle --platform android --dev false \
    --entry-file app/index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res

  cd android
  print_status "Running Gradle assembleRelease..."
  ./gradlew clean assembleRelease
  cd ..

  mkdir -p builds
  cp android/app/build/outputs/apk/release/app-release.apk "builds/app-$OUTPUT.apk" || true

  cd android
  print_status "Running Gradle bundleRelease..."
  ./gradlew bundleRelease
  cd ..
  cp android/app/build/outputs/bundle/release/app-release.aab "builds/app-$OUTPUT.aab" || true

  print_success "$APP_TYPE build complete."
}

# --- app.json update ---
update_app_json() {
  local NAME=$1; local PKG=$2
  [ -f app.json ] && cp app.json app.json.backup
  if command -v jq &>/dev/null; then
    jq ".expo.name=\"$NAME\" | .expo.android.package=\"$PKG\"" app.json > app.json.tmp && mv app.json.tmp app.json
  else
    sed -i "s/\"name\": \".*\"/\"name\": \"$NAME\"/" app.json
    sed -i "s/\"package\": \".*\"/\"package\": \"$PKG\"/" app.json
  fi
}

# --- Customer index.js ---
create_customer_index() {
  cat > app/index.js << 'EOF'
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => { (async () => await checkAuthAndRedirect())(); }, []);
  const checkAuthAndRedirect = async () => {
    try {
      await initializeAuth();
      const authenticated = await isAuthenticated();
      if (!authenticated) return router.replace("/Customer-Login");
      const userType = await getUserType();
      router.replace(userType === USER_TYPES.CUSTOMER ? "/customer-home" : "/Customer-Login");
    } catch { router.replace("/Customer-Login"); }
    finally { setIsLoading(false); }
  };
  return (<View style={s.container}><Text style={s.text}>{isLoading ? "Loading..." : "Redirecting..."}</Text></View>);
}
const s = StyleSheet.create({container:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#a6a6e7"},text:{color:"#fff",fontSize:16}});
EOF
}

# --- Restaurant index.js ---
create_restaurant_index() {
  cat > app/index.js << 'EOF'
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isAuthenticated, getUserType, USER_TYPES, initializeAuth } from "../src/services/authService";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => { (async () => await checkAuthAndRedirect())(); }, []);
  const checkAuthAndRedirect = async () => {
    try {
      await initializeAuth();
      const authenticated = await isAuthenticated();
      if (!authenticated) return router.replace("/login");
      const userType = await getUserType();
      if (userType === USER_TYPES.MANAGER) router.replace("/dashboard");
      else if (userType === USER_TYPES.CHEF) router.replace("/chef-home");
      else router.replace("/login");
    } catch { router.replace("/login"); }
    finally { setIsLoading(false); }
  };
  return (<View style={s.container}><Text style={s.text}>{isLoading ? "Loading..." : "Redirecting..."}</Text></View>);
}
const s = StyleSheet.create({container:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#a6a6e7"},text:{color:"#fff",fontSize:16}});
EOF
}

# --- Main ---
main() {
  print_header "Menutha Multi-App Build Script (v9)"
  [ ! -d android ] && print_status "Android folder missing — running expo prebuild..." && npx expo prebuild --clean

  reinstall_node_modules
  set_remote_api_url
  backup_index

  # CUSTOMER
  print_header "CUSTOMER APP"
  create_customer_index
  update_app_json "Menutha Customer" "com.menutha.customer"
  npx expo prebuild --clean
  configure_manifest
  build_app "CUSTOMER APP" "customer-release"

  # RESTAURANT
  print_header "RESTAURANT APP"
  reinstall_node_modules
  create_restaurant_index
  update_app_json "Menutha Restaurant" "com.menutha.restaurant"
  npx expo prebuild --clean
  configure_manifest
  build_app "RESTAURANT APP" "restaurant-release"

  restore_index
  restore_app_json
  print_header "✅ All builds completed successfully with AWS Remote + Camera + Cleartext"
}

main
