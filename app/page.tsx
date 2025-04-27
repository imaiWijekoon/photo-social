"use client"
import axios from 'axios';
import { useEffect, useState } from "react"
import PostCard from "@/components/post-card"
import type { Post } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"latest" | "popular">("latest")

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all posts
  useEffect(() => {
    axios.get('http://localhost:8080/api/posts')
      .then(response => setPosts(response.data))
      .then(() => setLoading(false))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const filteredPosts = [...posts].sort((a, b) => {
    if (filter === "popular") {
      return (b.likes || 0) - (a.likes || 0)
    }
    // Default to latest (could use createdAt in a real app)
    return Number.parseInt(b.id) - Number.parseInt(a.id)
  })

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Discover Photography</h1>
          <p className="text-muted-foreground mt-2">Explore beautiful moments captured by our community</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant={filter === "latest" ? "default" : "outline"} size="sm" onClick={() => setFilter("latest")}>
            Latest
          </Button>
          <Button variant={filter === "popular" ? "default" : "outline"} size="sm" onClick={() => setFilter("popular")}>
            Popular
          </Button>
        </div>
      </div>

      {error && filteredPosts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="text-red-500 font-medium">{error}</div>
          <p className="text-muted-foreground mt-2">Please try again later</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-semibold">No posts found</h2>
          <p className="text-muted-foreground mt-2">Be the first to share your photography!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
