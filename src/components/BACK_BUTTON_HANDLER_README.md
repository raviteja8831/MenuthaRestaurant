# Global Back Button Handler

## Overview
This implementation provides global handling for both hardware and app back buttons to prevent navigation to login screens when a user session is active.

## Components

### 1. BackButtonHandler.js
**Location:** `/src/components/BackButtonHandler.js`

A React component that listens to hardware back button presses and intelligently handles navigation based on authentication state.

**Features:**
- Prevents navigation to login screens when authenticated
- Redirects to appropriate home screen based on user type
- Exits app when back is pressed on home screen
- Falls back to home screen when there's no navigation history

**Integration:**
```javascript
// Already integrated in app/_layout.js
import BackButtonHandler from '../src/components/BackButtonHandler';

// Inside your root component
<BackButtonHandler />
```

### 2. navigationHelper.js
**Location:** `/src/utils/navigationHelper.js`

Utility functions for safe navigation that respect authentication state.

**Exported Functions:**

#### `safeNavigate(route, options)`
Safely navigate to a route, preventing navigation to login when authenticated.
```javascript
import { safeNavigate } from '../utils/navigationHelper';

// Usage
await safeNavigate('/customer-home');
await safeNavigate('/login', { replace: true });
```

#### `safeGoBack()`
Safely go back, redirecting to home if no history exists.
```javascript
import { safeGoBack } from '../utils/navigationHelper';

// Usage
await safeGoBack();
```

#### `getHomeRouteForUserType(userType)`
Get the appropriate home route based on user type.
```javascript
import { getHomeRouteForUserType } from '../utils/navigationHelper';
import { USER_TYPES } from '../services/authService';

const homeRoute = getHomeRouteForUserType(USER_TYPES.CUSTOMER);
// Returns: '/customer-home'
```

#### `isLoginRoute(pathname)`
Check if a pathname is a login route.
```javascript
import { isLoginRoute } from '../utils/navigationHelper';

if (isLoginRoute('/Customer-Login')) {
  // It's a login route
}
```

#### `isHomeRoute(pathname, userType)`
Check if a pathname is a home route for the given user type.
```javascript
import { isHomeRoute } from '../utils/navigationHelper';
import { USER_TYPES } from '../services/authService';

if (isHomeRoute('/customer-home', USER_TYPES.CUSTOMER)) {
  // It's the customer home route
}
```

## Behavior Matrix

| Current Screen | User Authenticated | Back Button Action |
|---------------|-------------------|-------------------|
| Login Screen | Yes | Redirect to Home Screen |
| Home Screen | Yes | Exit App |
| Any Screen | Yes (no history) | Redirect to Home Screen |
| Any Screen | Yes (has history) | Normal back navigation |
| Any Screen | No | Normal back navigation |

## User Type to Route Mapping

| User Type | Home Route | Login Routes |
|-----------|-----------|-------------|
| CUSTOMER | /customer-home | /Customer-Login, /customer-login |
| MANAGER | /dashboard | /login, /chef-login |
| CHEF | /chef-home | /login, /chef-login |

## Usage Examples

### Example 1: Using safeNavigate in a component
```javascript
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { safeNavigate } from '../utils/navigationHelper';

export default function MyComponent() {
  const handleNavigation = async () => {
    // This will prevent navigation to login if user is authenticated
    await safeNavigate('/Customer-Login');
  };

  return (
    <TouchableOpacity onPress={handleNavigation}>
      <Text>Go to Login</Text>
    </TouchableOpacity>
  );
}
```

### Example 2: Using safeGoBack in a header
```javascript
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { safeGoBack } from '../utils/navigationHelper';

export default function CustomHeader() {
  return (
    <TouchableOpacity onPress={safeGoBack}>
      <Text>← Back</Text>
    </TouchableOpacity>
  );
}
```

### Example 3: Checking route types
```javascript
import { usePathname } from 'expo-router';
import { isLoginRoute, isHomeRoute } from '../utils/navigationHelper';
import { getUserType } from '../services/authService';

function MyComponent() {
  const pathname = usePathname();

  useEffect(() => {
    const checkRoute = async () => {
      if (isLoginRoute(pathname)) {
        console.log('User is on a login screen');
      }

      const userType = await getUserType();
      if (isHomeRoute(pathname, userType)) {
        console.log('User is on their home screen');
      }
    };

    checkRoute();
  }, [pathname]);
}
```

## Testing

To test the back button functionality:

1. **Test authenticated back button on login screen:**
   - Login as a user
   - Navigate to login screen (if possible)
   - Press back button
   - Should redirect to home screen

2. **Test back button on home screen:**
   - Login as a user
   - Press back button on home screen
   - Should exit the app

3. **Test back button with no history:**
   - Login as a user
   - Navigate to a screen with no back history
   - Press back button
   - Should redirect to home screen

4. **Test normal back navigation:**
   - Login as a user
   - Navigate through multiple screens
   - Press back button
   - Should navigate back normally

5. **Test unauthenticated back button:**
   - Logout
   - Navigate through screens
   - Press back button
   - Should work normally

## Implementation Details

The back button handler works by:

1. Listening to the `hardwareBackPress` event from React Native's `BackHandler` API
2. Checking authentication state using `isAuthenticated()`
3. Getting user type using `getUserType()`
4. Determining appropriate action based on:
   - Current route (pathname)
   - User type
   - Authentication state
   - Navigation history

## Troubleshooting

### Back button not working
- Ensure `BackButtonHandler` is imported and rendered in `app/_layout.js`
- Check console logs for errors
- Verify authentication service is working correctly

### Wrong home screen redirection
- Check user type mapping in `getHomeRouteForUserType()`
- Verify user type is stored correctly in AsyncStorage

### App not exiting on home screen
- Ensure `BackHandler.exitApp()` is being called
- Check if home route detection is working correctly

## Related Files

- `/app/_layout.js` - Root layout with BackButtonHandler integration
- `/src/services/authService.js` - Authentication service
- `/src/components/SessionGuard.js` - Session guard component
