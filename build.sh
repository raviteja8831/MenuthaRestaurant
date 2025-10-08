#!/bin/bash

# Restaurant App - Android Release Build Script
# This script builds both APK and AAB files for release

set -e  # Exit on any error

echo "=========================================="
echo "Building Restaurant App - Release"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_warning "This script is optimized for Linux. Current OS: $OSTYPE"
fi

# Step 1: Check dependencies
print_status "Checking dependencies..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

if [ ! -d "android" ]; then
    print_error "android directory not found. Please run 'npx expo prebuild' first."
    exit 1
fi

print_success "Dependencies check passed"
echo ""

# Step 2: Install/Update dependencies
print_status "Installing npm dependencies..."
npm install
print_success "Dependencies installed"
echo ""

 Step 3: Run Expo prebuild (optional, uncomment if needed)
 print_status "Running expo prebuild..."
 npx expo prebuild --clean
 print_success "Prebuild completed"
 echo ""

# Step 4: Clean previous builds
print_status "Cleaning previous build artifacts..."
cd android
./gradlew clean || print_warning "Clean task had issues but continuing..."
cd ..
print_success "Clean completed"
echo ""

# Step 5: Build Release APK
print_status "Building Release APK..."
cd android
./gradlew assembleRelease
cd ..

if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    APK_SIZE=$(du -h android/app/build/outputs/apk/release/app-release.apk | cut -f1)
    print_success "Release APK built successfully! Size: $APK_SIZE"
else
    print_error "Release APK build failed!"
    exit 1
fi
echo ""

# Step 6: Build Release AAB (App Bundle)
print_status "Building Release AAB (App Bundle)..."
cd android
./gradlew bundleRelease
cd ..

if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    AAB_SIZE=$(du -h android/app/build/outputs/bundle/release/app-release.aab | cut -f1)
    print_success "Release AAB built successfully! Size: $AAB_SIZE"
else
    print_error "Release AAB build failed!"
    exit 1
fi
echo ""

# Step 7: Display build information
echo "=========================================="
echo "Build Summary"
echo "=========================================="
print_success "All builds completed successfully!"
echo ""
echo "Build outputs:"
echo "  📱 APK: android/app/build/outputs/apk/release/app-release.apk ($APK_SIZE)"
echo "  📦 AAB: android/app/build/outputs/bundle/release/app-release.aab ($AAB_SIZE)"
echo ""
echo "Next steps:"
echo "  1. Test APK: adb install -r android/app/build/outputs/apk/release/app-release.apk"
echo "  2. Upload AAB to Google Play Console for distribution"
echo ""
print_status "Checking APK details..."
if command -v aapt &> /dev/null; then
    aapt dump badging android/app/build/outputs/apk/release/app-release.apk | grep -E "package:|versionCode|versionName|sdkVersion:|targetSdkVersion:"
else
    print_warning "aapt not found. Install Android SDK build-tools to see APK details."
fi
echo ""
echo "=========================================="
print_success "Build script completed!"
echo "=========================================="
