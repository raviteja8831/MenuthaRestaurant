#!/bin/bash
set -euo pipefail

echo "🚀 Menutha APK Build Script for AWS Linux"
echo "=========================================="

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Get project root directory
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$PROJECT_ROOT"

log "Starting in directory: $PROJECT_ROOT"

# Check for required tools
log "🔍 Checking system requirements..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 18+ first."
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
log "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    error "npm is not installed."
fi

log "npm version: $(npm --version)"

# Check Java
if ! command -v java &> /dev/null; then
    error "Java is not installed. Please install OpenJDK 17."
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1)
log "Java version: $JAVA_VERSION"

# Check if JAVA_HOME is set
if [ -z "${JAVA_HOME:-}" ]; then
    warn "JAVA_HOME is not set. Attempting to auto-detect..."
    # Try to find Java installation
    if [ -d "/usr/lib/jvm/java-17-openjdk" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
        log "Set JAVA_HOME to: $JAVA_HOME"
    elif [ -d "/usr/lib/jvm/java-17-amazon-corretto" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-17-amazon-corretto"
        log "Set JAVA_HOME to: $JAVA_HOME"
    else
        error "Could not auto-detect JAVA_HOME. Please set it manually."
    fi
else
    log "JAVA_HOME: $JAVA_HOME"
fi

# Check Android SDK
if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
    warn "ANDROID_HOME/ANDROID_SDK_ROOT not set. Checking common locations..."

    # Common Android SDK locations on Linux
    ANDROID_LOCATIONS=(
        "$HOME/Android/Sdk"
        "/opt/android-sdk"
        "/usr/local/android-sdk"
        "/opt/android-sdk-linux"
    )

    for location in "${ANDROID_LOCATIONS[@]}"; do
        if [ -d "$location" ]; then
            export ANDROID_HOME="$location"
            export ANDROID_SDK_ROOT="$location"
            log "Found Android SDK at: $location"
            break
        fi
    done

    if [ -z "${ANDROID_HOME:-}" ]; then
        error "Android SDK not found. Please install Android SDK and set ANDROID_HOME."
    fi
else
    log "Android SDK: ${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
fi

# Add Android tools to PATH
export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# Function to install system dependencies on AWS Linux/Amazon Linux
install_aws_dependencies() {
    log "🔧 Installing system dependencies for AWS Linux..."

    # Detect Linux distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    fi

    log "Detected OS: $OS"

    # Install dependencies based on OS
    if [[ "$OS" == *"Amazon Linux"* ]]; then
        sudo yum update -y
        sudo yum install -y git curl wget unzip

        # Install Node.js if not present
        if ! command -v node &> /dev/null; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        fi

        # Install Java 17 if not present
        if ! command -v java &> /dev/null; then
            sudo yum install -y java-17-amazon-corretto java-17-amazon-corretto-devel
            export JAVA_HOME="/usr/lib/jvm/java-17-amazon-corretto"
        fi

    elif [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt update
        sudo apt install -y git curl wget unzip build-essential

        # Install Node.js if not present
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt install -y nodejs
        fi

        # Install Java 17 if not present
        if ! command -v java &> /dev/null; then
            sudo apt install -y openjdk-17-jdk
            export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
        fi
    fi
}

# Install dependencies if flag is passed
if [[ "${1:-}" == "--install-deps" ]]; then
    install_aws_dependencies
fi

# Step 1: Clean previous builds
log "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json yarn.lock
rm -rf android/app/build android/build android/.gradle android/.cxx
rm -rf $TMPDIR/react-* $TMPDIR/metro-* $TMPDIR/haste-* 2>/dev/null || true
npm cache clean --force

# Step 2: Install dependencies
log "📦 Installing npm dependencies..."
npm install

# Step 3: Install Expo CLI globally if not present
if ! command -v expo &> /dev/null; then
    log "📱 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

# Step 4: Generate Android project if not exists or if forced
if [ ! -d "android" ] || [[ "${1:-}" == "--prebuild" ]]; then
    log "🔄 Generating Android project with expo prebuild..."
    npx expo prebuild --platform android --clear
fi

# Step 5: Set up Android build
log "🔧 Setting up Android build environment..."
cd android

# Make gradlew executable
chmod +x gradlew

# Create local.properties file for Android SDK path
log "📝 Creating local.properties..."
cat > local.properties << EOF
sdk.dir=$ANDROID_HOME
EOF

# Step 6: Clean and prepare Gradle
log "🧹 Cleaning Gradle build..."
./gradlew clean

log "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies

# Step 7: Build Debug APK
log "🏗️  Building Debug APK..."
./gradlew assembleDebug

# Step 8: Build Release APK (optional)
if [[ "${BUILD_RELEASE:-false}" == "true" ]]; then
    log "🔑 Building Release APK..."
    ./gradlew assembleRelease

    log "📦 Building Release AAB..."
    ./gradlew bundleRelease
fi

# Step 9: Show build results
cd "$PROJECT_ROOT"
log "✅ Build completed successfully!"

echo ""
echo "📂 Build Outputs:"
echo "===================="

if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    DEBUG_SIZE=$(du -h android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo "✅ Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk ($DEBUG_SIZE)"
else
    echo "❌ Debug APK: Not found"
fi

if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    RELEASE_SIZE=$(du -h android/app/build/outputs/apk/release/app-release.apk | cut -f1)
    echo "✅ Release APK: android/app/build/outputs/apk/release/app-release.apk ($RELEASE_SIZE)"
fi

if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    AAB_SIZE=$(du -h android/app/build/outputs/bundle/release/app-release.aab | cut -f1)
    echo "✅ Release AAB: android/app/build/outputs/bundle/release/app-release.aab ($AAB_SIZE)"
fi

echo ""
echo "🚀 Usage Instructions:"
echo "======================"
echo "For AWS Linux setup:"
echo "  ./rebuild.sh --install-deps    # Install system dependencies"
echo "  ./rebuild.sh --prebuild        # Force regenerate android folder"
echo "  BUILD_RELEASE=true ./rebuild.sh # Build release version"
echo ""
echo "To install APK on device:"
echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To copy APK from AWS to local:"
echo "  scp user@aws-server:path/to/project/android/app/build/outputs/apk/debug/app-debug.apk ."

log "🎉 Build script completed!"