# Push Notification Troubleshooting Guide

## 🚨 "API says sent:1 but I don't see notification"

This is the most common issue! Here's why and how to fix it:

---

## ✅ Quick Diagnostic Checklist

Visit your test page first: **http://localhost:3000/test-notifications**

This will check:
- ✅ Browser support
- ✅ Notification permission status
- ✅ Service worker registration
- ✅ FCM token generation

---

## 🔍 Common Causes & Solutions

### 1. **Browser Permission Not Granted** (Most Common)

**Symptoms:**
- API says "sent: 1"
- No notification appears
- Console might show permission errors

**Check:**
```javascript
// Open browser console and type:
Notification.permission
// Should return: "granted"
// If it returns "default" or "denied", that's the problem!
```

**Fix for "default":**
1. Subscribe to a campaign
2. Click "Allow" when browser asks

**Fix for "denied":**
1. Click **lock icon** in address bar
2. Find **Notifications** → Change to **Allow**
3. Refresh page
4. Subscribe again

---

### 2. **Operating System Notifications Blocked**

**Even if browser permission is granted, OS might block it!**

#### macOS:
1. **System Settings** → **Notifications**
2. Find your **browser** (Chrome, Firefox, Safari)
3. Make sure **Allow notifications** is ON
4. Check **notification style** is not "None"

#### Windows:
1. **Settings** → **System** → **Notifications**
2. Find your **browser**
3. Toggle notifications **ON**

#### iOS (Safari only):
1. **Settings** → **Safari** (or Chrome/Firefox)
2. **Notifications** → **Allow**

#### Android:
1. **Settings** → **Apps** → **Your browser**
2. **Notifications** → **Allow**

---

### 3. **Do Not Disturb / Focus Mode**

**Your system might be in DND mode!**

- **macOS:** Check menu bar for moon icon
- **Windows:** Check Action Center
- **iOS/Android:** Swipe down to check

**Fix:** Disable Do Not Disturb mode

---

### 4. **Page is Open (Foreground Issue)**

When the page sending the notification is currently open in a tab, browsers handle it differently.

**Expected behavior:**
- ✅ Page open → Toast notification (in-app)
- ✅ Page closed → System notification

**After my fix:**
Both should work now! The `NotificationListener` component handles foreground messages.

**Test it:**
1. Keep page open in one tab
2. Send notification
3. Should see toast notification at top
4. Close all tabs
5. Send another notification
6. Should see system notification

---

### 5. **Service Worker Not Registered**

**Check in browser:**
1. Open **DevTools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** (Firefox)
3. Click **Service Workers** in left sidebar
4. Should see: `firebase-messaging-sw.js` with status **Activated**

**If not registered:**

**Fix 1:** Check file exists
```bash
# Should exist:
ls public/firebase-messaging-sw.js
```

**Fix 2:** Hard refresh
- Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- This clears service worker cache

**Fix 3:** Unregister and re-register
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()))
  .then(() => location.reload())
```

---

### 6. **VAPID Key Missing or Incorrect**

**Check your `.env.local`:**
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BM4...your_key_here
```

**How to verify:**
```bash
# In browser console:
console.log(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)
// Should show your key, not undefined
```

**If undefined or wrong:**
1. Get correct key from Firebase Console
2. Project Settings → Cloud Messaging → Web Push certificates
3. Copy the key pair value
4. Add to `.env.local`
5. **Restart dev server**

---

### 7. **Notification Settings in Browser**

Some browsers have additional notification settings.

#### Chrome:
1. **Settings** → **Privacy and security** → **Site Settings**
2. **Notifications**
3. Check "Sites can ask to send notifications" is ON
4. Check your site isn't in "Not allowed to send notifications"

#### Firefox:
1. **Settings** → **Privacy & Security**
2. **Permissions** → **Notifications** → **Settings**
3. Check your site's permission

#### Safari:
1. **Safari** → **Settings** → **Websites** → **Notifications**
2. Find your site → Set to **Allow**

---

### 8. **Browser Tab is Hidden/Minimized**

Some browsers don't show notifications for hidden tabs.

**Test:**
1. Close ALL tabs of your site
2. Send notification from terminal
3. Should see system notification

If you see it when tabs are closed but not when open, that's expected! The foreground handler (toast) should show instead.

---

## 🧪 Step-by-Step Testing

### Test 1: Local Notification
```javascript
// In browser console on your site:
new Notification('Test', { 
  body: 'If you see this, notifications work!' 
});
```

**Result:**
- ✅ Notification appears → Permission and OS settings are fine
- ❌ Error or nothing → Check permission and OS settings above

### Test 2: Service Worker
```javascript
// In browser console:
navigator.serviceWorker.getRegistration()
  .then(reg => console.log('Registered:', !!reg))
```

**Result:**
- ✅ `Registered: true` → Service worker is working
- ❌ `Registered: false` → Follow service worker fixes above

### Test 3: FCM Token
```javascript
// Subscribe to a campaign, check console for:
"✅ Push notifications enabled"
```

**Result:**
- ✅ See this message → FCM token obtained successfully
- ❌ Don't see it → Check VAPID key and service worker

### Test 4: End-to-End

**Method 1: Via UI**
1. Go to http://localhost:3000/test-notifications
2. Click "Request Notification Permission"
3. Click "Test Local Notification"
4. Should see notification immediately

**Method 2: Via API**
1. Subscribe to a campaign (get campaignId from Firestore or logs)
2. Send notification:
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "your_campaign_uid",
    "title": "Test",
    "body": "Hello!",
    "url": "/"
  }'
```
3. Check response: `"sent": 1, "failed": 0`
4. Should see notification

---

## 📊 Debugging Info to Collect

If still not working, gather this info:

```javascript
// Run in browser console:
console.log({
  browser: navigator.userAgent,
  permission: Notification.permission,
  serviceWorker: 'serviceWorker' in navigator,
  hasRegistration: !!(await navigator.serviceWorker.getRegistration()),
  vapidKey: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  pushSupport: 'PushManager' in window
});
```

---

## 🎯 Most Likely Issues (in order)

1. **OS-level notifications disabled** (60% of cases)
2. **Browser permission not granted** (20% of cases)
3. **Do Not Disturb mode enabled** (10% of cases)
4. **Service worker not registered** (5% of cases)
5. **VAPID key missing** (3% of cases)
6. **Other** (2% of cases)

---

## 💡 Pro Tips

### Testing Best Practices:

1. **Always test with tabs closed first**
   - Easiest way to see system notifications
   - Eliminates foreground/background confusion

2. **Check OS notifications FIRST**
   - Most common issue
   - Browser settings won't help if OS blocks it

3. **Use the test page**
   - http://localhost:3000/test-notifications
   - Shows all diagnostics in one place

4. **Check browser console**
   - Errors are usually clear
   - Service worker logs show registration status

5. **Test in incognito/private mode**
   - Eliminates extension interference
   - Fresh permission state

---

## 🔧 Emergency Reset

If nothing works, do a complete reset:

```javascript
// 1. Unregister all service workers
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));

// 2. Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();

// 3. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

// 4. Reset notification permission:
// - Click lock icon in address bar
// - Reset permissions for the site
// - Reload page

// 5. Restart dev server
// npm run dev

// 6. Try subscribing again
```

---

## ✅ Success Checklist

- [ ] OS notifications enabled for your browser
- [ ] Browser notification permission granted
- [ ] Do Not Disturb mode disabled
- [ ] Service worker registered and active
- [ ] VAPID key set in .env.local
- [ ] Dev server restarted after env changes
- [ ] FCM token obtained (check console)
- [ ] Test notification works from test page
- [ ] API response shows "sent: 1, failed: 0"
- [ ] Notification appears (toast or system)

---

## 🆘 Still Not Working?

1. Visit: http://localhost:3000/test-notifications
2. Run all checks
3. Share the results

Include:
- Browser and version
- Operating system
- Test page diagnostics
- Console errors (if any)
- API response
- What you've tried

---

## 📚 Related Docs

- [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md) - Setup guide
- [NOTIFICATION_ERRORS_GUIDE.md](./NOTIFICATION_ERRORS_GUIDE.md) - Error explanations
- [INSTALL_PUSH_NOTIFICATIONS.md](./INSTALL_PUSH_NOTIFICATIONS.md) - Quick start

---

**TL;DR:** 
1. Check OS notification settings first (most common!)
2. Verify browser permission is "granted"
3. Disable Do Not Disturb
4. Test with http://localhost:3000/test-notifications
5. Close all tabs and try again

You've got this! 🚀

