import Image from "next/image"

export default function CampaignBanner() {
  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] bg-muted overflow-hidden">
      <Image
        src="/modern-workspace-with-laptop-and-documents-represe.jpg"
        alt="Premium content campaign banner"
        fill
        className="object-cover"
        priority
      />
    </div>
  )
}
