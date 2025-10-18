# Back Button Handler - Quick Reference Card

## 🚀 Quick Start

### Validate Setup
```bash
bash validate-back-button-setup.sh
```
**Expected:** All green ✅ checkmarks

### Build Apps
```bash
# Customer app (Menutha)
bash build_multi_app_cleartext.sh menutha

# Restaurant app (Menuva - Manager & Chef)
bash build_multi_app_cleartext.sh menuva
```

---

## 📋 User Types & Routes

| User Type | Home Route | App |
|-----------|-----------|-----|
| **customer** | `/customer-home` | Menutha |
| **manager** | `/dashboard` | Menuva |
| **chef** | `/chef-home` | Menuva |

---

## 🔄 Back Button Behavior

### When Authenticated

| Screen Type | Action |
|------------|--------|
| **Login Screen** | → Redirect to home |
| **Home Screen** | → Exit app |
| **Other Screen** (with history) | → Normal back |
| **Other Screen** (no history) | → Redirect to home |

### When NOT Authenticated
- Normal back navigation on all screens

---

## 💻 Using in Code

### Safe Navigation
```javascript
import { safeNavigate } from '../utils/navigationHelper';

// Prevents going to login if authenticated
await safeNavigate('/Customer-Login');

// Normal navigation
await safeNavigate('/some-screen', { replace: true });
```

### Safe Back
```javascript
import { safeGoBack } from '../utils/navigationHelper';

<TouchableOpacity onPress={safeGoBack}>
  <Text>← Back</Text>
</TouchableOpacity>
```

### Check Routes
```javascript
import { isLoginRoute, isHomeRoute } from '../utils/navigationHelper';

if (isLoginRoute(pathname)) {
  // User is on login screen
}

if (isHomeRoute(pathname, userType)) {
  // User is on their home screen
}
```

---

## 🧪 Quick Test

1. **Login** to the app
2. **Navigate** to home screen
3. **Press** hardware back button
4. **Result:** App should exit

5. **Navigate** to any screen
6. **Press** back button
7. **Result:** Should go back normally

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/components/BackButtonHandler.js` | Main implementation |
| `src/utils/navigationHelper.js` | Helper functions |
| `app/_layout.js` | Integration point |
| `VALIDATION_REPORT.md` | Complete validation |
| `TESTING_GUIDE.md` | Testing procedures |

---

## 🐛 Debugging

### View Logs
```bash
adb logcat | grep -E "BackButtonHandler|safeNavigate"
```

### Common Issues

**Issue:** Back button not working
```bash
# Check integration
grep "BackButtonHandler" app/_layout.js

# Rebuild
npm start --reset-cache
```

**Issue:** Wrong home redirect
```javascript
// Check user type in AsyncStorage
// Key: 'user_type'
// Values: 'customer', 'manager', 'chef'
```

---

## ✅ Validation Checklist

- ☑ `validate-back-button-setup.sh` passes
- ☑ App builds without errors
- ☑ All route files exist
- ☑ User types correctly stored after login

---

## 🎯 Expected Behavior Summary

### Customer (Menutha)
```
Login → /customer-home → Back → Exit
```

### Manager (Menuva)
```
Login → /dashboard → Back → Exit
```

### Chef (Menuva)
```
Login → /chef-home → Back → Exit
```

---

## 📞 Need Help?

1. Check console logs
2. Run validation script
3. Review `VALIDATION_REPORT.md`
4. Check `TESTING_GUIDE.md`
5. Review `USER_TYPES_ROUTING.md`

---

## 🎉 Status

✅ **Implementation:** Complete
✅ **Validation:** All checks passed
✅ **Documentation:** Complete
⏳ **Testing:** Ready to execute

---

**Last Updated:** October 18, 2025
**Version:** 1.0.0
**Status:** Production Ready
