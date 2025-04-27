import Link from "next/link"
import { Camera } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PhotoShare. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
