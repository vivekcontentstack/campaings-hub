# Quick Push Notifications Setup

## ⚡ Quick Start (5 minutes)

### Step 1: Get VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ Project Settings → Cloud Messaging tab
4. Scroll to "Web Push certificates"
5. Click "Generate key pair" (if you don't have one)
6. Copy the key

### Step 2: Add to Environment

Add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### Step 3: Add Notification Icons

Create or add these files to `public/` folder:
- `icon-192x192.png` (192x192 pixels)
- `badge-72x72.png` (72x72 pixels)

You can use your logo or create simple placeholders.

### Step 4: Restart Server

```bash
npm run dev
```

## ✅ Test It

1. Visit any campaign page
2. Subscribe to the campaign
3. Click "Allow" when browser asks for notification permission
4. Send a test notification:

```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "your_campaign_uid",
    "title": "Test Notification",
    "body": "Hello from your campaign!",
    "url": "/facebook-campaign"
  }'
```

You should receive a notification! 🎉

---

## 📨 Sending Notifications

### From Your Code

```typescript
await fetch('/api/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 'blt123456',
    title: 'New Update!',
    body: 'Check out our latest content',
    url: '/my-campaign'
  })
});
```

### Get Campaign Stats

```bash
curl http://localhost:3000/api/send-notification?campaignId=blt123456
```

Returns:
```json
{
  "totalSubscribers": 10,
  "notificationEnabled": 7,
  "notificationDisabled": 3
}
```

---

## 🎯 What Happens?

1. **User subscribes** → Browser asks for permission
2. **User allows** → FCM token saved to Firestore
3. **You send notification** → Goes to all subscribers
4. **User receives:**
   - System notification if page is closed
   - In-page toast if page is open
5. **User clicks** → Opens campaign page

---

## 📚 Full Documentation

For detailed setup, customization, and troubleshooting, see:
- [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md)

---

## 🔒 Privacy

- Users must explicitly grant permission
- Can only send to users who allowed notifications
- Stored securely in Firestore (server-side only)

---

## 🐛 Troubleshooting

**No VAPID key?**
- Get it from Firebase Console → Cloud Messaging → Web Push certificates

**Notifications not working?**
- Check browser console for errors
- Verify `.env.local` has VAPID key
- Ensure icons exist in `/public`
- Try on different browser

**Permission denied?**
- User needs to reset permissions in browser
- Click lock icon in address bar → Site settings → Notifications

---

## 🚀 Production

Before deploying:

1. Add VAPID key to Vercel environment variables
2. Ensure HTTPS is enabled (required for push)
3. Add notification icons to production
4. Test on multiple devices
5. Update privacy policy

---

Need help? Check the [full guide](./PUSH_NOTIFICATIONS_SETUP.md)! 🎉

