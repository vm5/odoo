import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Block,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      console.log('Fetching users...');
      const response = await axios.get(`${API_URL}/auth/users`, config);
      console.log('Users response:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err.response || err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, isActive) => {
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

      console.log('Updating user status:', { userId, isActive });
      const response = await axios.put(
        `${API_URL}/auth/users/${userId}`,
        { isActive },
        config
      );
      
      if (response.data.success) {
        // Show success message
        alert(isActive ? 'User activated' : 'User deactivated');
        // Refresh the list
        fetchUsers();
      } else {
        setError(response.data.error || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err.response || err);
      setError(err.response?.data?.error || 'Failed to update user status');
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
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {users.length === 0 ? (
        <Alert severity="info">No users found</Alert>
      ) : (
        <List>
          {users.map((user) => (
            <Paper key={user._id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar src={user.avatar}>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1">{user.name}</Typography>
                      <Chip
                        size="small"
                        label={`Level ${user.level || 1}`}
                        color="primary"
                      />
                      {user.role === 'admin' && (
                        <Chip
                          size="small"
                          label="Admin"
                          color="error"
                        />
                      )}
                      <Chip
                        size="small"
                        icon={user.isActive ? <CheckCircle /> : <Block />}
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                      />
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Last active: {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                      {user.streak && (
                        <Typography variant="body2" color="text.secondary">
                          Streak: {user.streak.current} days (Longest: {user.streak.longest} days)
                        </Typography>
                      )}
                    </Stack>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                    <IconButton
                      color={user.isActive ? "error" : "success"}
                      onClick={() => handleUpdateUserStatus(user._id, !user.isActive)}
                    >
                      {user.isActive ? <Block /> : <CheckCircle />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default UserManagement; 