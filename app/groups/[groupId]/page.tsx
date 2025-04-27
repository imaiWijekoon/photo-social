"use client";
import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { isAuthenticated, getUsername } from "@/lib/auth";
import type { Group, Post } from "@/lib/types";
import {
  Share2,
  Trash2,
  Edit,
  PlusCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const { groupId } = use(params);
  const router = useRouter();
  const isLoggedIn = isAuthenticated();
  const currentUsername = getUsername();
  const isAdmin = group?.createdBy === currentUsername;

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/groups/${groupId}`);
        const fetchedGroup = response.data;
        setGroup(fetchedGroup);
        
        setJoined(fetchedGroup.members.includes(currentUsername));
        setNewGroupName(fetchedGroup.name);
        setNewGroupDescription(fetchedGroup.description);
      } catch (err) {
        setError("An error occurred while fetching the group");
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async() => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/group/${groupId}`);
        setPosts(response.data);
      } catch (err) {
        setError("An error occurred while fetching posts");
      }
    }
    fetchGroup();
    fetchPosts();
  }, [groupId, currentUsername]);

  // Join or Leave Group
  const joinGroup = async (groupId: string, username: string) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/groups/${groupId}/join?username=${username}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to join group");
    }
  };

  const addMemberToGroup = async (groupId: string, username: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const response = await axios.post(
      `http://localhost:8080/api/groups/${groupId}/add-member`,
      { username },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };

  const leaveGroup = async (groupId: string, username: string) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/groups/${groupId}/leave?username=${username}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to leave group");
    }
  };

  // Delete Group
  const deleteGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.delete(`http://localhost:8080/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to delete group");
    }
  };

  // Update Group
  const updateGroup = async (groupId: string, name: string, description: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.put(
        `http://localhost:8080/api/groups/${groupId}`,
        { name, description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update group");
    }
  };

  const handleJoinToggle = async () => {
    if (!isLoggedIn) {
      alert("Please log in to join or leave groups.");
      router.push("/login");
      return;
    }

    try {
      const action = joined ? leaveGroup(groupId, currentUsername) : joinGroup(groupId, currentUsername);
      const response = await action;

      if (response) {
        setJoined(!joined);
        alert(joined ? "You have left the group." : "You have joined the group.");
      } else {
        alert(response.message || "Failed to update membership status.");
      }
    } catch (error) {
      alert("An error occurred while updating your membership status.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!isAdmin) {
      alert("Only the group owner can delete the group.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        const response = await deleteGroup(groupId);

        if (!response) {
          alert("Group deleted successfully.");
          router.push("/groups");
        } else {
          alert(response.message || "Failed to delete the group.");
        }
      } catch (error) {
        alert("An error occurred while deleting the group.");
      }
    }
  };

  const handleUpdateGroup = async () => {
    if (!isAdmin) {
      alert("Only the group owner can edit the group.");
      return;
    }

    try {
      const response = await updateGroup(groupId, newGroupName, newGroupDescription);

      if (response) {
        setGroup((prevGroup) => ({
          ...prevGroup!,
          name: newGroupName,
          description: newGroupDescription,
        }));
        setShowEditDialog(false);
        alert("Group updated successfully.");
      } else {
        alert(response.message || "Failed to update the group.");
      }
    } catch (error) {
      alert("An error occurred while updating the group.");
    }
  };

  const handleShareGroup = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Group link copied to clipboard!");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error && !group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
        <Button onClick={() => router.push("/groups")}>Return to Groups</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Group Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group?.name}</h1>
          <p className="text-muted-foreground mt-1">{group?.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span>{group?.members.length || 0} members</span>
            </div>
            {!isAdmin && isLoggedIn && (
              <Button variant={joined ? "outline" : "default"} onClick={handleJoinToggle}>
                {joined ? "Leave Group" : "Join Group"}
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-2 self-start">
          <Button variant="outline" onClick={handleShareGroup}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Group
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Group
              </Button>
              <Button variant="destructive" onClick={handleDeleteGroup}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Group
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Posts</h2>
          {joined && (
            <Button variant="default" onClick={() => router.push(`/groups/${groupId}/create-post`)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          )}
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <h2 className="text-xl font-semibold">No posts yet</h2>
            <p className="text-muted-foreground mt-2">Be the first to share a post in this group!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 space-y-4">
                <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover rounded-md" />
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.description}</p>
                <div className="flex items-center gap-2">
                  <span>{post.author}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update the details of your group.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
              />
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGroup}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}