#!/bin/bash
# Validation script for Back Button Handler implementation
# This script checks all dependencies and configurations

echo "=================================="
echo "Back Button Handler Validation"
echo "=================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Directory missing: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check if string exists in file
check_string_in_file() {
    local file=$1
    local search=$2
    local description=$3

    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} File not found: $file"
        ERRORS=$((ERRORS + 1))
        return 1
    fi

    if grep -q "$search" "$file"; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $description in $file"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check package in package.json
check_package() {
    local package=$1
    if grep -q "\"$package\"" package.json; then
        echo -e "${GREEN}✓${NC} Package installed: $package"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Package not found: $package (might be optional)"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

echo "1. Checking Required Files"
echo "----------------------------"
check_file "src/components/BackButtonHandler.js"
check_file "src/utils/navigationHelper.js"
check_file "src/services/authService.js"
check_file "src/components/SessionGuard.js"
check_file "src/contexts/AlertContext.js"
check_file "app/_layout.js"
check_file "app/index.customer.js"
check_file "app/index.restaurant.js"
check_file "package.json"
check_file "app.json"
echo ""

echo "2. Checking Documentation Files"
echo "--------------------------------"
check_file "src/components/BACK_BUTTON_HANDLER_README.md"
check_file "BACK_BUTTON_IMPLEMENTATION_SUMMARY.md"
check_file "src/utils/__tests__/navigationHelper.test.js"
echo ""

echo "3. Checking Required Dependencies"
echo "----------------------------------"
check_package "react"
check_package "react-native"
check_package "expo-router"
check_package "@react-native-async-storage/async-storage"
echo ""

echo "4. Checking Integration in _layout.js"
echo "--------------------------------------"
check_string_in_file "app/_layout.js" "import BackButtonHandler" "BackButtonHandler import"
check_string_in_file "app/_layout.js" "<BackButtonHandler />" "BackButtonHandler component rendered"
echo ""

echo "5. Checking authService Exports"
echo "--------------------------------"
check_string_in_file "src/services/authService.js" "export const USER_TYPES" "USER_TYPES exported"
check_string_in_file "src/services/authService.js" "export const isAuthenticated" "isAuthenticated exported"
check_string_in_file "src/services/authService.js" "export const getUserType" "getUserType exported"
check_string_in_file "src/services/authService.js" "CUSTOMER:" "CUSTOMER user type defined"
check_string_in_file "src/services/authService.js" "MANAGER:" "MANAGER user type defined"
check_string_in_file "src/services/authService.js" "CHEF:" "CHEF user type defined"
echo ""

echo "6. Checking BackButtonHandler Implementation"
echo "---------------------------------------------"
check_string_in_file "src/components/BackButtonHandler.js" "import.*BackHandler.*from 'react-native'" "React Native BackHandler import"
check_string_in_file "src/components/BackButtonHandler.js" "import.*useRouter.*from 'expo-router'" "Expo Router hooks import"
check_string_in_file "src/components/BackButtonHandler.js" "import.*isAuthenticated.*from.*authService" "Auth service imports"
check_string_in_file "src/components/BackButtonHandler.js" "BackHandler.addEventListener" "Hardware back button listener"
echo ""

echo "7. Checking navigationHelper Implementation"
echo "--------------------------------------------"
check_string_in_file "src/utils/navigationHelper.js" "export const safeNavigate" "safeNavigate function"
check_string_in_file "src/utils/navigationHelper.js" "export const safeGoBack" "safeGoBack function"
check_string_in_file "src/utils/navigationHelper.js" "export const getHomeRouteForUserType" "getHomeRouteForUserType function"
check_string_in_file "src/utils/navigationHelper.js" "export const isLoginRoute" "isLoginRoute function"
check_string_in_file "src/utils/navigationHelper.js" "export const isHomeRoute" "isHomeRoute function"
echo ""

echo "8. Checking Route Files"
echo "------------------------"
check_file "app/Customer-Login.js"
check_file "app/customer-home.js"
check_file "app/chef-home.js"
check_file "app/dashboard.js"
check_file "app/login.js"
echo ""

echo "9. Checking Configuration Files"
echo "--------------------------------"
check_file "babel.config.js"
check_file "metro.config.js"
check_string_in_file "app.json" "\"expo-router\"" "expo-router plugin configured"
echo ""

echo "=================================="
echo "Validation Summary"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your Back Button Handler implementation is correctly set up."
    echo "You can now build and test the app."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ All critical checks passed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "Your implementation should work, but review the warnings above."
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    echo "Refer to BACK_BUTTON_IMPLEMENTATION_SUMMARY.md for details."
    exit 1
fi
