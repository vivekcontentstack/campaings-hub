import { NextRequest, NextResponse } from 'next/server'

interface SlackNotificationRequest {
  campaignUid: string
  campaignTitle: string
  campaignUrl: string
  formData: Record<string, string>
  submissionTime: string
}

function formatFormData(data: Record<string, string>): string {
  const fields = Object.entries(data)
    .filter(([key]) => key !== 'campaignId' && key !== 'formType')
    .map(([key, value]) => {
      const label = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      return `*${label}:* ${value}`
    })
    .join('\n')
  
  return fields
}

export async function POST(request: NextRequest) {
  try {
    const body: SlackNotificationRequest = await request.json()
    const { campaignUid, campaignTitle, campaignUrl, formData, submissionTime } = body

    // Validate required fields
    if (!campaignUid || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Slack configuration
    const slackToken = process.env.SLACK_BOT_TOKEN
    const slackChannel = process.env.SLACK_CHANNEL_ID || 'C0A5R60BKNX'

    if (!slackToken) {
      console.error('Missing Slack bot token')
      return NextResponse.json(
        { error: 'Slack not configured' },
        { status: 500 }
      )
    }

    // Extract key information
    const userName = formData.name || 
                     (formData.first_name && formData.last_name 
                       ? `${formData.first_name} ${formData.last_name}`
                       : formData.first_name || 'Unknown')
    const userEmail = formData.email || formData.work_email || 'No email provided'
    const company = formData.company || formData.company_name || 'Not specified'

    // Format all form fields
    const formattedData = formatFormData(formData)

    // Create Slack message with blocks
    const slackMessage = {
      channel: slackChannel,
      text: `New Form Submission: ${campaignTitle}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 New Campaign Form Submission',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Campaign:*\n${campaignTitle}`
            },
            {
              type: 'mrkdwn',
              text: `*Submitted By:*\n${userName}`
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${userEmail}`
            },
            {
              type: 'mrkdwn',
              text: `*Company:*\n${company}`
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Campaign UID:*\n\`${campaignUid}\``
            },
            {
              type: 'mrkdwn',
              text: `*Campaign URL:*\n${campaignUrl}`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Submission Details:*\n${formattedData}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⏰ Submitted at: ${submissionTime}`
            }
          ]
        }
      ]
    }

    // Send to Slack
    const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${slackToken}`,
      },
      body: JSON.stringify(slackMessage),
    })

    const slackData = await slackResponse.json()

    if (!slackData.ok) {
      console.error('Slack API error:', slackData.error)
      
      // Provide helpful error messages
      let errorMessage = 'Failed to send Slack notification'
      if (slackData.error === 'missing_scope') {
        errorMessage = 'Missing Slack permissions. Required scopes: chat:write, chat:write.public. Go to https://api.slack.com/apps, add scopes, and reinstall app.'
      } else if (slackData.error === 'not_in_channel') {
        errorMessage = 'Bot not in channel. Either add chat:write.public scope OR invite bot: /invite @YourBotName'
      } else if (slackData.error === 'invalid_auth') {
        errorMessage = 'Invalid Slack token. Check SLACK_BOT_TOKEN in .env.local'
      } else if (slackData.error === 'channel_not_found') {
        errorMessage = 'Channel not found. Check SLACK_CHANNEL_ID (current: ' + slackChannel + ')'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          slackError: slackData.error,
          details: slackData 
        },
        { status: 500 }
      )
    }

    console.log('Slack notification sent successfully:', slackData.ts)

    return NextResponse.json({
      success: true,
      message: 'Slack notification sent',
      messageId: slackData.ts
    })

  } catch (error) {
    console.error('Error sending Slack notification:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send Slack notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

