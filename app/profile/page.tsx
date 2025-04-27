'use client';
import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { getUsername } from '@/lib/auth';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  likes: string[];
  comments: Array<{ username: string; text: string; createdAt: string }>;
  createdAt: string;
}

// Define TypeScript types for API responses
interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture?: string; // Optional since it might not always be provided
  bio?: string; // Optional
}



// ProfilePage Component
const ProfilePage = () => {
  const username = getUsername(); // Extract username from authentication or URL
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Pick<UserProfile, 'profilePicture' | 'bio'>>({
    profilePicture: '',
    bio: '',
  });
  const [error, setError] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response: AxiosResponse<UserProfile> = await axios.get(
          `http://localhost:8080/api/users/${username}`
        );
        setProfile(response.data);
        setFormData({
          profilePicture: response.data.profilePicture || '',
          bio: response.data.bio || '',
        });
      } catch (err) {
        setError('Failed to fetch profile.');
      }
    };
    fetchProfile();
  }, [username]);

  // Handle form changes
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update user profile
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response: AxiosResponse<UserProfile> = await axios.put(
        `http://localhost:8080/api/users/${username}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state with the updated profile
      setProfile({ ...response.data });
      setFormData({
        profilePicture: response.data.profilePicture || '',
        bio: response.data.bio || '',
      });

      // Exit edit mode after successful update
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response: AxiosResponse<Post[]> = await axios.get(
          'http://localhost:8080/api/posts'
        );
        const userPosts = response.data.filter((post) => post.author === username);
        setPosts(userPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    fetchPosts();
  }, [username]);

  if (!profile) return <p className="text-center text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-6">
      {/* Header */}
      <h1 className="text-4xl font-bold text-primary mb-8">Profile</h1>

      {/* Profile Section */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md w-full max-w-2xl space-y-6">
        {/* Profile Image and Details */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={profile.profilePicture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-primary"
          />
          <h2 className="text-2xl font-bold">{profile.username}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-gray-700 mt-2">{profile.bio || 'No bio available.'}</p>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => setEditMode(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full"
        >
          Edit Profile
        </button>

        {/* Edit Profile Form */}
        {editMode && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Profile Picture URL
              </label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="Enter profile picture URL"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write something about yourself..."
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User's Posts Section */}
      <div className="mt-12 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-primary mb-6">Posts by {profile.username}</h2>
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link href={`/post/${post.id}`} key={post.id}>
                <div key={post.id} className="bg-card text-card-foreground p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
                <p className="text-muted-foreground">{post.description}</p>
              </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;