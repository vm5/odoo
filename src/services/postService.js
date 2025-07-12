import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getPosts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.hub) params.append('hub', filters.hub);
    if (filters.type) params.append('type', filters.type);
    if (filters.author) params.append('author', filters.author);

    const { data } = await axios.get(`${API_URL}/posts?${params}`);
    return data.data;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
};

export const getPost = async (id, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams 
      ? `${API_URL}/posts/${id}?${queryParams}`
      : `${API_URL}/posts/${id}`;
      
    const { data } = await axios.get(url);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch post');
    }
    
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Post not found');
    }
    console.error('Failed to fetch post:', error);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/posts`,
      postData,
      getAuthConfig()
    );
    return data.data;
  } catch (error) {
    console.error('Failed to create post:', error);
    throw error;
  }
};

export const updatePost = async (id, postData) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/posts/${id}`,
      postData,
      getAuthConfig()
    );
    return data.data;
  } catch (error) {
    console.error('Failed to update post:', error);
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    const config = getAuthConfig();
    await axios.delete(`${API_URL}/posts/${id}`, config);
    return true;
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw error;
  }
};

export const votePost = async (id, isUpvote) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/posts/${id}/vote`,
      { isUpvote },
      getAuthConfig()
    );
    return data.data;
  } catch (error) {
    console.error('Failed to vote on post:', error);
    throw error;
  }
};

export const addReaction = async (id, emoji) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/posts/${id}/react`,
      { emoji },
      getAuthConfig()
    );
    return data.data;
  } catch (error) {
    console.error('Failed to add reaction:', error);
    throw error;
  }
};

export const votePoll = async (id, optionIndex) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/posts/${id}/poll-vote`,
      { optionIndex },
      getAuthConfig()
    );
    return data.data;
  } catch (error) {
    console.error('Failed to vote on poll:', error);
    throw error;
  }
}; 

export const voteOnPost = async (postId, voteType) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/posts/${postId}/vote`,
      { value: voteType },
      getAuthConfig()
    );
    return data.data;
  } catch (error) {
    console.error('Failed to vote on post:', error);
    throw error;
  }
};

export const acceptAnswer = async (answerId) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/posts/${answerId}/accept`,
      {},
      getAuthConfig()
    );
    return data.data;
  } catch (error) {
    console.error('Failed to accept answer:', error);
    throw error;
  }
}; 