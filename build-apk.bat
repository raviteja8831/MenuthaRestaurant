@echo off
setlocal enabledelayedexpansion

REM APK Build Script for Windows
REM Usage: build-apk.bat [debug|release]

echo.
echo ==========================================
echo      APK Build Script for Windows
echo ==========================================

REM Configuration
set "BUILD_TYPE=%1"
if "%BUILD_TYPE%"=="" set "BUILD_TYPE=debug"
set "PROJECT_NAME=ft"
set "OUTPUT_DIR=build-output"

REM Get timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,4%%dt:~4,2%%dt:~6,2%_%dt:~8,2%%dt:~10,2%%dt:~12,2%"

echo Build Type: %BUILD_TYPE%
echo Timestamp: %TIMESTAMP%
echo.

REM Create output directory
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Check if Android directory exists
if not exist "android" (
    echo Android directory not found. Running prebuild...
    call npx expo prebuild --platform android
    if !errorlevel! neq 0 (
        echo ERROR: Prebuild failed
        pause
        exit /b 1
    )
    echo ✓ Prebuild completed
)

REM Clean previous builds
echo Cleaning previous builds...
cd android

if "%BUILD_TYPE%"=="release" (
    echo Cleaning for release build...
    call gradlew.bat clean
) else (
    echo Cleaning for debug build...
    call gradlew.bat clean
)

if !errorlevel! neq 0 (
    echo ERROR: Gradle clean failed
    cd ..
    pause
    exit /b 1
)
echo ✓ Gradle clean completed

REM Build APK
echo.
echo Building %BUILD_TYPE% APK...

if "%BUILD_TYPE%"=="release" (
    echo Building release APK ^(requires signing configuration^)...
    call gradlew.bat assembleRelease

    if !errorlevel! neq 0 (
        echo ERROR: Release build failed
        cd ..
        pause
        exit /b 1
    )

    REM Find release APK
    for /r %%i in (*-release.apk) do (
        set "APK_PATH=%%i"
        goto :found_release
    )
    echo ERROR: Release APK not found!
    cd ..
    pause
    exit /b 1
    :found_release
    set "OUTPUT_NAME=%PROJECT_NAME%-release-%TIMESTAMP%.apk"
) else (
    echo Building debug APK...
    call gradlew.bat assembleDebug

    if !errorlevel! neq 0 (
        echo ERROR: Debug build failed
        cd ..
        pause
        exit /b 1
    )

    REM Find debug APK
    for /r %%i in (*-debug.apk) do (
        set "APK_PATH=%%i"
        goto :found_debug
    )
    echo ERROR: Debug APK not found!
    cd ..
    pause
    exit /b 1
    :found_debug
    set "OUTPUT_NAME=%PROJECT_NAME%-debug-%TIMESTAMP%.apk"
)

echo ✓ APK build completed

REM Copy APK to output directory
cd ..
copy "%APK_PATH%" "%OUTPUT_DIR%\%OUTPUT_NAME%"

if !errorlevel! neq 0 (
    echo ERROR: Failed to copy APK
    pause
    exit /b 1
)

REM Create latest copy
copy "%OUTPUT_DIR%\%OUTPUT_NAME%" "%OUTPUT_DIR%\%PROJECT_NAME%-%BUILD_TYPE%-latest.apk"

echo ✓ APK copied to: %OUTPUT_DIR%\%OUTPUT_NAME%

REM Get APK size
for %%A in ("%OUTPUT_DIR%\%OUTPUT_NAME%") do set "APK_SIZE=%%~zA"
set /a APK_SIZE_MB=%APK_SIZE%/1024/1024

echo.
echo ==========================================
echo           Build Summary
echo ==========================================
echo Project: %PROJECT_NAME%
echo Build Type: %BUILD_TYPE%
echo Timestamp: %TIMESTAMP%
echo Size: %APK_SIZE_MB% MB
echo Output: %OUTPUT_DIR%\%OUTPUT_NAME%
echo Latest: %OUTPUT_DIR%\%PROJECT_NAME%-%BUILD_TYPE%-latest.apk
echo ==========================================

REM Check for connected devices
adb devices >nul 2>&1
if !errorlevel! equ 0 (
    for /f "skip=1 tokens=2" %%a in ('adb devices') do (
        if "%%a"=="device" (
            echo.
            echo Android device/emulator detected
            set /p INSTALL_CHOICE="Install APK now? (y/N): "
            if /i "!INSTALL_CHOICE!"=="y" (
                echo Installing APK...
                adb install -r "%OUTPUT_DIR%\%OUTPUT_NAME%"
                if !errorlevel! equ 0 (
                    echo ✓ APK installed successfully
                ) else (
                    echo ERROR: APK installation failed
                )
            )
            goto :end_install_check
        )
    )
)
:end_install_check

echo.
echo 🎉 Build process completed successfully!
echo APK Location: %OUTPUT_DIR%\%OUTPUT_NAME%

REM Open output directory
echo.
set /p OPEN_FOLDER="Open output folder? (y/N): "
if /i "%OPEN_FOLDER%"=="y" (
    explorer "%OUTPUT_DIR%"
)

pause