import Link from "next/link"
import { Calendar, FileText, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface CampaignsListProps {
  campaigns: Campaign[]
  title: string
  subtitle: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

export default function CampaignsList({ campaigns, title, subtitle }: CampaignsListProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns available</h3>
              <p className="text-muted-foreground">Check back soon for new campaigns.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              {campaigns.map((campaign) => {
                const isPublished = campaign.publish_details !== undefined
                const hasDescription = campaign.description && campaign.description.trim() !== ''
                
                return (
                  <div key={campaign.uid} className="bg-card p-8 md:p-10 flex flex-col">
                    {/* Icon and Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="bg-primary/10 p-3 inline-flex">
                        <FileDown className="w-6 h-6 text-primary" />
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 ${
                          isPublished
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPublished ? "Active" : "Draft"}
                      </span>
                    </div>

                    {/* Campaign Name */}
                    <h3 className="text-2xl font-bold text-foreground mb-3">{campaign.title}</h3>

                    {/* Description */}
                    {hasDescription && (
                      <p className="text-foreground/80 leading-relaxed mb-6 flex-1">
                        {campaign.description}
                      </p>
                    )}

                    {/* Campaign Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          Created: {formatDate(campaign.created_at)}
                        </span>
                      </div>
                      {campaign.publish_details && (
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            Published: {formatDate(campaign.publish_details.time)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    {isPublished ? (
                      <Link href={`${campaign.url}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          View Campaign
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full">
                        Coming Soon
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
