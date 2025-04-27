"use client";

import { useEffect, useState } from "react"
import { getGroups } from "@/lib/groups"
import type { Group } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Router } from "lucide-react"
import Link from "next/link"
import GroupCard from "@/components/group-card"
import CreateGroupDialog from "@/components/create-group-dialog"
import { isAuthenticated } from "@/lib/auth"
import axios from "axios"
import { useRouter } from "next/navigation"


let FETCH;

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()
  const isLoggedIn = isAuthenticated()
  let router = useRouter()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response: any = await axios.get('http://localhost:8080/api/groups')
        if (response) {
          setGroups(response.data)
        } else {
          setError(response.message || "Failed to fetch groups")
        }
      } catch (err) {
        setError("An error occurred while fetching groups")
        
        setGroups([
          {
            id: "1",
            name: "Landscape Photography",
            description: "Share and discuss beautiful landscape photos",
            createdBy: "admin",
            members: 120,
          },
          {
            id: "2",
            name: "Portrait Masters",
            description: "Tips and tricks for portrait photography",
            createdBy: "photoLover",
            members: 85,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
    FETCH = fetchGroups;
  }, [])

  const handleGroupCreated = async (newGroup: Group) => {
    try {
      const response = await axios.post('http://localhost:8080/api/groups', newGroup, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
  
      if (response) {
        setGroups([...groups, response.data])
        toast({
          title: "Group created",
          description: `Your group "${newGroup.name}" has been created successfully`,
        })
        alert('creating')
        setIsCreateDialogOpen(false)
        FETCH() // Refresh the groups list
        // Redirect to the new group page
      }
      if (response && response.data && response.data.id) {
        router.push(`/groups/${response.data.id}`);
      } else {
        console.error("Invalid response from server:", response);
        toast({
          title: "Error",
          description: "Failed to retrieve group ID from server.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating group:", error)
      toast({
        title: "Error creating group",
        description: error?.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      })
    } finally {
      setIsCreateDialogOpen(false)
    }
  }
  

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Photography Groups</h1>
        {isLoggedIn && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        )}
      </div>

      {error && groups.length === 0 && <div className="text-center text-red-500 py-8">{error}</div>}

      {groups.length === 0 && !error ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No groups found</h2>
          <p className="text-muted-foreground mt-2">Be the first to create a photography group!</p>
          {isLoggedIn ? (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          ) : (
            <Button className="mt-4" asChild>
              <Link href="/login">Log in to create a group</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  )
}
