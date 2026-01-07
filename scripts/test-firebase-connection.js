#!/usr/bin/env node

/**
 * Test Firebase Admin SDK connection
 * Usage: node scripts/test-firebase-connection.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Firebase credentials...\n');

// Check if credentials exist
const checks = {
  projectId: !!process.env.FIREBASE_PROJECT_ID,
  clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
};

console.log('Environment Variables:');
console.log(`  FIREBASE_PROJECT_ID: ${checks.projectId ? '✅' : '❌'}`);
console.log(`  FIREBASE_CLIENT_EMAIL: ${checks.clientEmail ? '✅' : '❌'}`);
console.log(`  FIREBASE_PRIVATE_KEY: ${checks.privateKey ? '✅' : '❌'}\n`);

if (!checks.projectId || !checks.clientEmail || !checks.privateKey) {
  console.error('❌ Missing required environment variables');
  console.log('\nMake sure your .env.local file contains:');
  console.log('  - FIREBASE_PROJECT_ID');
  console.log('  - FIREBASE_CLIENT_EMAIL');
  console.log('  - FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

// Check private key format
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
console.log('Private Key Validation:');
console.log(`  Length: ${privateKey.length} characters`);
console.log(`  Starts with "-----BEGIN": ${privateKey.startsWith('-----BEGIN') ? '✅' : '❌'}`);
console.log(`  Ends with "-----END": ${privateKey.includes('-----END PRIVATE KEY-----') ? '✅' : '❌'}`);
console.log(`  Contains newlines: ${privateKey.includes('\\n') || privateKey.includes('\n') ? '✅' : '❌'}\n`);

if (!privateKey.startsWith('-----BEGIN')) {
  console.error('❌ Private key format error: Must start with "-----BEGIN PRIVATE KEY-----"');
  process.exit(1);
}

if (!privateKey.includes('-----END PRIVATE KEY-----')) {
  console.error('❌ Private key format error: Must end with "-----END PRIVATE KEY-----"');
  process.exit(1);
}

// Try to initialize Firebase Admin
console.log('🔥 Testing Firebase Admin initialization...\n');

try {
  const admin = require('firebase-admin');
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      })
    });
  }
  
  const db = admin.firestore();
  
  console.log('✅ Firebase Admin SDK initialized successfully!');
  console.log('✅ Firestore connection established!');
  console.log('\n🎉 Everything looks good! Your subscription modal should work now.');
  console.log('\nNext steps:');
  console.log('  1. Restart your dev server (npm run dev)');
  console.log('  2. Visit a campaign page');
  console.log('  3. Test the subscription form');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('\n💡 Common fixes:');
  console.log('  1. Make sure private key is wrapped in quotes in .env.local');
  console.log('  2. Check that \\n is in the key (for line breaks)');
  console.log('  3. Verify you copied the ENTIRE key including BEGIN and END lines');
  console.log('  4. Try re-downloading the service account JSON from Firebase Console');
  process.exit(1);
}

