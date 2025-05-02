import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Comment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  // If no comments exist, show a placeholder message

  if (comments.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
  }

  return (
    <div className="space-y-6">
      {/* Loop through each comment and render it */}
      {comments.map((comment, index) => (
        <div key={index} className="flex gap-4">
          
          {/* Show user's avatar image. 
              If no real image, use the first letter of username */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/placeholder.svg?text=${comment.username.charAt(0)}`} alt={comment.username} />
            <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.username}</span>


              {/* Show how long ago the comment was posted (e.g., "5 minutes ago") 
                  If createdAt is missing, just say "just now" */}
              <span className="text-xs text-muted-foreground">
                {comment.createdAt 
                  ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) 
                  : "just now"}
              </span>
            </div>


            {/* Show the actual text of the comment */}
            <p className="text-sm">{comment.text}</p>
          </div>

        </div>
      ))}
    </div>
  )
}
