# APK Build Scripts

This project includes automated scripts to build APK files locally after code changes.

## Quick Start

### Windows Users
```bash
# Build debug APK
npm run build:apk:debug:windows

# Build release APK
npm run build:apk:release:windows

# Or run directly
build-apk.bat debug
build-apk.bat release
```

### Linux/macOS Users
```bash
# Build debug APK
npm run build:apk:debug

# Build release APK
npm run build:apk:release

# Or run directly
./build-apk.sh debug
./build-apk.sh release
```

## Output

APKs are saved to `build-output/` directory with timestamps:
- `ft-debug-YYYYMMDD_HHMMSS.apk`
- `ft-release-YYYYMMDD_HHMMSS.apk`
- Latest builds are also saved as `ft-debug-latest.apk` and `ft-release-latest.apk`

## Build Process

Both scripts perform:
1. **Clean**: Remove previous build artifacts
2. **Prebuild**: Generate Android native project if needed
3. **Build**: Compile APK using Gradle
4. **Copy**: Move APK to output directory with timestamp
5. **Install**: Optionally install on connected device/emulator

## Build Types

### Debug APK
- Faster build time
- Includes debugging symbols
- Suitable for development and testing
- No signing configuration required

### Release APK
- Optimized and minified
- Production-ready
- Requires signing configuration for Play Store
- Larger build time

## Signing Configuration (Release Builds)

To build signed release APKs, add signing config to `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/keystore.jks')
            storePassword 'your-store-password'
            keyAlias 'your-key-alias'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... other config
        }
    }
}
```

## Troubleshooting

### Windows File Locks
If you encounter file locking issues on Windows:
1. Close all running processes (Node, Metro, Android Studio)
2. Run the script again
3. Consider using WSL for better performance

### Gradle Issues
If Gradle build fails:
```bash
# Clean everything
cd android
./gradlew clean  # Linux/macOS
gradlew.bat clean  # Windows

# Reset Metro cache
npx expo start --clear
```

### Missing Android Directory
The script will automatically run `npx expo prebuild` if the Android directory doesn't exist.

## Performance Tips

1. **Incremental Builds**: After the first build, subsequent builds are faster
2. **Gradle Daemon**: Keeps Gradle processes running for faster builds
3. **Clean Selectively**: Only clean when encountering issues
4. **Use Debug Builds**: For development, debug builds are much faster

## Script Features

- ✅ Automatic prebuild if needed
- ✅ Colored output for better readability
- ✅ Error handling and validation
- ✅ Automatic device detection and installation
- ✅ Build size reporting
- ✅ Timestamped outputs
- ✅ Latest build symlinks/copies
- ✅ Cross-platform support

## Example Workflow

```bash
# 1. Make code changes
# 2. Run build script
npm run build:apk:debug:windows

# 3. APK is generated in build-output/
# 4. Install on emulator/device (optional)
# 5. Test your changes
```