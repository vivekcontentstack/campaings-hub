import CampaignHeader from "@/components/campaign-header"
import CampaignStyle3 from "@/components/campaign-style3"
import Footer from "@/components/footer"
import SubscriptionModal from "@/components/subscription-modal"

export default function CampaignStyle3Page() {
  return (
    <div className="min-h-screen bg-background">
      <CampaignHeader />
      <CampaignStyle3 />
      <Footer />
      <SubscriptionModal />
    </div>
  )
}
