import { Check } from "lucide-react"
import CampaignBanner from "@/components/campaign-banner"
import RegistrationForm from "@/components/registration-form"
import SocialShare from "@/components/social-share"

interface Campaign {
  uid: string
  title: string
  url: string
  description?: string
  more_details?: {
    title?: string
    details?: string
  }
  what_you_will_get?: {
    title?: string
    features_list?: Array<{
      title: string
      details: string
      _metadata: {
        uid: string
      }
    }>
  }
  forms?: Array<{
    subscribe_form?: {
      name: string
      email: string
      _metadata: {
        uid: string
      }
    }
    detailed_registration_form?: {
      name: string
      last_name: string
      email: string
      company: string
      job_title: string
      phone: string
      company_size: string
      _metadata: {
        uid: string
      }
    }
    demo_request_form?: {
      name: string
      email: string
      company: string
      job_title: string
      phone: string
      company_size: string
      industry: string
      use_case: string
      timeline: string
      additional_notes: string
      _metadata: {
        uid: string
      }
    }
  }>
}

interface CampaignContentProps {
  campaign: Campaign
}

export default function CampaignContent({ campaign }: CampaignContentProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Banner Image */}
        <CampaignBanner />

        {/* Main Content Box */}
        <div id="about" className="mt-12 bg-card p-8 sm:p-12 lg:p-16">
          {/* Description */}
          {campaign.more_details && (
            <div className="space-y-6 mb-12">
              {campaign.more_details.title && (
                <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground text-balance">
                  {campaign.more_details.title}
                </h2>
              )}
              {campaign.more_details.details && (
                <div 
                  className="text-lg text-muted-foreground leading-relaxed prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: campaign.more_details.details }}
                />
              )}
            </div>
          )}

          {/* What You Get Section */}
          {campaign.what_you_will_get && campaign.what_you_will_get.features_list && campaign.what_you_will_get.features_list.length > 0 && (
            <div id="benefits" className="pt-24 mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-8">
                {campaign.what_you_will_get.title || "What You'll Get"}
              </h3>
              <div className="grid gap-4 sm:gap-6">
                {campaign.what_you_will_get.features_list.map((feature) => (
                  <div key={feature._metadata.uid} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 bg-secondary flex items-center justify-center">
                        <Check className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-1">{feature.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{feature.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div id="register" className="pt-24 mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-8">Register for Access</h3>
            <RegistrationForm 
              campaignId={campaign.uid} 
              campaignTitle={campaign.title}
              campaignUrl={campaign.url}
              formConfig={campaign.forms?.[0]} 
            />
          </div>

          {/* Social Share */}
          <div className="border-t pt-8">
            <SocialShare />
          </div>
        </div>
      </div>
    </section>
  )
}
