import CampaignHeader from "@/components/campaign-header"
import CampaignStyle2 from "@/components/campaign-style2"
import Footer from "@/components/footer"
import SubscriptionModal from "@/components/subscription-modal"

export default function CampaignStyle2Page() {
  return (
    <div className="min-h-screen bg-background">
      <CampaignHeader />
      <CampaignStyle2 />
      <Footer />
      <SubscriptionModal />
    </div>
  )
}
