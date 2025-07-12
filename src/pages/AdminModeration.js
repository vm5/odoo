import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    try {
      setLoading(true);
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      console.log('Fetching flagged posts...');
      const response = await axios.get(`${API_URL}/posts?flagged=true`, config);
      console.log('Flagged posts response:', response.data);
      
      if (response.data.success) {
        setPosts(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to fetch flagged posts');
      }
    } catch (err) {
      console.error('Error fetching flagged posts:', err.response || err);
      setError(err.response?.data?.error || 'Failed to load flagged posts');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (postId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      console.log('Moderating post:', { postId, action });
      const response = await axios.put(
        `${API_URL}/posts/${postId}`,
        {
          isFlagged: action === 'approve' ? false : true,
          isRemoved: action === 'remove' ? true : false
        },
        config
      );
      
      if (response.data.success) {
        // Show success message
        alert(action === 'approve' ? 'Post approved' : 'Post removed');
        // Refresh the list
        fetchFlaggedPosts();
      } else {
        setError(response.data.error || 'Failed to moderate post');
      }
    } catch (err) {
      console.error('Error moderating post:', err.response || err);
      setError(err.response?.data?.error || 'Failed to moderate post');
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Content Moderation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {posts.length === 0 ? (
        <Alert severity="info">No flagged posts to review</Alert>
      ) : (
        <List>
          {posts.map((post) => (
            <Paper key={post._id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1">
                        {post.title || post.content.substring(0, 100) + '...'}
                      </Typography>
                      <Chip
                        size="small"
                        label={post.type}
                        color={post.type === 'question' ? 'primary' : 'secondary'}
                      />
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Posted by {post.author?.name} • {new Date(post.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {post.content}
                      </Typography>
                      {post.moderationNote && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Report reason: {post.moderationNote}
                        </Alert>
                      )}
                    </>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleModerate(post._id, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleModerate(post._id, 'remove')}
                  >
                    Remove
                  </Button>
                </Stack>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminModeration; 