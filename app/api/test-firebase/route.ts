import { NextResponse } from 'next/server';

export async function GET() {
  // Check which environment variables are available
  const envCheck = {
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    projectId: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 
      process.env.FIREBASE_CLIENT_EMAIL.substring(0, 20) + '...' : 
      'NOT SET',
    privateKeyPreview: process.env.FIREBASE_PRIVATE_KEY ? 
      'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 
      'NOT SET',
  };

  return NextResponse.json({
    message: 'Environment variables check',
    env: envCheck,
    nodeEnv: process.env.NODE_ENV,
  });
}

