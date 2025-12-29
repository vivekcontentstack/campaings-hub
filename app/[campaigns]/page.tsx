import { notFound } from "next/navigation"
import CampaignHeader from "@/components/campaign-header"
import CampaignHero from "@/components/campaign-hero"
import CampaignContent from "@/components/campaign-content"
import Footer from "@/components/footer"
import SubscriptionModal from "@/components/subscription-modal"

interface Campaign {
  locale: string
  uid: string
  _version: number
  ACL: Record<string, unknown>
  _in_progress: boolean
  created_at: string
  created_by: string
  description: string
  email_template?: unknown[]
  form_submissions?: unknown[]
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
  tags: string[]
  title: string
  subtitle?: string
  updated_at: string
  updated_by: string
  url: string
  banner?: string | null
  reference?: Array<{
    uid: string
    _content_type_uid: string
  }>
  publish_details: {
    environment: string
    locale: string
    time: string
    user: string
  } | Array<{
    environment: string
    locale: string
    time: string
    user: string
    version: number
  }>
}

interface ContentstackResponse {
  entry: Campaign
}

async function getCampaignByUrl(url: string): Promise<Campaign | null> {
  try {
    const apiKey = process.env.CONTENTSTACK_API_KEY
    const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production'

    if (!apiKey || !deliveryToken) {
      console.error('Missing Contentstack credentials')
      return null
    }

    // Ensure URL starts with /
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`

    // Query entries by URL field
    const query = {
      url: normalizedUrl
    }

    const response = await fetch(
      `https://cdn.contentstack.io/v3/content_types/campaigns/entries?query=${encodeURIComponent(JSON.stringify(query))}&include_reference=true`,
      {
        headers: {
          'api_key': apiKey,
          'access_token': deliveryToken,
          'environment': environment,
        },
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch campaign:', response.statusText)
      return null
    }

    const data = await response.json()

    console.log("data here", data?.entries[0]?.email_template);
    
    // Query returns an array of entries, get the first one
    if (data.entries && data.entries.length > 0) {
      return data.entries[0]
    }
    
    return null
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

interface PageProps {
  params: Promise<{
    campaigns: string
  }>
}

export default async function CampaignPage({ params }: PageProps) {
  const resolvedParams = await params
  const campaignUrl = resolvedParams.campaigns
  
  const campaign = await getCampaignByUrl(campaignUrl)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <CampaignHeader isCampaignPage={true} />
      <CampaignHero campaign={campaign} />
      <CampaignContent campaign={campaign} />
      <Footer />
      <SubscriptionModal />
    </div>
  )
}
