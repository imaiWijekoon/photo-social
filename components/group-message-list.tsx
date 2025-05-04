import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { GroupMessage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

// This component is used to display a list of group messages
interface GroupMessageListProps {
  messages: GroupMessage[]
}

export default function GroupMessageList({ messages }: GroupMessageListProps) {
  if (messages.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No messages yet. Start the conversation!</div>
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/placeholder.svg?text=${message.username.charAt(0)}`} alt={message.username} />
            <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{message.username}</span>
              <span className="text-xs text-muted-foreground">
                {message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : "just now"}
              </span>
            </div>
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
