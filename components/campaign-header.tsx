import Link from "next/link"

export default function CampaignHeader({ isCampaignPage = false }: { isCampaignPage?: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold tracking-tight text-foreground">CAMPAIGN HUB</div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Campaigns
            </Link>
            <Link href="/submissions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Submissions
            </Link>
            {isCampaignPage ? <>
              <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Benefits
              </Link>
              <Link href="#register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
            </> : null}
          </nav>
        </div>
      </div>
    </header>
  )
}
