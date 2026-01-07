'use client';

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

let messaging: Messaging | null = null;

/**
 * Initialize Firebase Cloud Messaging
 */
export async function initializeMessaging() {
  if (typeof window === 'undefined') return null;
  
  try {
    const { clientDb } = await import('./firebase-client');
    const { getMessaging } = await import('firebase/messaging');
    
    if (!messaging) {
      messaging = getMessaging();
    }
    
    return messaging;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    console.log('🔔 Starting notification permission request...');
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('❌ This browser does not support notifications');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('❌ This browser does not support service workers');
      return null;
    }

    // Check current permission
    let permission = Notification.permission;
    console.log('Current permission:', permission);

    // Request permission if not granted
    if (permission === 'default') {
      console.log('Requesting notification permission...');
      permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
    }

    if (permission !== 'granted') {
      console.log('❌ Notification permission denied');
      return null;
    }

    console.log('✅ Notification permission granted');

    // Register service worker first
    console.log('📝 Registering service worker...');
    const swRegistration = await registerServiceWorker();
    
    if (!swRegistration) {
      console.error('❌ Failed to register service worker');
      return null;
    }

    if (!swRegistration.active) {
      console.error('❌ Service worker is not active');
      return null;
    }

    console.log('✅ Service worker is active');

    // Get FCM token
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      console.error('❌ Failed to initialize messaging');
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('❌ VAPID key not configured in environment variables');
      console.log('Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your .env.local file');
      return null;
    }

    console.log('📱 Getting FCM token...');
    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
      return token;
    }

    console.log('❌ No registration token available');
    return null;
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Provide specific guidance for common errors
      if (error.message.includes('no active Service Worker')) {
        console.error('💡 Fix: The service worker is not active. Try:');
        console.error('  1. Hard refresh (Cmd/Ctrl + Shift + R)');
        console.error('  2. Check DevTools → Application → Service Workers');
        console.error('  3. Unregister and refresh');
      }
    }
    
    return null;
  }
}

/**
 * Register service worker for push notifications
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return undefined;
  }

  try {
    // Check if already registered
    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (!registration) {
      console.log('Registering service worker...');
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered');
    } else {
      console.log('Service Worker already registered');
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service Worker is ready');

    // Make sure the service worker is active
    if (registration.installing) {
      console.log('Service Worker installing, waiting...');
      await new Promise((resolve) => {
        registration!.installing!.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') {
            resolve(true);
          }
        });
      });
    }

    if (registration.waiting) {
      console.log('Service Worker waiting, activating...');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Send Firebase config to service worker
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Send config to active service worker
    if (registration.active) {
      registration.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig,
      });
      console.log('Firebase config sent to service worker');
    }

    // Get the final registration after it's ready
    const finalRegistration = await navigator.serviceWorker.getRegistration();
    if (!finalRegistration || !finalRegistration.active) {
      throw new Error('Service Worker not active after registration');
    }

    return finalRegistration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return undefined;
  }
}

/**
 * Listen for foreground messages
 */
export async function onForegroundMessage(callback: (payload: any) => void) {
  const messagingInstance = await initializeMessaging();
  if (!messagingInstance) return () => {};

  return onMessage(messagingInstance, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
}

/**
 * Check if notifications are supported and permission status
 */
export function getNotificationStatus(): {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
} {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }

  return {
    supported: true,
    permission: Notification.permission,
  };
}

/**
 * Show a test notification
 */
export async function showTestNotification(title: string, body: string) {
  const status = getNotificationStatus();
  
  if (!status.supported) {
    console.log('Notifications not supported');
    return false;
  }

  if (status.permission !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
      });
      return true;
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }

  return false;
}

