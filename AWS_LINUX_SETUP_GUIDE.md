# 🚀 AWS Linux APK Build Setup Guide

Complete step-by-step guide to set up APK building on AWS Linux for the Menutha React Native app.

## 📋 Prerequisites

- AWS EC2 instance (t3.medium or larger recommended)
- Amazon Linux 2/Amazon Linux 2023 or Ubuntu 20.04+
- At least 8GB RAM and 20GB storage
- SSH access to the instance

## 🔧 Step 1: System Setup

### For Amazon Linux 2023:
```bash
# Update system
sudo yum update -y

# Install essential tools
sudo yum install -y git curl wget unzip tar gzip

# Install development tools
sudo yum groupinstall -y "Development Tools"
```

### For Ubuntu:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget unzip tar gzip build-essential
```

## ☕ Step 2: Install Java 17

### Amazon Linux:
```bash
# Install Amazon Corretto 17
sudo yum install -y java-17-amazon-corretto java-17-amazon-corretto-devel

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto' >> ~/.bashrc
```

### Ubuntu:
```bash
# Install OpenJDK 17
sudo apt install -y openjdk-17-jdk

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
```

## 📱 Step 3: Install Node.js 18+

### Amazon Linux:
```bash
# Install Node.js 18 from NodeSource
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### Ubuntu:
```bash
# Install Node.js 18 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## 🤖 Step 4: Install Android SDK

### Method 1: Download Android Command Line Tools
```bash
# Create Android SDK directory
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download Android Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11479570_latest.zip

# Extract tools
unzip commandlinetools-linux-11479570_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Set environment variables
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export ANDROID_SDK_ROOT=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc

# Reload environment
source ~/.bashrc
```

### Install Android SDK Components
```bash
# Accept licenses
yes | sdkmanager --licenses

# Install required SDK components
sdkmanager "platform-tools"
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
sdkmanager "system-images;android-34;google_apis_playstore;x86_64"

# Verify installation
sdkmanager --list | grep "platform-tools"
```

## 📦 Step 5: Install Global Tools

```bash
# Install Expo CLI
npm install -g @expo/cli

# Install EAS CLI (optional, for cloud builds)
npm install -g eas-cli

# Verify installations
expo --version
```

## 🏗️ Step 6: Clone and Setup Project

```bash
# Clone your project
git clone https://github.com/your-username/MenuthaRestaurant.git
cd MenuthaRestaurant

# Make rebuild script executable
chmod +x rebuild.sh

# Install system dependencies (if needed)
./rebuild.sh --install-deps
```

## 🔨 Step 7: Build APK

### Option 1: Using the automated script
```bash
# Build debug APK
./rebuild.sh

# Build release APK
BUILD_RELEASE=true ./rebuild.sh

# Force regenerate android folder
./rebuild.sh --prebuild
```

### Option 2: Manual steps
```bash
# Install npm dependencies
npm install

# Generate Android project
npx expo prebuild --platform android

# Navigate to android folder
cd android

# Create local.properties
echo "sdk.dir=$ANDROID_HOME" > local.properties

# Build debug APK
./gradlew assembleDebug

# Build release APK (requires signing setup)
./gradlew assembleRelease
```

## 📂 Build Outputs

After successful build, APK files will be located at:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **Release AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

## 🔄 Step 8: Transfer APK to Local Machine

### Method 1: SCP
```bash
# From your local machine
scp user@your-aws-ip:~/MenuthaRestaurant/android/app/build/outputs/apk/debug/app-debug.apk ./
```

### Method 2: AWS S3
```bash
# On AWS instance
aws s3 cp android/app/build/outputs/apk/debug/app-debug.apk s3://your-bucket/

# From local machine
aws s3 cp s3://your-bucket/app-debug.apk ./
```

## 🔐 Step 9: Release Build Signing (Production)

### Generate Keystore
```bash
# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Create gradle.properties
echo "MYAPP_RELEASE_STORE_FILE=my-release-key.keystore" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_ALIAS=my-key-alias" >> android/gradle.properties
echo "MYAPP_RELEASE_STORE_PASSWORD=your-store-password" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_PASSWORD=your-key-password" >> android/gradle.properties
```

## 🐛 Troubleshooting

### Common Issues:

1. **Out of Memory**
   ```bash
   export JAVA_OPTS="-Xmx4g"
   export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=512m"
   ```

2. **Permission Denied**
   ```bash
   chmod +x android/gradlew
   chmod +x rebuild.sh
   ```

3. **SDK License Issues**
   ```bash
   yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
   ```

4. **Network Issues**
   ```bash
   # Use proxy if needed
   export HTTP_PROXY=http://proxy:port
   export HTTPS_PROXY=http://proxy:port
   ```

## 📊 Performance Optimization

### EC2 Instance Recommendations:
- **Minimum**: t3.medium (2 vCPU, 4GB RAM)
- **Recommended**: t3.large (2 vCPU, 8GB RAM)
- **Heavy builds**: t3.xlarge (4 vCPU, 16GB RAM)

### Build Optimization:
```bash
# Enable Gradle daemon
echo "org.gradle.daemon=true" >> ~/.gradle/gradle.properties

# Increase memory
echo "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m" >> ~/.gradle/gradle.properties

# Enable parallel builds
echo "org.gradle.parallel=true" >> ~/.gradle/gradle.properties
```

## 🚀 Automation Script Usage

```bash
# Quick build (debug)
./rebuild.sh

# Full setup with dependencies
./rebuild.sh --install-deps

# Force clean rebuild
./rebuild.sh --prebuild

# Build release version
BUILD_RELEASE=true ./rebuild.sh

# Build with custom settings
JAVA_HOME=/custom/java BUILD_RELEASE=true ./rebuild.sh
```

## 📱 Installing APK on Device

### Local Device (via ADB)
```bash
# Install debug APK
adb install app-debug.apk

# Install and replace existing
adb install -r app-debug.apk
```

### Remote Installation
```bash
# Generate QR code for download
qrencode -t PNG -o qr.png "https://your-server.com/app-debug.apk"
```

## 🔄 CI/CD Integration

### GitHub Actions Example:
```yaml
name: Build APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Setup JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      - name: Build APK
        run: ./rebuild.sh
```

---

## 🎯 Quick Start Commands

```bash
# One-liner setup for Amazon Linux 2023
curl -fsSL https://raw.githubusercontent.com/your-repo/setup.sh | bash

# Or manual setup
git clone https://github.com/your-username/MenuthaRestaurant.git
cd MenuthaRestaurant
./rebuild.sh --install-deps
./rebuild.sh
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review build logs in `android/build/reports/`
3. Check Gradle logs: `./gradlew assembleDebug --debug`

---

**✅ You're all set!** Your AWS Linux environment is now ready to build APKs for the Menutha app.