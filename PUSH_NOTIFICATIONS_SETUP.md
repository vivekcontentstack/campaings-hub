# Push Notifications Setup Guide


This guide will help you set up web push notifications for campaign subscribers using Firebase Cloud Messaging (FCM).

## 🚀 Features

- ✅ Browser push notifications for campaign subscribers
- ✅ Automatic permission request after subscription
- ✅ Background notifications when page is closed
- ✅ Foreground notifications when page is open
- ✅ Click-to-open campaign pages
- ✅ Notification statistics per campaign
- ✅ Automatic token cleanup for invalid devices

---

## 📋 Prerequisites

1. Firebase project with Firestore enabled
2. Existing campaign subscription system working
3. HTTPS (required for service workers - localhost works too)

---

## 🔧 Setup Steps

### Step 1: Get Your VAPID Key

VAPID (Voluntary Application Server Identification) key is required for web push.

1. **Go to Firebase Console**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Select your project

2. **Navigate to Cloud Messaging**
   - Click ⚙️ Project Settings
   - Click "Cloud Messaging" tab

3. **Generate Web Push Certificates**
   - Scroll to "Web Push certificates" section
   - If you don't have a key pair, click "Generate key pair"
   - Copy the "Key pair" value (starts with `B...`)

4. **Add to Environment Variables**

Add this to your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### Step 2: Update Environment Variables

Your complete Firebase config in `.env.local` should now include:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### Step 3: Add Notification Icons

Create or add these icon files to your `public` folder:

```
public/
├── icon-192x192.png   (192x192 pixels)
├── badge-72x72.png    (72x72 pixels)
└── firebase-messaging-sw.js (already created)
```

You can use your campaign logo or brand icon. Quick placeholders:

```bash
# Create placeholder icons (requires ImageMagick)
cd public
convert -size 192x192 xc:blue -pointsize 72 -fill white -gravity center -annotate +0+0 "C" icon-192x192.png
convert -size 72x72 xc:blue -pointsize 32 -fill white -gravity center -annotate +0+0 "C" badge-72x72.png
```

Or use online tools like [favicon.io](https://favicon.io/) to generate icons.

### Step 4: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing

### Test 1: Subscribe with Notifications

1. Visit a campaign page (e.g., `http://localhost:3000/facebook-campaign`)
2. Wait for the subscription modal to appear
3. Fill in name and email
4. Click "Get Instant Access"
5. Browser will ask for notification permission
6. Click "Allow"
7. Check browser console for: `✅ Push notifications enabled`

### Test 2: Check Firestore Data

Go to Firebase Console → Firestore → `campaign_subscriptions`

You should see:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "campaignId": "blt123456",
  "notificationsEnabled": true,
  "fcmToken": "eXampleToken...",
  "fcmTokenUpdatedAt": "2025-01-07T..."
}
```

### Test 3: Send a Test Notification

Use the API endpoint to send a notification:

```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "your_campaign_uid",
    "title": "Test Notification",
    "body": "This is a test message!",
    "url": "/facebook-campaign"
  }'
```

You should receive a notification on your device!

### Test 4: Check Notification Stats

```bash
curl http://localhost:3000/api/send-notification?campaignId=your_campaign_uid
```

Response:
```json
{
  "campaignId": "blt123456",
  "totalSubscribers": 5,
  "notificationEnabled": 3,
  "notificationDisabled": 2
}
```

---

## 📱 User Experience Flow

1. **User visits campaign page**
2. **Subscription modal appears** (after 15s or 40% scroll)
3. **User fills form and submits**
4. **Browser requests notification permission**
5. **User clicks "Allow" or "Block":**
   - **Allow**: FCM token saved, user gets notifications
   - **Block**: Subscription still created, no notifications
6. **Admin sends notification** via API
7. **User receives push notification:**
   - Page open: Foreground notification (toast)
   - Page closed: Background notification (system)
8. **User clicks notification** → Opens campaign page

---

## 🔐 Security & Privacy

### What Gets Stored

```typescript
// Per campaign subscription
{
  fcmToken: string,              // Device-specific token
  notificationsEnabled: boolean, // Did user grant permission?
  fcmTokenUpdatedAt: timestamp   // When token was last updated
}

// Per user
{
  fcmTokens: {
    [token]: {
      addedAt: timestamp,
      campaigns: string[]          // Which campaigns they subscribed to
    }
  }
}
```

### Security Features

- ✅ Tokens stored server-side only
- ✅ User must explicitly grant permission
- ✅ Can only send to users who subscribed AND granted permission
- ✅ Automatic cleanup of invalid/expired tokens
- ✅ HTTPS required in production

---

## 📨 Sending Notifications

### Option 1: Via API (Programmatic)

```typescript
const response = await fetch('/api/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 'blt123456',
    title: 'New Campaign Update!',
    body: 'Check out our latest resources',
    url: '/facebook-campaign',
    imageUrl: 'https://example.com/image.jpg' // optional
  })
});
```

### Option 2: From Contentstack (Future Enhancement)

You could create a Contentstack webhook that triggers notifications when:
- Campaign is published
- Campaign content is updated
- New resources are added

### Option 3: Scheduled (Future Enhancement)

Use Vercel Cron Jobs to send periodic notifications:

```typescript
// app/api/cron/send-weekly-digest/route.ts
export async function GET() {
  // Send weekly digest to all subscribers
  // ...
}
```

---

## 🎨 Customizing Notifications

### Notification Structure

```typescript
{
  notification: {
    title: "Campaign Update",
    body: "Check out our new content!",
    icon: "/icon-192x192.png",      // Notification icon
    badge: "/badge-72x72.png",      // Small badge icon
    image: "https://...",           // Large image (optional)
  },
  data: {
    campaignId: "blt123456",
    url: "/facebook-campaign",
    customData: "anything"
  }
}
```

### Styling

Modify `/public/firebase-messaging-sw.js` to customize:
- Notification appearance
- Action buttons
- Sound/vibration patterns
- Priority/urgency

---

## 📊 Monitoring & Analytics

### Get Stats Per Campaign

```javascript
const stats = await fetch('/api/send-notification?campaignId=blt123');
// Returns: totalSubscribers, notificationEnabled, notificationDisabled
```

### Track Notification Success

Check API response:
```json
{
  "sent": 10,
  "failed": 2,
  "total": 12
}
```

### Firebase Console

Monitor in Firebase Console → Cloud Messaging:
- Sent messages
- Delivery rate
- Open rate
- Platform breakdown

---

## 🐛 Troubleshooting

### "Notification permission denied"

**Solution:** User clicked "Block". They need to:
1. Click the lock icon in browser address bar
2. Reset notification permissions
3. Refresh page and try again

### "Service worker registration failed"

**Solution:** 
- Check browser console for errors
- Ensure `/public/firebase-messaging-sw.js` exists
- Try clearing service worker:
  ```javascript
  navigator.serviceWorker.getRegistrations()
    .then(regs => regs.forEach(reg => reg.unregister()))
  ```

### "No FCM token obtained"

**Solutions:**
- Check VAPID key is correct in `.env.local`
- Ensure HTTPS (or localhost)
- Check browser supports notifications
- Try different browser

### Notifications not appearing

**Check:**
1. Notification permission granted?
2. System notifications enabled (OS level)?
3. Do Not Disturb mode disabled?
4. Browser notifications enabled in settings?

### "Invalid FCM token" or "NotRegistered" errors

**This is completely normal!** ✅

Tokens expire when users:
- Clear browser data
- Revoke notification permission
- Switch devices/browsers

**The system automatically handles this:**
- ✅ Detects invalid tokens
- ✅ Removes them from database
- ✅ Updates subscription status
- ✅ Logs cleanup action

User can simply re-subscribe to get a new token.

See [NOTIFICATION_ERRORS_GUIDE.md](./NOTIFICATION_ERRORS_GUIDE.md) for details.

---

## 🚀 Production Checklist

- [ ] VAPID key added to `.env` (production)
- [ ] Service worker at `/public/firebase-messaging-sw.js`
- [ ] Notification icons added (192x192, 72x72)
- [ ] HTTPS enabled (required for push)
- [ ] Firebase Cloud Messaging enabled
- [ ] Firestore indexes created (if needed)
- [ ] Test notifications on multiple devices
- [ ] Test on mobile browsers (Chrome, Safari)
- [ ] Privacy policy updated (mention notifications)
- [ ] Unsubscribe mechanism (future enhancement)

---

## 📱 Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome  | ✅      | ✅     | Full support |
| Firefox | ✅      | ✅     | Full support |
| Safari  | ✅      | ✅     | iOS 16.4+ |
| Edge    | ✅      | ✅     | Full support |
| Opera   | ✅      | ✅     | Full support |

---

## 🔄 Future Enhancements

1. **Notification Preferences**
   - Let users choose notification frequency
   - Category preferences (updates, offers, news)

2. **Rich Notifications**
   - Action buttons ("View Now", "Remind Later")
   - Images and videos
   - Progress indicators

3. **Personalization**
   - Send based on user behavior
   - Time zone aware sending
   - Language preferences

4. **Admin Dashboard**
   - UI to send notifications
   - Schedule notifications
   - A/B testing

5. **Analytics**
   - Click-through rates
   - Conversion tracking
   - Engagement metrics

---

## 📚 Additional Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check server logs (terminal)
3. Verify all environment variables are set
4. Test with different browsers
5. Check Firebase Console for errors

Happy notifying! 🔔

