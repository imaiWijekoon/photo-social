import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Comment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
  }

  return (
    <div className="space-y-6">
      {comments.map((comment, index) => (
        <div key={index} className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/placeholder.svg?text=${comment.username.charAt(0)}`} alt={comment.username} />
            <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.username}</span>
              <span className="text-xs text-muted-foreground">
                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : "just now"}
              </span>
            </div>
            <p className="text-sm">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
