import { NextRequest, NextResponse } from 'next/server'

interface FormSubmissionData {
  campaignId: string
  formType: string
  [key: string]: string // Allow any form fields
}

export async function POST(request: NextRequest) {
  try {
    const body: FormSubmissionData = await request.json()
    const { campaignId, formType, ...formFields } = body

    // Validate required fields
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Missing campaign ID' },
        { status: 400 }
      )
    }

    // Remove campaignId and formType from formFields to get clean data
    const cleanFormData = { ...formFields }

    // Get Contentstack credentials
    const apiKey = process.env.CONTENTSTACK_API_KEY
    const managementToken = process.env.CONTENTSTACK_MANAGEMENT_TOKEN
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production'

    if (!apiKey || !managementToken) {
      console.error('Missing Contentstack credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create submission title with current date and time
    const submissionDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const title = `Submission - ${submissionDate}`

    // Prepare the entry data
    const entryData = {
      entry: {
        title: title,
        campaign_id: campaignId,
        data: cleanFormData,
        locale: 'en-us',
      }
    }

    // Submit to Contentstack Management API
    const response = await fetch(
      'https://api.contentstack.io/v3/content_types/form_submissions/entries',
      {
        method: 'POST',
        headers: {
          'api_key': apiKey,
          'authorization': managementToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Contentstack API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to submit form', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Trigger email sending (don't wait for it to complete)
    const userEmail = cleanFormData.email
    const userName = cleanFormData.name || 
                     (cleanFormData.last_name 
                       ? `${cleanFormData.name || ''} ${cleanFormData.last_name}`.trim()
                       : 'User')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Send email asynchronously (fire and forget)
    if (userEmail) {
      fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignUid: campaignId,
          recipientEmail: userEmail,
          recipientName: userName,
          formData: cleanFormData,
        }),
      }).catch(error => {
        console.error('Error triggering email:', error)
        // Don't fail the submission if email fails
      })
    }

    // Slack notifications disabled
    // Uncomment below to re-enable Slack notifications
    /*
    fetch(`${baseUrl}/api/send-slack-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignUid: campaignId,
        campaignTitle: cleanFormData.campaignTitle || 'Campaign',
        campaignUrl: cleanFormData.campaignUrl || campaignId,
        formData: cleanFormData,
        submissionTime: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
      }),
    }).catch(error => {
      console.error('Error triggering Slack notification:', error)
      // Don't fail the submission if Slack fails
    })
    */

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data: data,
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

