// lib/api.ts
import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:8080'; 
const getToken = () => localStorage.getItem('token');

// Fetch a single post by ID
export const getPostById = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/posts/${postId}`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch post');
  }
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  username: string,
  text: string
): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await axios.post(
      `${BASE_URL}/api/posts/${postId}/comments?username=${username}&text=${text}`,
      { username, text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    throw new Error('Failed to add comment');
  }
};

// Like a post
export const likePost = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await axios.post(
      `${BASE_URL}/api/posts/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    throw new Error('Failed to like post');
  }
};

// Unlike a post
export const unlikePost = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await axios.post(
      `${BASE_URL}/api/posts/${postId}/unlike`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    throw new Error('Failed to unlike post');
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await axios.delete(`${BASE_URL}/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw new Error('Failed to delete post');
  }
};