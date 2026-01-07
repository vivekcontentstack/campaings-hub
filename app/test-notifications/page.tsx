'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestNotifications() {
  const [checks, setChecks] = useState({
    browserSupport: false,
    permission: 'checking' as 'checking' | 'granted' | 'denied' | 'default',
    serviceWorker: 'checking' as 'checking' | 'registered' | 'failed',
    fcmToken: null as string | null,
  });
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    runChecks();
    
    // Check environment variables on mount
    console.log('=== Environment Check ===');
    console.log('VAPID Key:', process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? '✅ Set' : '❌ Missing');
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
    console.log('=======================');
  }, []);

  async function runChecks() {
    // Check browser support
    const browserSupport = 'Notification' in window && 'serviceWorker' in navigator;
    
    // Check permission
    const permission = browserSupport ? Notification.permission : 'denied';
    
    // Check service worker
    let swStatus: 'registered' | 'failed' = 'failed';
    if (browserSupport) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        swStatus = registration ? 'registered' : 'failed';
      } catch (error) {
        swStatus = 'failed';
      }
    }

    setChecks({
      browserSupport,
      permission: permission as any,
      serviceWorker: swStatus,
      fcmToken: null,
    });
  }

  async function requestPermission() {
    try {
      console.log('🔔 Test page: Requesting permission and token...');
      
      // Check VAPID key first
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      console.log('VAPID key present:', !!vapidKey);
      if (vapidKey) {
        console.log('VAPID key preview:', vapidKey.substring(0, 10) + '...');
      } else {
        toast({
          title: "VAPID Key Missing",
          description: "Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your .env.local file",
          variant: "destructive",
        });
        return;
      }
      
      const { requestNotificationPermission } = await import('@/lib/notifications');
      const token = await requestNotificationPermission();
      
      console.log('Token result:', token ? token.substring(0, 20) + '...' : 'null');
      
      setChecks(prev => ({
        ...prev,
        permission: Notification.permission as any,
        fcmToken: token,
      }));

      if (token) {
        toast({
          title: "Success! 🎉",
          description: "FCM token obtained. Check console for full token.",
        });
      } else {
        toast({
          title: "Token Generation Failed",
          description: "Check browser console for detailed error messages.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request permission",
        variant: "destructive",
      });
    }
  }

  async function testLocalNotification() {
    if (Notification.permission !== 'granted') {
      toast({
        title: "Permission required",
        description: "Please grant notification permission first.",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const { showTestNotification } = await import('@/lib/notifications');
      const success = await showTestNotification(
        'Test Notification',
        'If you see this, local notifications are working! 🎉'
      );

      if (success) {
        toast({
          title: "Test sent!",
          description: "Check for the notification above.",
        });
      } else {
        toast({
          title: "Failed",
          description: "Could not show test notification.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast({
        title: "Error",
        description: "Failed to show test notification.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  }

  async function testFCMNotification() {
    console.log('checks.fcmToken', checks);
    if (!checks.fcmToken) {
      toast({
        title: "No FCM token",
        description: "Please request notification permission first.",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    toast({
      title: "Test initiated",
      description: "Sending test FCM notification via server...",
    });

    try {
      // You would need to create a test endpoint or use an existing campaign
      toast({
        title: "Info",
        description: "Subscribe to a campaign first, then use the send-notification API to test.",
      });
    } catch (error) {
      console.error('FCM test error:', error);
    } finally {
      setTesting(false);
    }
  }

  const StatusIcon = ({ status }: { status: boolean | string }) => {
    if (status === true || status === 'granted' || status === 'registered') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (status === 'checking') {
      return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Push Notifications Test</h1>
          <p className="text-muted-foreground">
            Debug and test your push notification setup
          </p>
        </div>

        {/* System Checks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Requirements</CardTitle>
            <CardDescription>Verify your browser and setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={checks.browserSupport} />
                <div>
                  <p className="font-medium">Browser Support</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications and Service Workers
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {checks.browserSupport ? 'Supported' : 'Not Supported'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={checks.permission} />
                <div>
                  <p className="font-medium">Notification Permission</p>
                  <p className="text-sm text-muted-foreground">
                    Browser permission status
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground capitalize">
                {checks.permission}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={checks.serviceWorker} />
                <div>
                  <p className="font-medium">Service Worker</p>
                  <p className="text-sm text-muted-foreground">
                    Background notification handler
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground capitalize">
                {checks.serviceWorker}
              </span>
            </div>

            {checks.fcmToken && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">FCM Token</p>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {checks.fcmToken.substring(0, 40)}...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>Run tests to verify functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checks.permission !== 'granted' && (
              <Button 
                onClick={requestPermission} 
                className="w-full"
                size="lg"
              >
                <Bell className="mr-2 h-5 w-5" />
                Request Notification Permission
              </Button>
            )}

            {checks.permission === 'granted' && !checks.fcmToken && (
              <Button 
                onClick={requestPermission} 
                className="w-full"
                size="lg"
              >
                <Bell className="mr-2 h-5 w-5" />
                Get FCM Token
              </Button>
            )}

            {checks.permission === 'granted' && (
              <>
                <Button 
                  onClick={testLocalNotification} 
                  variant="outline"
                  className="w-full"
                  disabled={testing}
                >
                  Test Local Notification
                </Button>

                {checks.fcmToken && (
                  <Button 
                    onClick={testFCMNotification} 
                    variant="outline"
                    className="w-full"
                    disabled={testing}
                  >
                    Test FCM Notification (via server)
                  </Button>
                )}
              </>
            )}

            <Button 
              onClick={runChecks} 
              variant="secondary"
              className="w-full"
            >
              Re-run Checks
            </Button>
          </CardContent>
        </Card>

        {/* Environment Variables Check */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check Firebase configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">VAPID Key</span>
              <span className="text-sm">
                {process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? (
                  <span className="text-green-600">✓ Set ({process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY.substring(0, 10)}...)</span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Key</span>
              <span className="text-sm">
                {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? (
                  <span className="text-green-600">✓ Set</span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project ID</span>
              <span className="text-sm">
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? (
                  <span className="text-green-600">✓ {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Messaging Sender ID</span>
              <span className="text-sm">
                {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? (
                  <span className="text-green-600">✓ Set</span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">App ID</span>
              <span className="text-sm">
                {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? (
                  <span className="text-green-600">✓ Set</span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        {checks.permission === 'denied' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Notification permission has been blocked. To fix:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Find "Notifications" in site settings</li>
                <li>Change to "Allow"</li>
                <li>Reload this page</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {checks.serviceWorker === 'failed' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Service Worker Not Registered</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Background notifications require a service worker. Check:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>File exists: <code>/public/firebase-messaging-sw.js</code></li>
                <li>HTTPS is enabled (or using localhost)</li>
                <li>No console errors in DevTools</li>
                <li>Try hard refresh (Cmd/Ctrl + Shift + R)</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {checks.permission === 'granted' && checks.serviceWorker === 'registered' && !checks.fcmToken && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>FCM Token Not Generated</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Everything looks good, but no FCM token. Common fixes:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click "Get FCM Token" button above</li>
                <li>Check console for detailed error messages</li>
                <li>Verify VAPID key is set (see Environment Variables section)</li>
                <li>Visit <a href="/reset-sw.html" className="underline text-blue-600">reset-sw.html</a> to reset service worker</li>
                <li>Restart dev server if you just added VAPID key</li>
              </ol>
              <div className="mt-3 p-2 bg-muted rounded text-xs font-mono">
                Check console for: "✅ FCM Token obtained"
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing End-to-End</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-2">1. Subscribe to a Campaign</p>
              <p className="text-muted-foreground">
                Visit a campaign page and subscribe through the modal. Allow notifications when prompted.
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">2. Send a Test Notification</p>
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
{`curl -X POST http://localhost:3000/api/send-notification \\
  -H "Content-Type: application/json" \\
  -d '{
    "campaignId": "your_campaign_uid",
    "title": "Test Notification",
    "body": "Hello from your campaign!",
    "url": "/facebook-campaign"
  }'`}
              </pre>
            </div>

            <div>
              <p className="font-medium mb-2">3. Check for Notification</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>If page is open: Toast notification appears</li>
                <li>If page is closed: System notification appears</li>
                <li>Click notification to open the campaign page</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

