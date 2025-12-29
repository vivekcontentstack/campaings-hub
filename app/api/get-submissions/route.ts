import { NextRequest, NextResponse } from 'next/server'

interface Submission {
  title: string
  campaign_id: string
  data: Record<string, any>
  uid: string
  created_at: string
  updated_at: string
}

interface SubmissionsResponse {
  entries: Submission[]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign')

    const apiKey = process.env.CONTENTSTACK_API_KEY
    const managementToken = process.env.CONTENTSTACK_MANAGEMENT_TOKEN

    if (!apiKey || !managementToken) {
      return NextResponse.json(
        { error: 'Missing Contentstack credentials' },
        { status: 500 }
      )
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
      cache: 'no-store', // Don't cache in client
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: response.status }
      )
    }

    const data: SubmissionsResponse = await response.json()

    return NextResponse.json({
      success: true,
      submissions: data.entries || [],
      count: data.entries?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

