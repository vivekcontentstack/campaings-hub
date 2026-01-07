"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Gift, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface SubscriptionModalProps {
  campaignId: string
  campaignTitle: string
  campaignUrl: string
}

export default function SubscriptionModal({ 
  campaignId, 
  campaignTitle, 
  campaignUrl 
}: SubscriptionModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Campaign-specific session storage key
    const sessionKey = `subscriptionModal_${campaignId}`
    
    // Check if modal has already been shown for THIS campaign in this session
    const modalShown = sessionStorage.getItem(sessionKey)
    if (modalShown) {
      setHasShown(true)
      return
    }

    // Check localStorage for permanent record (user already subscribed to this campaign)
    const localKey = `subscribed_${campaignId}`
    const hasSubscribed = localStorage.getItem(localKey)
    if (hasSubscribed) {
      setHasShown(true)
      return
    }

    let timeoutId: NodeJS.Timeout
    let scrollTriggered = false
    let timeTriggered = false

    // Time-based trigger: 15 seconds
    timeoutId = setTimeout(() => {
      if (!scrollTriggered && !hasShown) {
        timeTriggered = true
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem(sessionKey, "true")
      }
    }, 15000)

    // Scroll-based trigger: 40% of page
    const handleScroll = () => {
      if (scrollTriggered || timeTriggered || hasShown) return

      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100

      if (scrollPercentage > 40) {
        scrollTriggered = true
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem(sessionKey, "true")
        clearTimeout(timeoutId)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [hasShown, campaignId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Step 1: Request notification permission and get FCM token
      let fcmToken: string | null = null;
      
      try {
        const { requestNotificationPermission } = await import('@/lib/notifications');
        fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          console.log('✅ Push notifications enabled');
        } else {
          console.log('ℹ️ Push notifications not enabled (user may have declined)');
        }
      } catch (notifError) {
        console.log('Push notification setup failed (non-critical):', notifError);
        // Continue with subscription even if notifications fail
      }

      // Step 2: Submit subscription to API
      const response = await fetch('/api/subscribe-modal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          campaignId,
          campaignTitle,
          campaignUrl,
          fcmToken, // Include FCM token if available
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      // Success! Mark this campaign as subscribed in localStorage
      localStorage.setItem(`subscribed_${campaignId}`, 'true')
      
      // Show success state
      setIsSuccess(true)
      
      toast({
        title: "Successfully subscribed!",
        description: fcmToken 
          ? "You'll receive push notifications about campaign updates."
          : "Thank you for joining our community.",
      })

      // Close modal after showing success for 2 seconds
      setTimeout(() => {
        setIsVisible(false)
        setName("")
        setEmail("")
        setIsSuccess(false)
      }, 2000)

    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 animate-fade-in" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-background w-full max-w-md pointer-events-auto animate-slide-up-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {!isSuccess && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-8 sm:p-10">
            {isSuccess ? (
              // Success State
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-500/10 flex items-center justify-center rounded-full">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  You're All Set!
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Thank you for subscribing to {campaignTitle}. Check your inbox for exclusive content!
                </p>
              </div>
            ) : (
              // Form State
              <>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-primary/10 flex items-center justify-center">
                      <Gift className="w-8 h-8 text-primary" />
                    </div>
                    <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1" />
                  </div>
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
                    Don't Miss Out on {campaignTitle}!
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    Join our community and get exclusive access to premium content, early releases, and special offers for this campaign.
                  </p>
                </div>

                {/* Benefits */}
                <div className="bg-muted/50 p-4 mb-6 space-y-2">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground">Instant access to downloadable resources</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground">Weekly insights and industry trends</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground">Exclusive community access</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full h-12 px-4 bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full h-12 px-4 bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
                  >
                    {isSubmitting ? "Subscribing..." : "Get Instant Access"}
                  </Button>
                </form>

                {/* Fine print */}
                <p className="text-xs text-muted-foreground text-center mt-4">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
