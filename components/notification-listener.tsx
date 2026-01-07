'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Component to listen for foreground push notifications
 * When page is open, shows toast instead of system notification
 */
export default function NotificationListener() {
  const { toast } = useToast();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupForegroundListener() {
      if (typeof window === 'undefined') return;

      try {
        const { onForegroundMessage } = await import('@/lib/notifications');
        
        unsubscribe = await onForegroundMessage((payload) => {
          console.log('📬 Foreground notification received:', payload);
          
          const title = payload.notification?.title || 'New Notification';
          const body = payload.notification?.body || '';
          const url = payload.data?.url || payload.fcmOptions?.link;
          
          // Show toast notification when page is open
          toast({
            title,
            description: body,
            duration: 5000,
            action: url ? (
              <a 
                href={url} 
                className="text-sm font-medium underline"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = url;
                }}
              >
                View
              </a>
            ) : undefined,
          });
          
          // Also show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              tag: payload.data?.campaignId || 'notification',
              data: { url },
            }).onclick = () => {
              if (url) {
                window.location.href = url;
              }
            };
          }
        });
      } catch (error) {
        console.error('Error setting up notification listener:', error);
      }
    }

    setupForegroundListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [toast]);

  return null; // This is a headless component
}

