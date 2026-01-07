#!/usr/bin/env node

/**
 * Helper script to format Firebase private key correctly
 * Usage: node scripts/format-firebase-key.js path/to/serviceAccount.json
 */

const fs = require('fs');
const path = require('path');

// Get the JSON file path from command line argument
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ Error: Please provide path to service account JSON file');
  console.log('\nUsage:');
  console.log('  node scripts/format-firebase-key.js path/to/serviceAccount.json');
  console.log('\nExample:');
  console.log('  node scripts/format-firebase-key.js ~/Downloads/my-project-firebase-adminsdk.json');
  process.exit(1);
}

// Resolve the full path
const fullPath = path.resolve(jsonFilePath);

// Check if file exists
if (!fs.existsSync(fullPath)) {
  console.error(`❌ Error: File not found: ${fullPath}`);
  process.exit(1);
}

try {
  // Read and parse the JSON file
  const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  
  console.log('✅ Service account JSON loaded successfully\n');
  console.log('📋 Add these to your .env.local file:\n');
  console.log('----------------------------------------');
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log('----------------------------------------\n');
  
  console.log('💡 Tips:');
  console.log('1. Copy the entire FIREBASE_PRIVATE_KEY line (including quotes)');
  console.log('2. Paste it into your .env.local file');
  console.log('3. Make sure there are no extra line breaks or spaces');
  console.log('4. Restart your dev server after updating .env.local');
  console.log('\n✨ Done!');
  
} catch (error) {
  console.error('❌ Error reading or parsing JSON file:', error.message);
  process.exit(1);
}

