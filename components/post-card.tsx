import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, MessageCircle } from "lucide-react"
import type { Post } from "@/lib/types"

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <Link href={`/post/${post.id}`} className="overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={post.imageUrl || "/placeholder.svg?height=400&width=400"}
            alt={post.title}
            fill
            className="object-cover transition-transform hover:scale-105 duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="p-5 flex-grow">
        <Link href={`/post/${post.id}`} className="hover:underline">
          <h3 className="font-semibold text-xl line-clamp-1">{post.title}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{post.description}</p>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex justify-between items-center border-t mt-auto">
        <div className="text-sm">
          By <span className="font-medium">{post.author}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
             {/* Like COunt */}
            <span className="text-xs">{post.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {/* COMMENT COunt */}
            <span className="text-xs">{post.comments?.length || 0}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}


