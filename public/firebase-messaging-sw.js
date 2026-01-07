// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// Note: Config will be injected by the client
let messaging = null;

console.log('[SW] Service Worker loaded');

// Handle skip waiting message
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting');
    self.skipWaiting();
    return;
  }
  
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const firebaseConfig = event.data.config;
    console.log('[SW] Firebase config received');
    
    if (!firebase.apps.length) {
      console.log('[SW] Initializing Firebase...');
      firebase.initializeApp(firebaseConfig);
      messaging = firebase.messaging();
      console.log('[SW] Firebase initialized');
      
      // Handle background messages
      messaging.onBackgroundMessage((payload) => {
        console.log('[SW] Background message received:', payload);
        
        const notificationTitle = payload.notification?.title || 'New Notification';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: payload.notification?.icon || '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: payload.data,
          tag: payload.data?.campaignId || 'general',
          requireInteraction: false,
          actions: payload.data?.actions ? JSON.parse(payload.data.actions) : []
        };
        
        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    } else {
      console.log('[SW] Firebase already initialized');
    }
  }
});

// Activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
  console.log('[SW] Activated');
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  // Get the URL from notification data
  const urlToOpen = event.notification.data?.url || '/';
  
  // Open or focus the client window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
});

