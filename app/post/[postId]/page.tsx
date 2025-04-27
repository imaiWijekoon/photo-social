"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Button,
} from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { isAuthenticated, getUsername } from "@/lib/auth";
import Link from "next/link";
import CommentList from "@/components/comment-list";
import ShareButtons from "@/components/share-buttons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { use } from "react";

// Define TypeScript types
interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
}

interface Comment {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

interface Article {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// API functions
const getPostById = async (postId: string): Promise<AxiosResponse<any>> => {
  const response = await axios.get(`/api/posts/${postId}`);
  return response;
};

const addComment = async (
  postId: string,
  username: string,
  text: string
): Promise<AxiosResponse<any>> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const response = await axios.post(
    `/api/posts/${postId}/comments`,
    { username, text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response;
};
//like post
const likePost = async (postId: string): Promise<AxiosResponse<any>> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const response = await axios.post(
    `/api/posts/${postId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response;
};

const unlikePost = async (postId: string): Promise<AxiosResponse<any>> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const response = await axios.post(
    `/api/posts/${postId}/unlike`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response;
};

const deletePost = async (postId: string): Promise<AxiosResponse<any>> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const response = await axios.delete(`/api/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const [post, setPost] = useState<Post | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isLoggedIn = isAuthenticated();
  const currentUsername = getUsername();
  const { postId } = use(params);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response: any = await axios.get(`http://localhost:8080/api/posts/${postId}`);
        console.log(response);
        // Check if the response is successful
        if (response) {
          setPost(response.data || null);
          setArticle(response.data.article || null);
          setComments(response.data.comments || []);
          setLiked(response.data.liked || false);
        } else {
          setError(response.data.message || "Failed to fetch post");
        }
      } catch (err) {
        setError("An error occurred while fetching the post");
        // Fallback data
        setPost({
          id: postId,
          title: "Sample Post",
          description: "This is a fallback post when the API fails",
          imageUrl:
            "https://images.unsplash.com/photo-1566045638022-8a56c96f4830",
          author: "system",
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
        });
        setArticle({
          id: "1",
          postId: postId,
          content:
            "<p>This is a sample article content. In a real application, this would be the full article text with formatting.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.</p>",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setComments([
          {
            id: "1",
            username: "user1",
            text: "Great photo!",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      // If the user is not logged in, show a toast message
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = liked ? await axios.post(`http://localhost:8080/api/posts/${postId}/unlike?username=${getUsername()}`) : await axios.post(`http://localhost:8080/api/posts/${postId}/like?username=${getUsername()}`)
      if (response.data) {
        setLiked(!liked);
        toast({
          title: liked ? "Post unliked" : "Post liked",
          description: liked ? "You've removed your like" : "You've liked this post",
        });
      } else {
        toast({
          title: "Action failed",
          description: response.data.message || "Failed to update like status",
          variant: "destructive",
        });
      }
      // Update the list of likes in the post object
      liked ? setPost({ ...post, likes: post.likes.filter((like) => like !== currentUsername) }) : setPost({ ...post, likes: [...post.likes, currentUsername] });
    } catch (error) {
      toast({
        title: "Action failed",
        description: "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }
    // If comment box is empty or whitespace, do nothing
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const response = await axios.post(`http://localhost:8080/api/posts/${postId}/comments?username=${currentUsername}&text=${commentText}` )
      // Create a new comment locally
      if (response.data) {
        const newComment: Comment = {
          id: Date.now().toString(),
          username: currentUsername || "",
          text: commentText,
          createdAt: new Date().toISOString(),
        };
        setComments([...comments, newComment]);
        setCommentText("");
        toast({
          title: "Comment added",
          description: "Your comment has been posted",
        });
      } else {
        toast({
          title: "Comment failed",
          description: response.data.message || "Failed to add comment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Comment failed",
        description: "An error occurred while posting your comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      const response: any = await axios.delete(`http://localhost:8080/api/posts/${postId}`);
      if (response) {
        toast({
          title: "Post deleted",
          description: "Your post has been successfully deleted",
        });
        router.push("/");
      } else {
        toast({
          title: "Delete failed",
          description: response.data.message || "Failed to delete post",
          variant: "destructive",
        });
        setShowDeleteDialog(false);
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting your post",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Error Loading Post</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button className="mt-6" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <p className="text-muted-foreground mt-2">
          The post you're looking for doesn't exist or has been removed
        </p>
        <Button className="mt-6" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  const isAuthor = currentUsername === post.author;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Post Header */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar>
          <AvatarImage src={`/placeholder.svg?text=${post.author.charAt(0)}`} alt={post.author} />
          <AvatarFallback>{post.author.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{post.author}</div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/edit-post/${post.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
        <p className="text-xl text-muted-foreground">{post.description}</p>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.imageUrl || "https://c02.purpledshub.com/uploads/sites/62/2021/09/Silhouetted-elephants.-Chris-Packham.-Remembering-Elephants-da11c3e.jpg?w=728&webp=1"}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
        <div className="flex items-center justify-between py-4 border-y">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              className={liked ? "text-red-500" : ""}
            >
              <Heart className={`mr-1 h-5 w-5 ${liked ? "fill-current" : ""}`} />
              {post.likes.length || 0} Likes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("comment-input")?.focus()}
            >
              <MessageCircle className="mr-1 h-5 w-5" />
              {comments.length} Comments
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowShareOptions(!showShareOptions)}>
              <Share2 className="mr-1 h-5 w-5" />
              Share
            </Button>
          </div>
        </div>
        {showShareOptions && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <ShareButtons postId={post.id} title={post.title} />
            </CardContent>
          </Card>
        )}
        {article && (
          <div className="prose my-8">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        )}
        <Separator className="my-8" />
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Comments</h2>
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <Input
              id="comment-input"
              placeholder={isLoggedIn ? "Add a comment..." : "Log in to comment"}
              value={commentText}
              onChange={(e: any) => setCommentText(e.target.value)}
              disabled={!isLoggedIn || submittingComment}
              className="flex-1"
            />
            <Button type="submit" disabled={!isLoggedIn || !commentText.trim() || submittingComment}>
              Post
            </Button>
          </form>
          <CommentList comments={comments} />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}