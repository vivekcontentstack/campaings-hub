import CampaignHeader from "@/components/campaign-header"
import CampaignsList from "@/components/campaigns-list"
import Footer from "@/components/footer"
import SubscriptionModal from "@/components/subscription-modal"

interface HomePageContent {
  title: string
  subtitle: string
  footer: {
    link: Array<{
      title: string
      href: string
    }>
  }
}

interface HomePageResponse {
  entry: HomePageContent
}

interface Campaign {
  locale: string
  uid: string
  _version: number
  ACL: Record<string, unknown>
  _in_progress: boolean
  created_at: string
  created_by: string
  description: string
  email_template?: Array<{
    uid: string
    _content_type_uid: string
  }>
  form_submissions: unknown[]
  forms: unknown[]
  more_details: string
  tags: string[]
  title: string
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
  }
}

interface ContentstackResponse {
  entries: Campaign[]
}

async function getHomePageContent(): Promise<HomePageContent | null> {
  try {
    const apiKey = process.env.CONTENTSTACK_API_KEY
    const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production'

    if (!apiKey || !deliveryToken) {
      console.error('Missing Contentstack credentials')
      return null
    }

    const response = await fetch(
      'https://cdn.contentstack.io/v3/content_types/home_page/entries/bltf843a91b5e0e0393',
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
      console.error('Failed to fetch home page content:', response.statusText)
      return null
    }

    const data: HomePageResponse = await response.json()
    return data.entry || null
  } catch (error) {
    console.error('Error fetching home page content:', error)
    return null
  }
}

async function getCampaigns(): Promise<Campaign[]> {
  try {
    const apiKey = process.env.CONTENTSTACK_API_KEY
    const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production'

    if (!apiKey || !deliveryToken) {
      console.error('Missing Contentstack credentials')
      return []
    }

    const response = await fetch(
      'https://cdn.contentstack.io/v3/content_types/campaigns/entries',
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
      console.error('Failed to fetch campaigns:', response.statusText)
      return []
    }

    const data: ContentstackResponse = await response.json()
    return data.entries || []
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

export default async function CampaignsPage() {
  const [homePageContent, campaigns] = await Promise.all([
    getHomePageContent(),
    getCampaigns()
  ])

  // Default values if content fetch fails
  const title = homePageContent?.title || 'Our Campaigns'
  const subtitle = homePageContent?.subtitle || 'Discover our active campaigns and unlock valuable resources to grow your business and enhance your skills.'
  const footerLinks = homePageContent?.footer?.link || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CampaignHeader />
      <main className="flex-1">
        <CampaignsList 
          campaigns={campaigns}
          title={title}
          subtitle={subtitle}
        />
      </main>
      <Footer links={footerLinks} />
      <SubscriptionModal />
    </div>
  )
}
