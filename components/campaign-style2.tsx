"use client"

import { Check, Download, Users, Calendar, Sparkles } from "lucide-react"
import RegistrationForm from "./registration-form"
import SocialShare from "./social-share"
import Image from "next/image"

export default function CampaignStyle2() {
  const benefits = [
    "Comprehensive 50-page industry guide",
    "Exclusive templates and worksheets",
    "Expert insights from top professionals",
    "Actionable strategies you can implement today",
    "Bonus: Video walkthrough tutorial",
  ]

  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
              <Image
                src="/modern-workspace-with-laptop-and-documents-represe.jpg"
                alt="Gated Content Download Campaign"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>2,547 Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated Jan 2025</span>
              </div>
            </div>
          </div>

          {/* Right: Title and Description */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 text-accent-foreground mb-6">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Free Download</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
              Gated Content Download
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Unlock exclusive insights and strategies designed to transform your business approach
            </p>
            <div className="bg-accent/20 px-6 py-5 mb-8">
              <p className="text-base text-card-foreground leading-relaxed">
                This comprehensive resource has been carefully crafted by industry experts to provide you with
                actionable strategies, real-world examples, and proven methodologies that you can implement immediately
                in your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: What You'll Get */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="h-6 w-6 text-secondary" />
                <h2 className="text-3xl font-bold text-foreground">What You'll Get</h2>
              </div>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 bg-background px-6 py-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-6 w-6 bg-secondary flex items-center justify-center">
                        <Check className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    </div>
                    <p className="text-base text-card-foreground leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="bg-background px-8 py-10 lg:sticky lg:top-24">
              <h3 className="text-2xl font-bold text-foreground mb-4">Get Instant Access</h3>
              <p className="text-muted-foreground mb-8">
                Fill in your details below to receive immediate access to this valuable resource
              </p>
              <RegistrationForm />
              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-sm font-medium text-card-foreground mb-4">Share this resource:</p>
                <SocialShare />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
