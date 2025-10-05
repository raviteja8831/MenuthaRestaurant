#!/bin/bash

# APK Build Script for Linux/macOS
# Usage: ./build-apk.sh [debug|release]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_TYPE=${1:-debug}
PROJECT_NAME="ft"
OUTPUT_DIR="./build-output"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🚀 Starting APK build process...${NC}"
echo -e "${BLUE}Build Type: ${BUILD_TYPE}${NC}"
echo -e "${BLUE}Timestamp: ${TIMESTAMP}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Check if Android directory exists
if [ ! -d "android" ]; then
    echo -e "${YELLOW}Android directory not found. Running prebuild...${NC}"
    npx expo prebuild --platform android
    print_status "Prebuild completed"
fi

# Clean previous builds
echo -e "${BLUE}Cleaning previous builds...${NC}"
cd android

# Clean with Gradle
if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${BLUE}Cleaning for release build...${NC}"
    ./gradlew clean
else
    echo -e "${BLUE}Cleaning for debug build...${NC}"
    ./gradlew clean
fi

print_status "Gradle clean completed"

# Build APK
echo -e "${BLUE}Building ${BUILD_TYPE} APK...${NC}"

if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${YELLOW}Building release APK (requires signing configuration)...${NC}"
    ./gradlew assembleRelease

    # Find the release APK
    RELEASE_APK=$(find . -name "*-release.apk" | head -1)
    if [ -n "$RELEASE_APK" ]; then
        APK_PATH="$RELEASE_APK"
        OUTPUT_NAME="${PROJECT_NAME}-release-${TIMESTAMP}.apk"
    else
        print_error "Release APK not found!"
        exit 1
    fi
else
    echo -e "${BLUE}Building debug APK...${NC}"
    ./gradlew assembleDebug

    # Find the debug APK
    DEBUG_APK=$(find . -name "*-debug.apk" | head -1)
    if [ -n "$DEBUG_APK" ]; then
        APK_PATH="$DEBUG_APK"
        OUTPUT_NAME="${PROJECT_NAME}-debug-${TIMESTAMP}.apk"
    else
        print_error "Debug APK not found!"
        exit 1
    fi
fi

print_status "APK build completed"

# Copy APK to output directory
cd ..
cp "${APK_PATH}" "${OUTPUT_DIR}/${OUTPUT_NAME}"

# Create latest symlink
ln -sf "${OUTPUT_NAME}" "${OUTPUT_DIR}/${PROJECT_NAME}-${BUILD_TYPE}-latest.apk"

print_status "APK copied to: ${OUTPUT_DIR}/${OUTPUT_NAME}"

# Get APK info
APK_SIZE=$(du -h "${OUTPUT_DIR}/${OUTPUT_NAME}" | cut -f1)
echo -e "${GREEN}📦 APK Size: ${APK_SIZE}${NC}"

# Optional: Install APK if device/emulator is connected
if command -v adb >/dev/null 2>&1; then
    DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
    if [ "$DEVICES" -gt 0 ]; then
        echo -e "${BLUE}Android device/emulator detected${NC}"
        read -p "Install APK now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Installing APK...${NC}"
            adb install -r "${OUTPUT_DIR}/${OUTPUT_NAME}"
            print_status "APK installed successfully"
        fi
    fi
fi

echo -e "${GREEN}🎉 Build process completed successfully!${NC}"
echo -e "${GREEN}APK Location: ${OUTPUT_DIR}/${OUTPUT_NAME}${NC}"
echo -e "${GREEN}Latest APK: ${OUTPUT_DIR}/${PROJECT_NAME}-${BUILD_TYPE}-latest.apk${NC}"

# Show build summary
echo -e "\n${BLUE}📋 Build Summary:${NC}"
echo -e "  Project: ${PROJECT_NAME}"
echo -e "  Build Type: ${BUILD_TYPE}"
echo -e "  Timestamp: ${TIMESTAMP}"
echo -e "  Size: ${APK_SIZE}"
echo -e "  Output: ${OUTPUT_DIR}/${OUTPUT_NAME}"