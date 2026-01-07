# Firebase Setup Guide

This guide will help you set up Firebase for campaign-specific subscription tracking.

## 1. Install Firebase Dependencies

```bash
npm install firebase firebase-admin
```

## 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Firestore Database in "Build" > "Firestore Database"

## 3. Get Firebase Configuration

### For Client-Side (Web App Config)

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the Web icon (`</>`)
4. Register your app
5. Copy the configuration values

### For Server-Side (Service Account)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely

## 4. Environment Variables

Add these to your `.env.local` file:

### Client-Side Variables (Public)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Server-Side Variables (Private)

**Option 1: Individual credentials (recommended for development)**
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

**Option 2: Service account JSON (recommended for production)**
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

## 5. Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Campaign subscriptions - write via server only
    match /campaign_subscriptions/{docId} {
      allow read: if false; // No client-side reads
      allow write: if false; // Only server can write
    }
    
    // User subscriptions - read/write via server only
    match /user_subscriptions/{email} {
      allow read: if false; // No client-side reads
      allow write: if false; // Only server can write
    }
  }
}
```

## 6. Firestore Indexes

The app automatically creates simple queries. If you see performance warnings, add these indexes:

1. Go to Firestore Database > Indexes
2. Click "Add Index"
3. Add these composite indexes if needed:
   - Collection: `campaign_subscriptions`
     - Fields: `campaignId` (Ascending), `submittedAt` (Descending)
   - Collection: `user_subscriptions`
     - Fields: `email` (Ascending), `lastUpdated` (Descending)

## 7. Data Structure

### campaign_subscriptions Collection

Document ID format: `{email}_{campaignId}` (prevents duplicates)

```typescript
{
  name: string,
  email: string,
  campaignId: string,
  campaignTitle: string,
  campaignUrl: string,
  submittedAt: Timestamp,
  ipAddress: string,
  userAgent: string
}
```

### user_subscriptions Collection

Document ID: user's email

```typescript
{
  email: string,
  name: string,
  campaigns: {
    [campaignId]: {
      subscribedAt: Timestamp,
      campaignTitle: string,
      campaignUrl: string
    }
  },
  lastUpdated: Timestamp
}
```

## 8. Verification

After setup, test the subscription modal:

1. Visit any campaign page (e.g., `/facebook-campaign`)
2. Wait for the modal to appear (15 seconds or scroll 40%)
3. Submit the form with test data
4. Check Firestore Console to verify the data is stored
5. Visit the same campaign again - modal should not appear
6. Visit a different campaign - modal should appear

## 9. Production Considerations

### Security
- ✅ All writes go through server-side API routes
- ✅ Email validation on server
- ✅ Duplicate prevention using compound document IDs
- ✅ IP address and user agent tracking for audit

### Performance
- ✅ Uses Firestore's fast document lookups
- ✅ Compound document IDs eliminate need for queries
- ✅ Client-side localStorage for instant duplicate checks
- ✅ Session storage prevents modal spam

### Privacy
- Email addresses are stored in lowercase and trimmed
- No sensitive data is stored
- Users can unsubscribe (implement unsubscribe logic as needed)

## 10. Monitoring

Monitor subscription activity:

```javascript
// Query all subscriptions for a campaign
const campaignSubs = await adminDb
  .collection('campaign_subscriptions')
  .where('campaignId', '==', 'your_campaign_id')
  .orderBy('submittedAt', 'desc')
  .get();

// Query all campaigns a user subscribed to
const userDoc = await adminDb
  .collection('user_subscriptions')
  .doc('user@example.com')
  .get();
```

## Troubleshooting

### "Failed to save subscription" error
- Check that Firebase credentials are correct in `.env.local`
- Verify Firestore is enabled in Firebase Console
- Check server logs for detailed error messages

### Modal shows repeatedly
- Check browser's localStorage and sessionStorage
- Clear storage and reload
- Verify campaignId is being passed correctly

### Module not found errors
- Run `npm install firebase firebase-admin`
- Restart the dev server

## Support

For issues:
1. Check Firebase Console > Firestore > Usage for errors
2. Check browser console for client-side errors
3. Check server logs (terminal) for API errors

