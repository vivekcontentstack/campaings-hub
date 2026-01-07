import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side only)
function initAdmin() {
  try {
    if (getApps().length === 0) {
      // For production, use service account
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('🔥 Initializing Firebase with SERVICE_ACCOUNT');
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({
          credential: cert(serviceAccount)
        });
      } else {
        // For development, use individual credentials
        console.log('🔥 Initializing Firebase with individual credentials');
        
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        if (!projectId || !clientEmail || !privateKey) {
          throw new Error(
            'Missing Firebase credentials. Please check your .env.local file:\n' +
            `- FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗'}\n` +
            `- FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗'}\n` +
            `- FIREBASE_PRIVATE_KEY: ${privateKey ? '✓' : '✗'}`
          );
        }
        
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          })
        });
      }
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.log('✅ Firebase Admin already initialized');
    }
    
    return getFirestore();
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
}

export const adminDb = initAdmin();

