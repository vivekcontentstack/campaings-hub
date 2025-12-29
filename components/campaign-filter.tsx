'use client'

import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

interface Campaign {
  title: string
  uid: string
  url: string
}

interface CampaignFilterProps {
  campaigns: Campaign[]
  selectedCampaignId?: string
}

export default function CampaignFilter({ campaigns, selectedCampaignId }: CampaignFilterProps) {
  const router = useRouter()

  const handleCampaignChange = (value: string) => {
    if (value === 'all') {
      router.push('/submissions')
    } else {
      router.push(`/submissions?campaign=${value}`)
    }
  }

  return (
    <div className="flex items-center gap-3 max-w-md">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span>Filter by Campaign:</span>
      </div>
      
      <Select 
        value={selectedCampaignId || 'all'} 
        onValueChange={handleCampaignChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Campaigns" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Campaigns</SelectItem>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.uid} value={campaign.uid}>
              {campaign.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

