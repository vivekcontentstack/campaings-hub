import SubmissionsClient from "@/components/submissions-client"

interface Submission {
  title: string
  campaign_id: string
  data: {
    name?: string
    email?: string
    campaignTitle?: string
    campaignUrl?: string
    [key: string]: string | undefined
  }
  uid: string
  created_at: string
  updated_at: string
}

interface SubmissionsResponse {
  entries: Submission[]
}

interface Campaign {
  title: string
  uid: string
  url: string
}

interface CampaignsResponse {
  entries: Campaign[]
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
        next: { revalidate: 60 },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch campaigns:', response.statusText)
      return []
    }

    const data: CampaignsResponse = await response.json()
    return data.entries || []
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

async function getSubmissions(campaignId?: string): Promise<Submission[]> {
  try {
    const apiKey = process.env.CONTENTSTACK_API_KEY
    const managementToken = process.env.CONTENTSTACK_MANAGEMENT_TOKEN

    if (!apiKey || !managementToken) {
      console.error('Missing Contentstack credentials')
      return []
    }

    let url = 'https://api.contentstack.io/v3/content_types/form_submissions/entries'
    
    // Add query parameter if filtering by campaign
    if (campaignId) {
      const query = { campaign_id: campaignId }
      url += `?query=${encodeURIComponent(JSON.stringify(query))}`
    }

    const response = await fetch(url, {
      headers: {
        'api_key': apiKey,
        'authorization': managementToken,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    })

    if (!response.ok) {
      console.error('Failed to fetch submissions:', response.statusText)
      return []
    }

    const data: SubmissionsResponse = await response.json()
    return data.entries || []
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return []
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>
}) {
  const params = await searchParams
  const campaignId = params.campaign
  
  const campaigns = await getCampaigns()

  

  return (
    <div className="min-h-screen bg-background">
      <SubmissionsClient 
        campaigns={campaigns} 
        initialCampaignId={campaignId}
      />
    </div>
  )
}

