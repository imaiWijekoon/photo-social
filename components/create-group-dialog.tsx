"use client"

import type React from "react"

import { useState } from "react"
import { createGroup } from "@/lib/groups"
import type { Group } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getUsername } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGroupCreated: (group: Group) => void
}

export default function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const username = getUsername()

      if (!username) {
        toast({
          title: "Authentication error",
          description: "User information not found",
          variant: "destructive",
        })
        onOpenChange(false)
        return
      }

      const response = await createGroup({
        name,
        description,
        createdBy: username,
      })

      if (response.success) {
        const newGroup: Group = {
          id: response.data.id,
          name,
          description,
          createdBy: username,
          members: 1, // Creator is the first member
        }

        onGroupCreated(newGroup)
        setName("")
        setDescription("")
      } else {
        toast({
          title: "Failed to create group",
          description: response.message || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to create group",
        description: "An error occurred while creating the group",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
          <DialogDescription>
            Create a photography group to connect with others who share your interests.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter a name for your group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your group is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
