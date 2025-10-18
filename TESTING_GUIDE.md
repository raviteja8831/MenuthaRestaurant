# Back Button Handler - Testing Guide

## Quick Validation

Run the validation script to ensure everything is set up correctly:

```bash
bash validate-back-button-setup.sh
```

You should see all green checkmarks ✓ indicating successful setup.

## Manual Testing Steps

### Prerequisites
1. Build the app using the build script:
   ```bash
   bash build_multi_app_cleartext.sh menutha  # For customer app
   # OR
   bash build_multi_app_cleartext.sh menuva   # For restaurant app
   ```

2. Install the APK on a device or emulator

### Test Scenarios

#### Scenario 1: Hardware Back Button on Login Screen (Authenticated)
**Objective:** Verify that back button redirects to home when user is already logged in

1. Login to the app (as customer, manager, or chef)
2. Note which home screen you land on
3. If possible, try to navigate to the login screen
4. Press the hardware back button
5. **Expected:** Should redirect to your home screen, not go back to previous screen

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 2: Hardware Back Button on Home Screen
**Objective:** Verify that app exits when back button is pressed on home screen

1. Login to the app
2. Navigate to your home screen (customer-home, dashboard, or chef-home)
3. Press the hardware back button
4. **Expected:** App should exit completely

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 3: Hardware Back Button with Navigation History
**Objective:** Verify normal back navigation works on regular screens

1. Login to the app
2. Navigate through multiple screens:
   - Customer: Home → Hotel List → Hotel Details
   - Manager: Dashboard → Menu → Add Item
   - Chef: Chef Home → Orders → Order Details
3. Press the hardware back button
4. **Expected:** Should navigate back to the previous screen normally

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 4: Hardware Back Button without Navigation History
**Objective:** Verify redirection to home when no back history exists

1. Login to the app
2. Deep link or directly navigate to a screen with no history
3. Press the hardware back button
4. **Expected:** Should redirect to home screen instead of crashing

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 5: Hardware Back Button when Not Authenticated
**Objective:** Verify normal back navigation when user is not logged in

1. Logout or start with fresh app
2. Navigate through login/registration screens
3. Press the hardware back button
4. **Expected:** Normal back navigation behavior

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 6: Different User Types
**Objective:** Verify correct home routing for each user type

**6a. Customer User:**
1. Login as CUSTOMER
2. Verify redirected to `/customer-home`
3. Press back button on login screen (if accessible)
4. **Expected:** Redirect to `/customer-home`

**Status:** ☐ Pass ☐ Fail

**6b. Manager User:**
1. Login as MANAGER
2. Verify redirected to `/dashboard`
3. Press back button on login screen (if accessible)
4. **Expected:** Redirect to `/dashboard`

**Status:** ☐ Pass ☐ Fail

**6c. Chef User:**
1. Login as CHEF
2. Verify redirected to `/chef-home`
3. Press back button on login screen (if accessible)
4. **Expected:** Redirect to `/chef-home`

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 7: Rapid Back Button Presses
**Objective:** Verify app doesn't crash with rapid back button presses

1. Login to the app
2. Navigate through several screens
3. Rapidly press the hardware back button multiple times
4. **Expected:** App should handle gracefully without crashing

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 8: Session Expiry Handling
**Objective:** Verify back button behavior when session expires

1. Login to the app
2. Wait for session to expire (or manually clear AsyncStorage)
3. Press the hardware back button
4. **Expected:** Normal back behavior (session check should allow navigation to login)

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 9: Console Log Verification
**Objective:** Verify logging works correctly for debugging

1. Connect device/emulator to debugging console
2. Login and navigate around
3. Press back button in various scenarios
4. **Expected:** Should see console logs like:
   - "BackButtonHandler: Preventing back from login, redirecting to home"
   - "BackButtonHandler: No back history, redirecting to home"

**Status:** ☐ Pass ☐ Fail

---

#### Scenario 10: Multiple Apps (Menutha & Menuva)
**Objective:** Verify back button works in both customer and restaurant apps

**10a. Menutha (Customer App):**
1. Install and test Menutha app
2. Run all above scenarios as CUSTOMER user
3. **Expected:** All scenarios work correctly

**Status:** ☐ Pass ☐ Fail

**10b. Menuva (Restaurant App):**
1. Install and test Menuva app
2. Run scenarios as MANAGER and CHEF users
3. **Expected:** All scenarios work correctly

**Status:** ☐ Pass ☐ Fail

---

## Debugging Tips

### Enable Detailed Logging

The back button handler already includes console logging. To see detailed logs:

1. Connect your device via ADB:
   ```bash
   adb logcat | grep -E "BackButtonHandler|safeNavigate"
   ```

2. Or use React Native Debugger to see console logs

### Common Issues and Solutions

#### Issue: Back button not responding
**Possible Causes:**
- BackButtonHandler not rendered in _layout.js
- JavaScript bundle not updated

**Solutions:**
- Verify _layout.js has `<BackButtonHandler />`
- Clear cache and rebuild: `npm start --reset-cache`
- Rebuild the APK

#### Issue: Wrong home screen redirect
**Possible Causes:**
- User type not stored correctly
- User type mapping incorrect

**Solutions:**
- Check AsyncStorage for user type: `USER_TYPE` key
- Verify `getHomeRouteForUserType()` mapping
- Check login flow stores correct user type

#### Issue: App crashes on back button
**Possible Causes:**
- Navigation stack corrupted
- Missing route definitions

**Solutions:**
- Check all routes are defined in _layout.js Stack
- Verify route names match exactly (case-sensitive)
- Check console for error messages

### Verification Checklist

Before testing, ensure:

- ☑ `validate-back-button-setup.sh` passes all checks
- ☑ App builds successfully without errors
- ☑ No TypeScript/ESLint errors in new files
- ☑ All route files exist and are accessible
- ☑ User types are correctly stored after login

## Test Results Summary

| Scenario | Pass | Fail | Notes |
|----------|------|------|-------|
| 1. Back on Login (Auth) | ☐ | ☐ | |
| 2. Back on Home | ☐ | ☐ | |
| 3. Back with History | ☐ | ☐ | |
| 4. Back without History | ☐ | ☐ | |
| 5. Back (Not Auth) | ☐ | ☐ | |
| 6a. Customer Routing | ☐ | ☐ | |
| 6b. Manager Routing | ☐ | ☐ | |
| 6c. Chef Routing | ☐ | ☐ | |
| 7. Rapid Presses | ☐ | ☐ | |
| 8. Session Expiry | ☐ | ☐ | |
| 9. Console Logging | ☐ | ☐ | |
| 10a. Menutha App | ☐ | ☐ | |
| 10b. Menuva App | ☐ | ☐ | |

**Overall Status:** ☐ All Pass ☐ Some Failures

**Tested By:** _______________
**Date:** _______________
**Device/Emulator:** _______________
**App Version:** _______________

## Performance Testing

### Response Time
- Back button should respond within 100-200ms
- No noticeable lag when pressing back button
- Smooth transitions between screens

### Memory Usage
- No memory leaks from back button listeners
- Listeners should be properly cleaned up on unmount

### Battery Impact
- No significant battery drain from back button listener
- Event listener should be efficient

## Additional Notes

- The back button handler is global and runs on every route
- It uses async operations to check authentication state
- Error handling is built-in to prevent crashes
- All navigation is done via expo-router for consistency

## Automated Testing (Future)

For automated testing, consider:

1. **Jest Unit Tests** for navigation helper functions
2. **React Native Testing Library** for component testing
3. **Detox** for E2E testing of back button behavior

Example test structure is available in:
`src/utils/__tests__/navigationHelper.test.js`

---

**Need Help?**
- Check `BACK_BUTTON_HANDLER_README.md` for implementation details
- Check `BACK_BUTTON_IMPLEMENTATION_SUMMARY.md` for overview
- Review console logs for debugging information
