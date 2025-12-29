import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface EmailTemplateReference {
  uid: string
  _content_type_uid: string
}

interface EmailTemplate {
  title: string
  subject: string
  template_body: string
  from_email: string
  from_name: string
}

interface EmailTemplateResponse {
  entry: EmailTemplate
}

interface SendEmailRequest {
  campaignUid: string
  recipientEmail: string
  recipientName?: string
  formData: Record<string, string>
}

async function getEmailTemplate(templateUid: string): Promise<EmailTemplate | null> {
  try {
    const apiKey = process.env.CONTENTSTACK_API_KEY
    const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production'

    if (!apiKey || !deliveryToken) {
      console.error('Missing Contentstack credentials')
      return null
    }

    const response = await fetch(
      `https://cdn.contentstack.io/v3/content_types/email_templates/entries/${templateUid}`,
      {
        headers: {
          'api_key': apiKey,
          'access_token': deliveryToken,
          'environment': environment,
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch email template:', response.statusText)
      return null
    }

    const data: EmailTemplateResponse = await response.json()
    return data.entry || null
  } catch (error) {
    console.error('Error fetching email template:', error)
    return null
  }
}

async function getCampaignEmailTemplate(campaignUid: string): Promise<string | null> {
  try {
    const apiKey = process.env.CONTENTSTACK_API_KEY
    const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production'

    if (!apiKey || !deliveryToken) {
      console.error('Missing Contentstack credentials')
      return null
    }

    const response = await fetch(
      `https://cdn.contentstack.io/v3/content_types/campaigns/entries/${campaignUid}`,
      {
        headers: {
          'api_key': apiKey,
          'access_token': deliveryToken,
          'environment': environment,
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch campaign:', response.statusText)
      return null
    }

    const data = await response.json()
    const campaign = data.entry

    // Get email template reference
    if (campaign.email_template && campaign.email_template.length > 0) {
      return campaign.email_template[0].uid
    }

    return null
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template
  
  // Replace {{field_name}} placeholders with actual data
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(placeholder, data[key] || '')
  })
  
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json()
    const { campaignUid, recipientEmail, recipientName, formData } = body

    // Validate required fields
    if (!campaignUid || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get SMTP configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.error('Missing SMTP configuration')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Get email template UID from campaign
    const templateUid = await getCampaignEmailTemplate(campaignUid)

    console.log("templateUid here", templateUid);
    
    if (!templateUid) {
      console.log('No email template configured for this campaign')
      return NextResponse.json({
        success: true,
        message: 'No email template configured',
        emailSent: false
      })
    }

    // Fetch email template
    const emailTemplate = await getEmailTemplate(templateUid)

    console.log("emailTemplate here", emailTemplate);

    if (!emailTemplate) {
      console.error('Failed to fetch email template')
      return NextResponse.json(
        { error: 'Email template not found' },
        { status: 404 }
      )
    }

    // Prepare template data with form data
    const templateData = {
      ...formData,
      name: recipientName || formData.name || formData.first_name || 'User',
      email: recipientEmail,
    }

    console.log("templateData here", templateData);

    // Replace placeholders in subject and body
    const subject = replacePlaceholders(emailTemplate.title, templateData)
    const htmlBody = replacePlaceholders(emailTemplate.template_body, templateData)

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: `"${emailTemplate.from_name}" <${emailTemplate.from_email}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlBody,
    })

    console.log('Email sent:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      emailSent: true
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

