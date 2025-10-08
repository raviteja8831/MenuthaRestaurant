<#
.SYNOPSIS
  Windows PowerShell rebuild script for MenuthaRestaurant (Android)

  Mirrors the behavior of `rebuild.sh` for Windows environments (WSL/Windows
  with Android SDK/Java installed). It will clean, install npm deps, run
  `npx expo prebuild --platform android`, create `local.properties`, and run
  the Gradle wrapper to assemble debug (and optionally release) APKs.

USAGE
  .\rebuild.ps1                 # default run (clean, npm install, prebuild, assembleDebug)
  .\rebuild.ps1 -InstallDeps    # attempt to install node/npm (not automated on Windows)
  $env:BUILD_RELEASE = 'true'; .\rebuild.ps1   # build release as well
#>

[CmdletBinding()]
param(
    [switch]$InstallDeps
)

Set-StrictMode -Version Latest

function Log($msg) { Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function ErrorExit($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red; exit 1 }

$ProjectRoot = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
Set-Location $ProjectRoot
Log "Starting in directory: $ProjectRoot"

# Check Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    ErrorExit "Node.js is not installed or not in PATH. Please install Node.js 18+ and ensure 'node' is available."
}
Log "Node version: $(node --version)"

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    ErrorExit "npm is not installed or not in PATH."
}
Log "npm version: $(npm --version)"

# Check Java
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    ErrorExit "Java is not installed or not in PATH. Please install OpenJDK 17 and set JAVA_HOME."
}
Log "Java: $(java -version 2>&1 | Select-Object -First 1)"

# Check ANDROID_SDK_ROOT or ANDROID_HOME
if (-not $env:ANDROID_SDK_ROOT -and -not $env:ANDROID_HOME) {
    Warn "ANDROID_SDK_ROOT or ANDROID_HOME is not set. Attempting common Windows locations..."
    $candidates = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "C:\Android\Sdk",
        "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $env:ANDROID_SDK_ROOT = $c
            $env:ANDROID_HOME = $c
            Log "Found Android SDK at: $c"
            break
        }
    }
    if (-not $env:ANDROID_SDK_ROOT) {
        ErrorExit "Android SDK not found. Install Android SDK and set ANDROID_SDK_ROOT or ANDROID_HOME environment variable."
    }
} else {
    if ($env:ANDROID_SDK_ROOT) { Log "Android SDK: $env:ANDROID_SDK_ROOT" }
    elseif ($env:ANDROID_HOME) { Log "Android SDK: $env:ANDROID_HOME" }
    else { Log "Android SDK: <not set>" }
}

# Add platform-tools to PATH for adb availability
$env:PATH = "${env:ANDROID_SDK_ROOT}\platform-tools;${env:ANDROID_SDK_ROOT}\emulator;$env:PATH"

if ($InstallDeps) {
    Warn "Automatic OS-level dependency installation is not implemented on Windows. Please install Node, Java and Android SDK manually or use Chocolatey/winget."
}

Log "Cleaning previous builds..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules, package-lock.json, yarn.lock
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue android\app\build, android\build, android\.gradle, android\.cxx

Log "Cleaning npm cache..."
npm cache clean --force | Out-Null

Log "Installing npm dependencies..."
npm install

# Ensure expo CLI is available (use npx to avoid global install requirement)

# Generate Android project if missing or prebuild requested
$prebuildNeeded = -not (Test-Path "android")
if ($prebuildNeeded) { Log "Android folder not found; will run expo prebuild." }

if ($prebuildNeeded -or $env:FORCE_PREBUILD -eq 'true') {
    Log "Running: npx expo prebuild --platform android --clear"
    npx expo prebuild --platform android --clear
}

if (-not (Test-Path "android\gradlew.bat")) {
    ErrorExit "Gradle wrapper not found at android\gradlew.bat. Ensure prebuild completed successfully."
}

Set-Location "$ProjectRoot\android"

Log "Creating local.properties for Android SDK path..."
if ($env:ANDROID_SDK_ROOT) { $sdkDir = $env:ANDROID_SDK_ROOT }
elseif ($env:ANDROID_HOME) { $sdkDir = $env:ANDROID_HOME }
else { $sdkDir = "" }
Set-Content -Path local.properties -Value "sdk.dir=$sdkDir"

Log "Making gradlew executable (Windows uses gradlew.bat)..."
# No-op on Windows for .bat, but keep parity.

Log "Cleaning Gradle build..."
& .\gradlew.bat clean

Log "Refreshing Gradle dependencies..."
& .\gradlew.bat --refresh-dependencies

Log "Building Debug APK..."
& .\gradlew.bat assembleDebug

if ($env:BUILD_RELEASE -eq 'true') {
    Log "Building Release APK and AAB..."
    & .\gradlew.bat assembleRelease
    & .\gradlew.bat bundleRelease
}

Set-Location $ProjectRoot
Log "Build completed. Build outputs (if successful):"
if (Test-Path "android\app\build\outputs\apk\debug\app-debug.apk") {
    $size = (Get-Item "android\app\build\outputs\apk\debug\app-debug.apk").Length
    Log "Debug APK: android\app\build\outputs\apk\debug\app-debug.apk ($([math]::Round($size/1MB,2)) MB)"
} else { Warn "Debug APK not found." }

if (Test-Path "android\app\build\outputs\apk\release\app-release.apk") {
    $size = (Get-Item "android\app\build\outputs\apk\release\app-release.apk").Length
    Log "Release APK: android\app\build\outputs\apk\release\app-release.apk ($([math]::Round($size/1MB,2)) MB)"
}

Log "To install the APK on a connected device: adb install -r android\\app\\build\\outputs\\apk\\debug\\app-debug.apk"
