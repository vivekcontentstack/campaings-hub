"use client"

import { Check, Download, TrendingUp, Award, Zap, Clock } from "lucide-react"
import RegistrationForm from "./registration-form"
import SocialShare from "./social-share"
import Image from "next/image"

export default function CampaignStyle3() {
  const benefits = [
    "Comprehensive 50-page industry guide",
    "Exclusive templates and worksheets",
    "Expert insights from top professionals",
    "Actionable strategies you can implement today",
    "Bonus: Video walkthrough tutorial",
  ]

  const features = [
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "Strategies tested by 1000+ businesses",
    },
    {
      icon: Clock,
      title: "Quick Implementation",
      description: "Start seeing results in 7 days",
    },
    {
      icon: Award,
      title: "Expert Created",
      description: "By industry-leading professionals",
    },
    {
      icon: Zap,
      title: "Actionable Content",
      description: "No fluff, just practical advice",
    },
  ]

  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 text-accent-foreground mb-6">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Limited Time - Free Access</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
            Gated Content Download
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Unlock exclusive insights and strategies designed to transform your business approach
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <div className="relative aspect-[21/9] w-full bg-muted overflow-hidden">
          <Image
            src="/modern-workspace-with-laptop-and-documents-represe.jpg"
            alt="Gated Content Download Campaign"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="bg-muted py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-background px-6 py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary mb-4">
                    <Icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-background px-8 py-10 mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-6">About This Resource</h2>
              <p className="text-base text-card-foreground leading-relaxed mb-6">
                This comprehensive resource has been carefully crafted by industry experts to provide you with
                actionable strategies, real-world examples, and proven methodologies that you can implement immediately
                in your business.
              </p>
              <p className="text-base text-card-foreground leading-relaxed">
                Whether you're just starting out or looking to scale your operations, this guide provides the frameworks
                and insights you need to make informed decisions and drive meaningful results.
              </p>
            </div>

            <div className="bg-background px-8 py-10 mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-8">What You'll Get</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 bg-accent/10 px-4 py-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-5 w-5 bg-secondary flex items-center justify-center">
                        <Check className="h-3 w-3 text-secondary-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-card-foreground leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/20 px-8 py-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Get Started?</h3>
                <p className="text-muted-foreground">
                  Enter your details below and get instant access to this valuable resource
                </p>
              </div>
              <div className="flex justify-center mb-8">
                <RegistrationForm />
              </div>
              <div className="pt-8 border-t border-border text-center">
                <p className="text-sm font-medium text-card-foreground mb-4">Share with your network:</p>
                <div className="flex justify-center">
                  <SocialShare />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
