"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { isAuthenticated, getUsername } from "@/lib/auth"
import { ImagePlus, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ArticleEditor from "@/components/article-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getGroups } from "@/lib/groups"
import type { Group } from "@/lib/types"
import axios from "axios"

// Page to create a new post
export default function CreatePostPage() {
  // Form state management
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [articleContent, setArticleContent] = useState("")
  const [loading, setLoading] = useState(false)

  // Group selection and state
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [loadingGroups, setLoadingGroups] = useState(true)

  const router = useRouter()
  const { toast } = useToast()

  // Run on mount: check auth and fetch group data
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Fetch all groups from API or fallback to defaults
    const fetchGroups = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/groups")
        if (response) {
          setGroups(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch groups", error)

        // Fallback demo groups
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
        setLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [router, toast])

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const username = getUsername()

      // Safety check in case username isn't found
      if (!username) {
        toast({
          title: "Authentication error",
          description: "User information not found",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Prepare payload for API
      const postData = {
        title,
        description,
        imageUrl,
        author: username,
        groupId: selectedGroup || undefined,
        article: articleContent
          ? {
              content: articleContent,
            }
          : undefined,
      }

      const response: any = await axios.post("http://localhost:8080/api/posts", postData)

      // Show toast and redirect on success
      if (response) {
        toast({
          title: "Post created",
          description: "Your post has been published successfully",
        })
        router.push(`/post/${response.data.id}`)
      } else {
        toast({
          title: "Failed to create post",
          description: response.message || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to create post",
        description: "An error occurred while creating your post",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle image URL changes and preview
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setImagePreview(url)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Post</CardTitle>
          <CardDescription>Share your photography and stories with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Short description input */}
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a brief description of your photo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Image URL input */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="Enter the URL of your image"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                required
              />
            </div>

            {/* Image preview or placeholder */}
            {!imagePreview && (
              <div className="mt-4 border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground">
                <ImagePlus size={48} className="mb-2" />
                <p>Enter an image URL to see a preview</p>
              </div>
            )}

            {imagePreview && (
              <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="object-cover w-full h-full"
                  onError={() => setImagePreview(null)}
                />
              </div>
            )}

            {/* Group selection dropdown */}
            <div className="space-y-2">
              <Label htmlFor="group">Post to Group (Optional)</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Post</SelectItem>
                  {loadingGroups ? (
                    <SelectItem value="loading" disabled>
                      Loading groups....
                    </SelectItem>
                  ) : groups.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No groups available
                    </SelectItem>
                  ) : (
                    groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for basic post vs full article */}
            <Tabs defaultValue="basic" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Post</TabsTrigger>
                <TabsTrigger value="article">Full Article</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="pt-4">
                <p className="text-sm text-muted-foreground">
                  A basic post shows your image with the title and description.
                </p>
              </TabsContent>
              <TabsContent value="article" className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create a full article to share more details, stories, or techniques about your photography.
                </p>
                <ArticleEditor
                  value={articleContent}
                  onChange={setArticleContent}
                  placeholder="Write your article content here..."
                />
              </TabsContent>
            </Tabs>

            {/* Form action buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Post"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
