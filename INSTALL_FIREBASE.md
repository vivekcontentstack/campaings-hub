# Quick Firebase Installation

## 1. Install Dependencies

```bash
npm install firebase firebase-admin
```

## 2. Add Environment Variables

Create or update `.env.local`:

```env
# Firebase Client Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Config (Private)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

## 3. Enable Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Firestore Database" in the left menu
4. Click "Create database"
5. Start in production mode
6. Choose a location

## 4. Set Security Rules

In Firestore > Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /campaign_subscriptions/{docId} {
      allow read, write: if false;
    }
    match /user_subscriptions/{email} {
      allow read, write: if false;
    }
  }
}
```

## 5. Test

```bash
npm run dev
```

Visit any campaign page and test the subscription modal!

For detailed setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

