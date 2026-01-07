import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, campaignId, campaignTitle, campaignUrl, fcmToken } = body;

    // Validate required fields
    if (!name || !email || !campaignId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create a unique document ID based on email and campaignId
    // This prevents duplicate submissions for the same campaign
    const docId = `${email.toLowerCase()}_${campaignId}`;

    // Prepare subscription data
    const subscriptionData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      campaignId,
      campaignTitle: campaignTitle || '',
      campaignUrl: campaignUrl || '',
      submittedAt: Timestamp.now(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      notificationsEnabled: !!fcmToken,
    };

    // Add FCM token if provided
    if (fcmToken) {
      subscriptionData.fcmToken = fcmToken;
      subscriptionData.fcmTokenUpdatedAt = Timestamp.now();
    }

    // Use set with merge to update if exists, create if doesn't
    await adminDb
      .collection('campaign_subscriptions')
      .doc(docId)
      .set(subscriptionData, { merge: true });

    // Create an index document for the user to track all campaigns they've subscribed to
    const userDocId = email.toLowerCase().trim();
    const userSubscriptionData: any = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      campaigns: {
        [campaignId]: {
          subscribedAt: Timestamp.now(),
          campaignTitle: campaignTitle || '',
          campaignUrl: campaignUrl || '',
          notificationsEnabled: !!fcmToken,
        }
      },
      lastUpdated: Timestamp.now(),
    };

    // Add FCM token to user document if provided
    if (fcmToken) {
      userSubscriptionData.fcmTokens = {
        [fcmToken]: {
          addedAt: Timestamp.now(),
          campaigns: [campaignId],
        }
      };
    }

    await adminDb
      .collection('user_subscriptions')
      .doc(userDocId)
      .set(userSubscriptionData, { merge: true });

    return NextResponse.json(
      { 
        success: true,
        message: 'Subscription successful',
        docId 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error saving subscription:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to save subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : typeof error
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user has already subscribed to a campaign
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const campaignId = searchParams.get('campaignId');

    if (!email || !campaignId) {
      return NextResponse.json(
        { error: 'Missing email or campaignId' },
        { status: 400 }
      );
    }

    const docId = `${email.toLowerCase()}_${campaignId}`;
    const doc = await adminDb
      .collection('campaign_subscriptions')
      .doc(docId)
      .get();

    return NextResponse.json({
      hasSubscribed: doc.exists,
      data: doc.exists ? doc.data() : null
    });

  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}

