# User Types and Routing Configuration

## Overview

The back button handler supports **3 user types** with different home routes and login routes.

## User Type Mappings

### 1. CUSTOMER (Customer App - Menutha)
```
User Type: 'customer'
Home Route: /customer-home
Login Routes: /Customer-Login, /customer-login
App: Menutha (Customer App)
```

**Flow:**
```
Login → /Customer-Login
  ↓
Authenticated
  ↓
Home → /customer-home
  ↓
Back Button on Home → Exit App
Back Button on Login (if authenticated) → /customer-home
```

---

### 2. MANAGER (Restaurant App - Menuva)
```
User Type: 'manager'
Home Route: /dashboard
Login Routes: /login, /chef-login
App: Menuva (Restaurant App)
```

**Flow:**
```
Login → /login
  ↓
Authenticated as Manager
  ↓
Home → /dashboard
  ↓
Back Button on Home → Exit App
Back Button on Login (if authenticated) → /dashboard
```

---

### 3. CHEF (Restaurant App - Menuva)
```
User Type: 'chef'
Home Route: /chef-home
Login Routes: /login, /chef-login
App: Menuva (Restaurant App)
```

**Flow:**
```
Login → /login or /chef-login
  ↓
Authenticated as Chef
  ↓
Home → /chef-home
  ↓
Back Button on Home → Exit App
Back Button on Login (if authenticated) → /chef-home
```

---

## Route Matrix

| User Type | Home Route | Login Routes | App |
|-----------|-----------|-------------|-----|
| `customer` | `/customer-home` | `/Customer-Login`, `/customer-login` | Menutha |
| `manager` | `/dashboard` | `/login`, `/chef-login` | Menuva |
| `chef` | `/chef-home` | `/login`, `/chef-login` | Menuva |

## Back Button Behavior by User Type

### Customer (Menutha App)

| Current Screen | User Authenticated | Back Button Action |
|---------------|-------------------|-------------------|
| `/Customer-Login` | Yes | → `/customer-home` |
| `/customer-home` | Yes | Exit App |
| Any other screen | Yes (with history) | Normal back navigation |
| Any other screen | Yes (no history) | → `/customer-home` |
| Any screen | No | Normal back navigation |

### Manager (Menuva App)

| Current Screen | User Authenticated | Back Button Action |
|---------------|-------------------|-------------------|
| `/login` | Yes | → `/dashboard` |
| `/chef-login` | Yes | → `/dashboard` |
| `/dashboard` | Yes | Exit App |
| Any other screen | Yes (with history) | Normal back navigation |
| Any other screen | Yes (no history) | → `/dashboard` |
| Any screen | No | Normal back navigation |

### Chef (Menuva App)

| Current Screen | User Authenticated | Back Button Action |
|---------------|-------------------|-------------------|
| `/login` | Yes | → `/chef-home` |
| `/chef-login` | Yes | → `/chef-home` |
| `/chef-home` | Yes | Exit App |
| Any other screen | Yes (with history) | Normal back navigation |
| Any other screen | Yes (no history) | → `/chef-home` |
| Any screen | No | Normal back navigation |

## Implementation Details

### How User Type is Determined

1. User logs in through appropriate login screen
2. Backend returns user type in authentication response
3. User type is stored in AsyncStorage using `authService.storeAuthData()`
4. Retrieved using `authService.getUserType()`

### Code Reference

**Define Home Route** (`src/utils/navigationHelper.js:93-99`):
```javascript
export const getHomeRouteForUserType = (userType) => {
  const homeRoutes = {
    [USER_TYPES.CUSTOMER]: '/customer-home',
    [USER_TYPES.MANAGER]: '/dashboard',
    [USER_TYPES.CHEF]: '/chef-home',
  };

  return homeRoutes[userType] || '/customer-home';
};
```

**User Types Definition** (`src/services/authService.js:11-16`):
```javascript
export const USER_TYPES = {
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  CHEF: 'chef',
};
```

## Testing Each User Type

### Test as CUSTOMER
1. Build Menutha app: `bash build_multi_app_cleartext.sh menutha`
2. Install and login as customer
3. Verify home route is `/customer-home`
4. Test back button behavior

### Test as MANAGER
1. Build Menuva app: `bash build_multi_app_cleartext.sh menuva`
2. Install and login as manager
3. Verify home route is `/dashboard`
4. Test back button behavior

### Test as CHEF
1. Build Menuva app: `bash build_multi_app_cleartext.sh menuva`
2. Install and login as chef
3. Verify home route is `/chef-home`
4. Test back button behavior

## App Entry Points

### Menutha (Customer App)
**Entry:** `app/index.customer.js`
```javascript
// Handles customer authentication
if (userType === USER_TYPES.CUSTOMER) {
  router.replace("/customer-home");
} else {
  router.replace("/Customer-Login");
}
```

### Menuva (Restaurant App)
**Entry:** `app/index.restaurant.js`
```javascript
// Handles manager and chef authentication
if (userType === USER_TYPES.MANAGER) {
  router.replace("/dashboard");
} else if (userType === USER_TYPES.CHEF) {
  router.replace("/chef-home");
} else {
  router.replace("/login");
}
```

## Visual Flow Diagrams

### Customer Flow (Menutha)
```
┌─────────────────┐
│ App Launch      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      Not Auth      ┌─────────────────┐
│ Check Auth      │──────────────────→  │ Customer Login  │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         │ Authenticated                         │ Login Success
         │ as CUSTOMER                           │
         ▼                                       │
┌─────────────────┐  ◄───────────────────────────┘
│ /customer-home  │
└────────┬────────┘
         │
         │ Back Button
         ▼
┌─────────────────┐
│ Exit App        │
└─────────────────┘
```

### Manager Flow (Menuva)
```
┌─────────────────┐
│ App Launch      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      Not Auth      ┌─────────────────┐
│ Check Auth      │──────────────────→  │ Restaurant Login│
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         │ Authenticated                         │ Login Success
         │ as MANAGER                            │
         ▼                                       │
┌─────────────────┐  ◄───────────────────────────┘
│ /dashboard      │
└────────┬────────┘
         │
         │ Back Button
         ▼
┌─────────────────┐
│ Exit App        │
└─────────────────┘
```

### Chef Flow (Menuva)
```
┌─────────────────┐
│ App Launch      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      Not Auth      ┌─────────────────┐
│ Check Auth      │──────────────────→  │ Chef Login      │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         │ Authenticated                         │ Login Success
         │ as CHEF                               │
         ▼                                       │
┌─────────────────┐  ◄───────────────────────────┘
│ /chef-home      │
└────────┬────────┘
         │
         │ Back Button
         ▼
┌─────────────────┐
│ Exit App        │
└─────────────────┘
```

## Common Scenarios

### Scenario: Manager tries to access Chef Home
- Current Route: `/chef-home`
- User Type: `manager`
- Back Button Pressed
- **Result:** Normal back navigation (allowed to navigate away from chef-home)

### Scenario: Chef on Dashboard
- Current Route: `/dashboard`
- User Type: `chef`
- Back Button Pressed
- **Result:** Normal back navigation (dashboard is not chef's home)

### Scenario: Customer on Restaurant Login
- User Type: `customer` (authenticated in customer app)
- Tries to navigate to `/login`
- **Result:** `safeNavigate` redirects to `/customer-home`

## Troubleshooting by User Type

### Issue: Manager redirects to wrong home
**Check:**
1. User type stored correctly: Should be `'manager'` (lowercase)
2. Route exists: `/dashboard` should be defined in routes
3. Console logs: Check for "Redirecting to home" messages

### Issue: Chef redirects to wrong home
**Check:**
1. User type stored correctly: Should be `'chef'` (lowercase)
2. Route exists: `/chef-home` should be defined in routes
3. Console logs: Check for "Redirecting to home" messages

### Issue: Wrong app shows wrong login
**Check:**
1. Built correct app (menutha vs menuva)
2. Correct index file copied (`index.customer.js` vs `index.restaurant.js`)
3. Package name in build matches user type

## Summary

✅ **3 User Types Supported:**
- Customer (Menutha app)
- Manager (Menuva app)
- Chef (Menuva app)

✅ **Separate Home Routes:**
- Customer → `/customer-home`
- Manager → `/dashboard`
- Chef → `/chef-home`

✅ **Intelligent Back Button:**
- Prevents navigation to login when authenticated
- Exits app on respective home screen
- Redirects to appropriate home based on user type
- Handles all edge cases gracefully

✅ **Works with Both Apps:**
- Menutha (Customer App)
- Menuva (Restaurant App with Manager & Chef)
