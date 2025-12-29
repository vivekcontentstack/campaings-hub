"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SubscriptionModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if modal has already been shown in this session
    const modalShown = sessionStorage.getItem("subscriptionModalShown")
    if (modalShown) {
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
        sessionStorage.setItem("subscriptionModalShown", "true")
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
        sessionStorage.setItem("subscriptionModalShown", "true")
        clearTimeout(timeoutId)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [hasShown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Subscription submitted:", { name, email })
    setIsSubmitting(false)
    setIsVisible(false)
    setName("")
    setEmail("")
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
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 sm:p-10">
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
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">Don't Miss Out!</h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Join our community and get exclusive access to premium content, early releases, and special offers.
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
          </div>
        </div>
      </div>
    </>
  )
}
