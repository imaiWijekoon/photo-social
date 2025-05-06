import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import type { Group } from "@/lib/types"

// This component is used to display a group card
interface GroupCardProps {
  group: Group
}

// This component is used to display a group card

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <Link href={`/groups/${group.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg">{group.name}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-3">{group.description}</p>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{group.members || 0} members</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Created by <span className="font-medium">{group.createdBy}</span>
        </div>
        <Button asChild>
          <Link href={`/groups/${group.id}`}>View Group</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
