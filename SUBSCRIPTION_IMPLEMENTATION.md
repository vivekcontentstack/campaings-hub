# Campaign-Specific Subscription Modal Implementation

## Overview

Implemented a secure, campaign-specific subscription modal system using Firebase Firestore. Users see the modal once per campaign and can subscribe to multiple campaigns independently.

## Key Features

### 1. Campaign-Specific Tracking
- ✅ Each campaign has its own subscription tracking
- ✅ Users who subscribe to Campaign A will still see the modal for Campaign B
- ✅ Once subscribed to a campaign, the modal never shows again for that campaign
- ✅ Uses localStorage for permanent tracking across sessions

### 2. Smart Modal Triggers
- **Time-based**: Shows after 15 seconds on page
- **Scroll-based**: Shows when user scrolls 40% down the page
- **Session-based**: Won't show if already shown in current session
- **Subscription-based**: Won't show if user already subscribed to this campaign

### 3. Secure Firestore Storage
- ✅ All writes go through server-side API routes (not client-side)
- ✅ Firestore security rules prevent direct client access
- ✅ Email validation and sanitization on server
- ✅ Duplicate prevention using compound document IDs
- ✅ IP address and user agent tracking for audit trails

### 4. Data Structure

#### campaign_subscriptions Collection
```typescript
Document ID: {email}_{campaignId}

{
  name: "John Doe",
  email: "john@example.com",
  campaignId: "blt123456",
  campaignTitle: "Marketing Trends 2025",
  campaignUrl: "/marketing-trends-webinar-2025",
  submittedAt: Timestamp,
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

#### user_subscriptions Collection
```typescript
Document ID: {email}

{
  email: "john@example.com",
  name: "John Doe",
  campaigns: {
    "blt123456": {
      subscribedAt: Timestamp,
      campaignTitle: "Marketing Trends 2025",
      campaignUrl: "/marketing-trends-webinar-2025"
    },
    "blt789012": {
      subscribedAt: Timestamp,
      campaignTitle: "Facebook Campaign",
      campaignUrl: "/facebook-campaign"
    }
  },
  lastUpdated: Timestamp
}
```

## Implementation Details

### Files Created

1. **`lib/firebase.ts`** - Server-side Firebase Admin SDK initialization
2. **`lib/firebase-client.ts`** - Client-side Firebase SDK (for future features)
3. **`app/api/subscribe-modal/route.ts`** - API endpoint for subscriptions
4. **`FIREBASE_SETUP.md`** - Comprehensive setup guide
5. **`INSTALL_FIREBASE.md`** - Quick installation guide

### Files Modified

1. **`components/subscription-modal.tsx`**
   - Added campaign-specific props
   - Implemented campaign-specific session/local storage keys
   - Added success state with animation
   - Integrated with Firestore API
   - Added toast notifications

2. **`app/[campaigns]/page.tsx`**
   - Pass campaign UID, title, and URL to modal

## User Flow

1. **First Visit to Campaign A**
   - User lands on Campaign A page
   - Modal shows after 15 seconds OR 40% scroll
   - Session key: `subscriptionModal_campaignA` is set
   - User subscribes
   - Data saved to Firestore
   - LocalStorage key: `subscribed_campaignA` is set
   - Success message shows, modal closes

2. **Return to Campaign A**
   - User returns to Campaign A
   - Modal checks localStorage: `subscribed_campaignA` exists
   - Modal does NOT show ✅

3. **Visit Campaign B**
   - User visits Campaign B
   - Modal checks localStorage: `subscribed_campaignB` does NOT exist
   - Modal shows after triggers ✅
   - User can subscribe again

## Security Features

### Server-Side Validation
```typescript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Data sanitization
email: email.toLowerCase().trim(),
name: name.trim()

// Duplicate prevention
docId: `${email.toLowerCase()}_${campaignId}`
```

### Firestore Rules (Server-Only)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /campaign_subscriptions/{docId} {
      allow read, write: if false; // Only server can access
    }
    match /user_subscriptions/{email} {
      allow read, write: if false; // Only server can access
    }
  }
}
```

### Audit Trail
Every subscription includes:
- Timestamp
- IP address (from request headers)
- User agent (browser/device info)

## Performance Optimizations

1. **Fast Lookups**: Compound document IDs eliminate need for queries
2. **Client-Side Cache**: localStorage prevents unnecessary API calls
3. **Session Storage**: Prevents modal spam in same session
4. **Firestore Indexes**: Automatic for single-field queries

## API Endpoints

### POST /api/subscribe-modal
Submit a new subscription

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "campaignId": "blt123456",
  "campaignTitle": "Marketing Trends 2025",
  "campaignUrl": "/marketing-trends-webinar-2025"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription successful",
  "docId": "john@example.com_blt123456"
}
```

### GET /api/subscribe-modal
Check if a user has subscribed to a campaign

**Query Params:**
- `email`: User's email
- `campaignId`: Campaign UID

**Response:**
```json
{
  "hasSubscribed": true,
  "data": { ... }
}
```

## Testing Checklist

- [ ] Install Firebase dependencies: `npm install firebase firebase-admin`
- [ ] Add Firebase credentials to `.env.local`
- [ ] Enable Firestore in Firebase Console
- [ ] Set Firestore security rules
- [ ] Restart dev server
- [ ] Visit a campaign page
- [ ] Wait for modal to appear
- [ ] Submit subscription form
- [ ] Verify data in Firestore Console
- [ ] Revisit same campaign - modal should NOT show
- [ ] Visit different campaign - modal SHOULD show
- [ ] Clear localStorage - modal should show again

## Future Enhancements

1. **Admin Dashboard**: View all subscriptions per campaign
2. **Export Functionality**: Export subscribers to CSV
3. **Email Integration**: Send welcome emails via Contentstack email templates
4. **Unsubscribe**: Allow users to unsubscribe from campaigns
5. **Analytics**: Track modal impression vs conversion rates
6. **A/B Testing**: Test different modal designs and copy

## Environment Variables Required

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Support

For detailed setup instructions, see:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Full guide
- [INSTALL_FIREBASE.md](./INSTALL_FIREBASE.md) - Quick start

For issues or questions, check:
1. Firebase Console > Firestore > Data
2. Browser console for client errors
3. Server terminal for API errors
4. Network tab for API request/response details

