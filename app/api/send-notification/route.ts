import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { getMessaging } from 'firebase-admin/messaging';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Clean up invalid FCM tokens from database
 */
async function cleanupInvalidTokens(campaignId: string, invalidTokens: string[]) {
  try {
    const batch = adminDb.batch();
    let updateCount = 0;

    // Get all subscriptions with these invalid tokens
    for (const token of invalidTokens) {
      // Query campaign_subscriptions for this token
      const subscriptionsSnapshot = await adminDb
        .collection('campaign_subscriptions')
        .where('campaignId', '==', campaignId)
        .where('fcmToken', '==', token)
        .get();

      subscriptionsSnapshot.forEach((doc) => {
        // Remove token and update notification status
        batch.update(doc.ref, {
          fcmToken: FieldValue.delete(),
          notificationsEnabled: false,
          tokenRemovedAt: FieldValue.serverTimestamp(),
          tokenRemovedReason: 'Invalid or expired token',
        });
        updateCount++;
      });

      // Also remove from user_subscriptions
      const userSubscriptionsSnapshot = await adminDb
        .collection('user_subscriptions')
        .where(`fcmTokens.${token}`, '!=', null)
        .get();

      userSubscriptionsSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          [`fcmTokens.${token}`]: FieldValue.delete(),
        });
        updateCount++;
      });
    }

    // Commit all updates
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updateCount} documents, removed ${invalidTokens.length} invalid tokens`);
    }

    return { success: true, updated: updateCount };
  } catch (error) {
    console.error('Error cleaning up invalid tokens:', error);
    return { success: false, error };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      campaignId, 
      title, 
      body: messageBody, 
      url,
      imageUrl 
    } = body;

    // Validate required fields
    if (!campaignId || !title || !messageBody) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, title, body' },
        { status: 400 }
      );
    }

    // Get all subscriptions for this campaign with FCM tokens
    const subscriptionsSnapshot = await adminDb
      .collection('campaign_subscriptions')
      .where('campaignId', '==', campaignId)
      .where('notificationsEnabled', '==', true)
      .get();

    if (subscriptionsSnapshot.empty) {
      return NextResponse.json(
        { 
          success: true,
          message: 'No subscribers with notifications enabled for this campaign',
          sent: 0 
        },
        { status: 200 }
      );
    }

    // Collect all FCM tokens
    const tokens: string[] = [];
    subscriptionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return NextResponse.json(
        { 
          success: true,
          message: 'No valid FCM tokens found',
          sent: 0 
        },
        { status: 200 }
      );
    }

    // Prepare the notification message
    const message = {
      notification: {
        title,
        body: messageBody,
        ...(imageUrl && { imageUrl }),
      },
      data: {
        campaignId,
        url: url || '/',
        timestamp: new Date().toISOString(),
      },
      webpush: {
        notification: {
          title,
          body: messageBody,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          ...(imageUrl && { image: imageUrl }),
        },
        fcmOptions: {
          link: url || '/',
        },
      },
    };

    // Send to multiple devices
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast({
      tokens,
      ...message,
    });

    console.log(`✅ Notifications sent: ${response.successCount}/${tokens.length}`);
    
    // Track invalid tokens for cleanup
    let invalidTokens: string[] = [];
    
    if (response.failureCount > 0) {
      console.log(`❌ Failed to send ${response.failureCount} notifications`);
      
      // Collect invalid tokens that need to be removed
      const invalidTokenErrors: string[] = [];
      
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          const token = tokens[idx];
          
          console.log(`Failed token error [${errorCode}]:`, resp.error?.message);
          
          // These error codes mean the token is invalid and should be removed
          const invalidErrorCodes = [
            'messaging/registration-token-not-registered',
            'messaging/invalid-registration-token',
            'messaging/invalid-argument',
          ];
          
          if (errorCode && invalidErrorCodes.includes(errorCode)) {
            invalidTokens.push(token);
            invalidTokenErrors.push(errorCode);
          }
        }
      });

      // Automatically clean up invalid tokens from database
      if (invalidTokens.length > 0) {
        console.log(`🧹 Cleaning up ${invalidTokens.length} invalid tokens...`);
        await cleanupInvalidTokens(campaignId, invalidTokens);
        console.log('✅ Invalid tokens removed from database');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      sent: response.successCount,
      failed: response.failureCount,
      total: tokens.length,
      ...(invalidTokens.length > 0 && { 
        cleanedUp: invalidTokens.length,
        note: 'Invalid tokens have been automatically removed from database'
      }),
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to get notification statistics for a campaign
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Missing campaignId parameter' },
        { status: 400 }
      );
    }

    // Get all subscriptions for this campaign
    const allSubs = await adminDb
      .collection('campaign_subscriptions')
      .where('campaignId', '==', campaignId)
      .get();

    // Count subscribers with notifications enabled
    let notificationEnabledCount = 0;
    allSubs.forEach((doc) => {
      const data = doc.data();
      if (data.notificationsEnabled && data.fcmToken) {
        notificationEnabledCount++;
      }
    });

    return NextResponse.json({
      campaignId,
      totalSubscribers: allSubs.size,
      notificationEnabled: notificationEnabledCount,
      notificationDisabled: allSubs.size - notificationEnabledCount,
    });

  } catch (error) {
    console.error('Error getting notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to get notification statistics' },
      { status: 500 }
    );
  }
}

