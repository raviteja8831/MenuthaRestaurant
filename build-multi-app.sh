#!/bin/bash

# Restaurant App - Multi-App Build Script
# This script builds separate APKs and AABs for Customer and Restaurant apps

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}=========================================="
    echo -e "$1"
    echo -e "==========================================${NC}"
    echo ""
}

# Backup original index.js
backup_index() {
    if [ -f "app/index.js" ]; then
        cp app/index.js app/index.js.backup
        print_success "Backed up original index.js"
    fi
}

# Restore original index.js
restore_index() {
    if [ -f "app/index.js.backup" ]; then
        mv app/index.js.backup app/index.js
        print_success "Restored original index.js"
    fi
}

# Create Customer App index.js
create_customer_index() {
    print_status "Creating Customer App index.js..."
    cat > app/index.js << 'EOF'
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  isAuthenticated,
  getUserType,
  validateAndRefreshToken,
  USER_TYPES,
  initializeAuth,
} from "../src/services/authService";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("INDEX: Starting authentication check [CUSTOMER APP]");
    let didFinish = false;

    const timeout = setTimeout(() => {
      if (!didFinish) {
        console.warn(
          "INDEX: Auth check timed out, redirecting to Customer-Login"
        );
        try {
          router.replace("/Customer-Login");
        } catch (e) {
          console.error(
            "INDEX: router.replace failed during timeout redirect",
            e
          );
        }
        setIsLoading(false);
      }
    }, 8000);

    (async () => {
      await checkAuthAndRedirect();
      didFinish = true;
      clearTimeout(timeout);
    })();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      setIsLoading(true);

      console.log("INDEX: calling initializeAuth() [CUSTOMER APP]");
      const initResult = await initializeAuth();
      console.log("INDEX: initializeAuth result:", initResult);

      const authenticated = await isAuthenticated();
      console.log("INDEX: isAuthenticated ->", authenticated);

      if (!authenticated || !initResult) {
        console.log("Not authenticated, redirecting to Customer-Login");
        router.replace("/Customer-Login");
        return;
      }

      const userType = await getUserType();
      console.log("User authenticated, userType:", userType);

      // Customer app only allows CUSTOMER user type
      if (userType === USER_TYPES.CUSTOMER) {
        router.replace("/customer-home");
      } else {
        console.log("Non-customer user type, redirecting to Customer-Login");
        router.replace("/Customer-Login");
      }
    } catch (error) {
      console.error("Error checking auth on app start:", error);
      router.replace("/Customer-Login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Customer App...</Text>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a6a6e7",
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
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
import {
  isAuthenticated,
  getUserType,
  validateAndRefreshToken,
  USER_TYPES,
  initializeAuth,
} from "../src/services/authService";

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("INDEX: Starting authentication check [RESTAURANT APP]");
    let didFinish = false;

    const timeout = setTimeout(() => {
      if (!didFinish) {
        console.warn(
          "INDEX: Auth check timed out, redirecting to login"
        );
        try {
          router.replace("/login");
        } catch (e) {
          console.error(
            "INDEX: router.replace failed during timeout redirect",
            e
          );
        }
        setIsLoading(false);
      }
    }, 8000);

    (async () => {
      await checkAuthAndRedirect();
      didFinish = true;
      clearTimeout(timeout);
    })();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      setIsLoading(true);

      console.log("INDEX: calling initializeAuth() [RESTAURANT APP]");
      const initResult = await initializeAuth();
      console.log("INDEX: initializeAuth result:", initResult);

      const authenticated = await isAuthenticated();
      console.log("INDEX: isAuthenticated ->", authenticated);

      if (!authenticated || !initResult) {
        console.log("Not authenticated, redirecting to login");
        router.replace("/login");
        return;
      }

      const userType = await getUserType();
      console.log("User authenticated, userType:", userType);

      // Restaurant app handles MANAGER and CHEF user types
      if (userType === USER_TYPES.MANAGER) {
        router.replace("/dashboard");
      } else if (userType === USER_TYPES.CHEF) {
        router.replace("/chef-home");
      } else {
        console.log("Invalid user type for restaurant app, redirecting to login");
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error checking auth on app start:", error);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Restaurant App...</Text>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a6a6e7",
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});
EOF
    print_success "Created Restaurant App index.js"
}

# Update app.json for specific app
update_app_json() {
    local APP_TYPE=$1
    local APP_NAME=$2
    local PACKAGE_NAME=$3

    print_status "Updating app.json for $APP_TYPE..."

    # Backup original app.json
    if [ -f "app.json" ]; then
        cp app.json app.json.backup
    fi

    # Update app.json with jq if available, otherwise use sed
    # IMPORTANT: Preserve the 'extra' config which contains API_BASE_URL and IMG_BASE_URL
    if command -v jq &> /dev/null; then
        jq ".expo.name = \"$APP_NAME\" |
            .expo.android.package = \"$PACKAGE_NAME\" |
            .expo.extra.API_BASE_URL = \"http://13.127.228.119:8090/api\" |
            .expo.extra.IMG_BASE_URL = \"http://13.127.228.119:8090/\"" app.json > app.json.tmp && mv app.json.tmp app.json
    else
        print_warning "jq not found, using basic sed replacement"
        sed -i.bak "s/\"name\": \".*\"/\"name\": \"$APP_NAME\"/" app.json
        sed -i.bak "s/\"package\": \".*\"/\"package\": \"$PACKAGE_NAME\"/" app.json
    fi

    print_success "Updated app.json for $APP_TYPE"
}

# Restore app.json
restore_app_json() {
    if [ -f "app.json.backup" ]; then
        mv app.json.backup app.json
        print_success "Restored original app.json"
    fi
}

# Patch MainActivity.kt to disable Fabric (expo-camera compatibility fix)
patch_mainactivity() {
    local PACKAGE_PATH=$1
    local MAIN_ACTIVITY_PATH="android/app/src/main/java/${PACKAGE_PATH//./\/}/MainActivity.kt"

    print_status "Patching MainActivity.kt to disable Fabric..."

    if [ -f "$MAIN_ACTIVITY_PATH" ]; then
        # Replace BuildConfig.IS_NEW_ARCHITECTURE_ENABLED with false
        sed -i 's/BuildConfig\.IS_NEW_ARCHITECTURE_ENABLED/false/' "$MAIN_ACTIVITY_PATH"

        # Also ensure the second parameter in DefaultReactActivityDelegate is false
        sed -i 's/fabricEnabled = true/fabricEnabled = false/' "$MAIN_ACTIVITY_PATH"
        sed -i 's/fabricEnabled/false/' "$MAIN_ACTIVITY_PATH"

        print_success "MainActivity.kt patched successfully"
    else
        print_warning "MainActivity.kt not found at $MAIN_ACTIVITY_PATH"
    fi
}

# Build function
build_app() {
    local APP_TYPE=$1
    local OUTPUT_SUFFIX=$2

    print_header "Building $APP_TYPE"

    print_status "Cleaning previous builds..."
    cd android
    ./gradlew clean || print_warning "Clean had issues but continuing..."
    cd ..

    print_status "Building Release APK for $APP_TYPE..."
    cd android
    ./gradlew assembleRelease
    cd ..

    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        mkdir -p builds
        cp android/app/build/outputs/apk/release/app-release.apk "builds/app-$OUTPUT_SUFFIX.apk"
        APK_SIZE=$(du -h "builds/app-$OUTPUT_SUFFIX.apk" | cut -f1)
        print_success "$APP_TYPE APK built: builds/app-$OUTPUT_SUFFIX.apk ($APK_SIZE)"
    else
        print_error "$APP_TYPE APK build failed!"
        return 1
    fi

    print_status "Building Release AAB for $APP_TYPE..."
    cd android
    ./gradlew bundleRelease
    cd ..

    if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
        cp android/app/build/outputs/bundle/release/app-release.aab "builds/app-$OUTPUT_SUFFIX.aab"
        AAB_SIZE=$(du -h "builds/app-$OUTPUT_SUFFIX.aab" | cut -f1)
        print_success "$APP_TYPE AAB built: builds/app-$OUTPUT_SUFFIX.aab ($AAB_SIZE)"
    else
        print_error "$APP_TYPE AAB build failed!"
        return 1
    fi
}

# Main script execution
main() {
    print_header "Multi-App Build Script for Restaurant System"

    # Check dependencies
    print_status "Checking dependencies..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    if [ ! -d "android" ]; then
        print_error "android directory not found. Run 'npx expo prebuild' first"
        exit 1
    fi

    print_success "Dependencies check passed"

    # Install npm dependencies
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed"

    # Create builds directory
    mkdir -p builds

    # Backup original files
    backup_index

    # Build Customer App
    print_header "BUILDING CUSTOMER APP"
    create_customer_index
    update_app_json "Customer App" "Menutha Customer" "com.menutha.customer"

    # Run expo prebuild for customer app
    print_status "Running expo prebuild for Customer App..."
    npx expo prebuild --clean

    # Patch MainActivity.kt to disable Fabric
    patch_mainactivity "com.menutha.customer"

    if build_app "CUSTOMER APP" "customer-release"; then
        print_success "Customer App built successfully!"
    else
        print_error "Customer App build failed!"
        restore_index
        restore_app_json
        exit 1
    fi

    # Build Restaurant App
    print_header "BUILDING RESTAURANT APP"
    create_restaurant_index
    update_app_json "Restaurant App" "Menutha Restaurant" "com.menutha.restaurant"

    # Run expo prebuild for restaurant app
    print_status "Running expo prebuild for Restaurant App..."
    npx expo prebuild --clean

    # Patch MainActivity.kt to disable Fabric
    patch_mainactivity "com.menutha.restaurant"

    if build_app "RESTAURANT APP" "restaurant-release"; then
        print_success "Restaurant App built successfully!"
    else
        print_error "Restaurant App build failed!"
        restore_index
        restore_app_json
        exit 1
    fi

    # Restore original files
    restore_index
    restore_app_json

    # Final summary
    print_header "BUILD SUMMARY"
    print_success "All builds stacompleted successfully!"
    echo ""
    echo "Customer App builds:"
    echo "  📱 APK: builds/app-customer-release.apk"
    echo "  📦 AAB: builds/app-customer-release.aab"
    echo ""
    echo "Restaurant App builds:"
    echo "  📱 APK: builds/app-restaurant-release.apk"
    echo "  📦 AAB: builds/app-restaurant-release.aab"
    echo ""
    echo "Next steps:"
    echo "  1. Test Customer APK: adb install -r builds/app-customer-release.apk"
    echo "  2. Test Restaurant APK: adb install -r builds/app-restaurant-release.apk"
    echo "  3. Upload AABs to Google Play Console"
    echo ""
    print_header "Build script completed!"
}

# Run main function
main
