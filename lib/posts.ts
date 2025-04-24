import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'http://localhost:8080'; 
const getToken = () => localStorage.getItem('token');

export const getPostById = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await axios.get(`${BASE_URL}/api/posts/${postId}`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch post');
  }
};

export const addComment = async (
  postId: string,
  username: string,
  text: string
): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');

    // We send both query params AND request body here — redundancy in case backend reads either
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

export const likePost = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');

    // Like request has empty body but still needs Authorization header
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

export const unlikePost = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');

    // Same as likePost but endpoint is 'unlike'
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

export const deletePost = async (postId: string): Promise<AxiosResponse<any>> => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');

    // DELETE request sends token via headers, no body needed
    const response = await axios.delete(`${BASE_URL}/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    throw new Error('Failed to delete post');
  }
};
