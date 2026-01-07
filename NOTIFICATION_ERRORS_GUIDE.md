# Push Notification Errors Guide

This guide explains common push notification errors and how the system handles them.

## 🔍 Common Errors

### 1. NotRegistered / `messaging/registration-token-not-registered`

**What it means:**
The FCM token is no longer valid. This happens when:
- User cleared browser data/cache
- User revoked notification permission
- User uninstalled/reinstalled browser
- Token has expired (FCM tokens can expire)
- User switched devices

**Is this a problem?**
❌ **No!** This is completely normal and expected.

**What happens automatically:**
✅ System detects the invalid token
✅ Removes it from Firestore database
✅ Updates subscription status to `notificationsEnabled: false`
✅ Logs cleanup in console

**User impact:**
- User won't receive notifications until they subscribe again
- If they visit the campaign page again, modal will reappear
- They can re-subscribe and get a new valid token

---

### 2. Invalid Registration Token / `messaging/invalid-registration-token`

**What it means:**
The token format is incorrect or corrupted.

**What happens automatically:**
✅ Automatically removed from database

**How to prevent:**
- Ensure VAPID key is correct
- Don't manually edit tokens in database
- Let the system generate tokens

---

### 3. Invalid Argument / `messaging/invalid-argument`

**What it means:**
The notification payload has an issue (too large, invalid format, etc.)

**What happens automatically:**
✅ Token removed if consistently failing

**How to fix:**
- Check notification title/body length (title: 50 chars, body: 200 chars recommended)
- Ensure image URLs are valid and accessible
- Validate JSON structure

---

### 4. Quota Exceeded / `messaging/quota-exceeded`

**What it means:**
You've hit FCM's free tier limits:
- Free tier: ~1 million messages/month
- Rate limits apply

**What happens:**
⚠️ Notifications temporarily fail

**How to fix:**
- Wait for quota to reset
- Upgrade Firebase plan
- Batch notifications more efficiently
- Send less frequently

---

### 5. Permission Denied / Not allowed in browser

**What it means:**
User's browser/OS has blocked notifications.

**What happens:**
- User won't get notification permission dialog
- Subscription still works, just without notifications
- No FCM token is generated

**How user can fix:**
1. **Chrome/Edge:**
   - Click lock icon in address bar
   - Site settings → Notifications → Allow

2. **Firefox:**
   - Click lock icon → Permissions → Notifications → Allow

3. **Safari:**
   - Safari → Settings → Websites → Notifications → Allow

4. **OS Level (Important!):**
   - **macOS:** System Settings → Notifications → Browser → Allow
   - **Windows:** Settings → Notifications → Browser → On
   - **iOS:** Settings → Browser → Notifications → Allow
   - **Android:** Settings → Apps → Browser → Notifications → Allow

---

## 🔄 Automatic Token Cleanup

The system automatically cleans up invalid tokens:

```typescript
// When sending fails with these errors:
const invalidErrorCodes = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
];

// System automatically:
1. Identifies invalid tokens
2. Removes from campaign_subscriptions
3. Removes from user_subscriptions
4. Updates notificationsEnabled to false
5. Logs cleanup action
```

### What gets updated in Firestore:

**Before cleanup:**
```json
{
  "fcmToken": "expired_token_here",
  "notificationsEnabled": true
}
```

**After cleanup:**
```json
{
  "notificationsEnabled": false,
  "tokenRemovedAt": "2025-01-07T...",
  "tokenRemovedReason": "Invalid or expired token"
}
```

---

## 📊 Monitoring

### Check notification stats:

```bash
curl http://localhost:3000/api/send-notification?campaignId=your_campaign_uid
```

Response:
```json
{
  "campaignId": "blt123456",
  "totalSubscribers": 100,
  "notificationEnabled": 75,    // Active tokens
  "notificationDisabled": 25    // Cleaned up or denied
}
```

### Send notification and see cleanup:

```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "your_campaign_uid",
    "title": "Test",
    "body": "Hello!"
  }'
```

Response with cleanup:
```json
{
  "success": true,
  "sent": 75,
  "failed": 3,
  "total": 78,
  "cleanedUp": 3,
  "note": "Invalid tokens have been automatically removed from database"
}
```

---

## 🔧 Console Logs Explained

### Normal operation:
```
✅ Notifications sent: 10/10
```

### With invalid tokens:
```
✅ Notifications sent: 8/10
❌ Failed to send 2 notifications
Failed token error [messaging/registration-token-not-registered]: Requested entity was not found.
🧹 Cleaning up 2 invalid tokens...
✅ Updated 4 documents, removed 2 invalid tokens
✅ Invalid tokens removed from database
```

**What this means:**
- 8 notifications delivered successfully
- 2 tokens were invalid (users cleared data or revoked permission)
- System automatically cleaned up those 2 invalid tokens
- Everything is working correctly! ✅

---

## 🎯 Best Practices

### 1. Expect Token Expiration
```typescript
// Don't worry about NotRegistered errors
// They're normal and handled automatically
```

### 2. Provide Re-subscription Path
```typescript
// Modal will reappear for users with invalid tokens
// They can easily re-subscribe
```

### 3. Monitor Cleanup Rates
```typescript
// If cleanup rate is > 30%, investigate:
// - Are users frequently clearing browser data?
// - Are tokens expiring too quickly?
// - Is there a configuration issue?
```

### 4. Don't Retry Invalid Tokens
```typescript
// System automatically removes them
// Retrying won't help - user needs new token
```

---

## 🐛 Troubleshooting

### Many tokens getting cleaned up?

**Check these:**
1. **VAPID key correct?**
   ```env
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_key
   ```

2. **Firebase project matches?**
   ```env
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=correct-project
   ```

3. **Service worker registered?**
   - Check browser DevTools → Application → Service Workers
   - Should see `firebase-messaging-sw.js` active

4. **Users clearing data?**
   - Some browser extensions auto-clear data
   - Incognito/private mode doesn't persist tokens

### No notifications being sent?

**Debug steps:**
1. Check if tokens exist in Firestore
2. Verify FIREBASE_PRIVATE_KEY is set correctly
3. Check Firebase Console → Cloud Messaging for errors
4. Test with a fresh subscription
5. Check browser console for permission errors

### Cleanup not working?

**Verify:**
1. Firebase Admin SDK initialized correctly
2. Firestore permissions allow writes
3. Check server logs for cleanup errors
4. Ensure batch operations not failing

---

## 📈 Expected Metrics

**Healthy notification system:**
- Delivery rate: 90-95%
- Token cleanup rate: 5-10% per send
- Permission grant rate: 30-50% (varies by audience)

**If you see:**
- Delivery rate < 80%: Investigate token generation
- Cleanup rate > 30%: Check configuration
- Permission grant < 20%: Improve messaging/timing

---

## 🚨 When to Actually Worry

**✅ Normal (Don't worry):**
- NotRegistered errors (token expired)
- Some users declining permission
- Occasional cleanup of invalid tokens
- 5-15% failure rate on sends

**⚠️ Investigate:**
- All notifications failing
- 100% token cleanup rate
- No tokens being generated
- VAPID key errors
- Firebase quota exceeded
- High latency on sends

**🚨 Critical:**
- Firebase credentials invalid
- Firestore permissions blocking writes
- Service worker not registering
- CORS errors on token generation

---

## 💡 Tips

1. **Educate users:** Let them know they'll get valuable updates
2. **Timing matters:** Don't ask for permission immediately
3. **Provide value:** First notification should be useful
4. **Frequency:** Don't spam - respect user's attention
5. **Allow re-opt-in:** Make it easy to re-enable notifications

---

## 🔗 Related Documentation

- [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md) - Full setup guide
- [INSTALL_PUSH_NOTIFICATIONS.md](./INSTALL_PUSH_NOTIFICATIONS.md) - Quick start
- [Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)

---

## Summary

**The "NotRegistered" error is completely normal!** 

It just means a user's browser data was cleared or they revoked permission. The system automatically cleans up invalid tokens and users can easily re-subscribe if they visit the campaign again.

**No action needed from you!** The error handling is working exactly as designed. 🎉

