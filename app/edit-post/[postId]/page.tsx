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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ArticleEditor from "@/components/article-editor"
import type { Article } from "@/lib/types"
import axios from "axios"
import { use } from "react";

export default function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [articleContent, setArticleContent] = useState("")
  const [hasArticle, setHasArticle] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { postId } = use(params);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit a post",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const fetchPost = async () => {
      try {
        const response : any = await axios.get(`http://localhost:8080/api/posts/${postId}`)

        if (response) {
          const postData = response.data

          // Check if current user is the author
          const currentUsername = getUsername()
          if (postData.author !== currentUsername) {
            toast({
              title: "Unauthorized",
              description: "You can only edit your own posts",
              variant: "destructive",
            })
            router.push(`/post/${postId}`)
            return
          }

          setTitle(postData.title)
          setDescription(postData.description)
          setImageUrl(postData.imageUrl)
          setImagePreview(postData.imageUrl)

          // Handle article content if it exists
          if (postData.article) {
            setArticleContent((postData.article as Article).content)
            setHasArticle(true)
          }
        } else {
          setError(response.message || "Failed to fetch post")
          toast({
            title: "Error",
            description: "Failed to load post data",
            variant: "destructive",
          })
        }
      } catch (err) {
        setError("An error occurred while fetching the post")
        toast({
          title: "Error",
          description: "An error occurred while loading the post",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const updateData = {
        title,
        description,
        imageUrl,
        article: hasArticle
          ? {
              content: articleContent,
            }
          : undefined,
      }

      const response: any = await axios.put(`http://localhost:8080/api/posts/${postId}`, updateData)

      if (response) {
        toast({
          title: "Post updated",
          description: "Your post has been updated successfully",
        })
        router.push(`/post/${postId}`)
      } else {
        toast({
          title: "Failed to update post",
          description: response.message || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to update post",
        description: "An error occurred while updating your post",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setImagePreview(url)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="pt-6 flex gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Post</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Post</CardTitle>
          <CardDescription>Update your photography post</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {!imagePreview && (
              <div className="mt-4 border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground">
                <ImagePlus size={48} className="mb-2" />
                <p>Enter an image URL to see a preview</p>
              </div>
            )}

            <Tabs defaultValue={hasArticle ? "article" : "basic"} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Post</TabsTrigger>
                <TabsTrigger value="article">Full Article</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="pt-4">
                <p className="text-sm text-muted-foreground">
                  A basic post shows your image with the title and description.
                </p>
                {hasArticle && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      Warning: Switching to a basic post will remove your article content if you save these changes.
                    </p>
                  </div>
                )}
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

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/post/${postId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Post"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
