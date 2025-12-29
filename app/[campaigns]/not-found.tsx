import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import CampaignHeader from "@/components/campaign-header"
import Footer from "@/components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CampaignHeader />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileQuestion className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Campaign Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the campaign you're looking for. It may have been removed or the link might be incorrect.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

