interface Campaign {
  title: string
  subtitle?: string
  description?: string
}

interface CampaignHeroProps {
  campaign: Campaign
}

export default function CampaignHero({ campaign }: CampaignHeroProps) {
  return (
    <section className="relative w-full bg-primary text-primary-foreground py-20 sm:py-32 lg:py-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            {campaign.title}
          </h1>
          {campaign.subtitle && (
            <p className="text-lg sm:text-xl lg:text-2xl text-primary-foreground/90 max-w-3xl mx-auto text-balance">
              {campaign.subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
