"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin, Link2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ShareButtonsProps {
  postId: string
  title: string
}

export default function ShareButtons({ postId, title }: ShareButtonsProps) {
  const { toast } = useToast()

  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : `/post/${postId}`

  const shareText = `Check out this photo: ${title}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl)
    toast({
      title: "Link copied",
      description: "The post link has been copied to your clipboard",
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, "_blank")
        }
      >
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
            "_blank",
          )
        }
      >
        <Twitter className="mr-2 h-4 w-4" />
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, "_blank")
        }
      >
        <Linkedin className="mr-2 h-4 w-4" />
        LinkedIn
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopyLink}>
        <Link2 className="mr-2 h-4 w-4" />
        Copy Link
      </Button>
    </div>
  )
}
