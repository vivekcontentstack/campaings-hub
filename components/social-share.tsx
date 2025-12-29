"use client"

import { Facebook, Twitter, Linkedin, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function SocialShare() {
  const { toast } = useToast()
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = "Check out this exclusive gated content download campaign!"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link Copied!",
      description: "Campaign link has been copied to clipboard.",
    })
  }

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ]

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-card-foreground">Share This Campaign</h4>
      <div className="flex flex-wrap gap-3">
        {socialLinks.map((social) => (
          <Button
            key={social.name}
            variant="outline"
            size="icon"
            onClick={() => window.open(social.url, "_blank")}
            className="hover:bg-accent hover:text-accent-foreground"
            aria-label={`Share on ${social.name}`}
          >
            <social.icon className="w-4 h-4" />
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          className="hover:bg-accent hover:text-accent-foreground bg-transparent"
          aria-label="Copy link"
        >
          <Link2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
