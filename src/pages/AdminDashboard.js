import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  SupervisorAccount,
  Flag,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    flaggedPosts: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [postsStats, usersStats] = await Promise.all([
        axios.get(`${API_URL}/posts/stats`),
        axios.get(`${API_URL}/auth/stats`)
      ]);

      setStats({
        totalPosts: postsStats.data.data.total || 0,
        flaggedPosts: postsStats.data.data.flagged || 0,
        totalUsers: usersStats.data.data.total || 0,
        activeUsers: usersStats.data.data.active || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  const adminActions = [
    {
      title: 'Content Moderation',
      description: `Manage ${stats.totalPosts} posts • ${stats.flaggedPosts} flagged`,
      icon: <Flag />,
      path: '/admin/moderation',
      color: '#f44336',
    },
    {
      title: 'User Management',
      description: `${stats.totalUsers} total users • ${stats.activeUsers} active`,
      icon: <SupervisorAccount />,
      path: '/admin/users',
      color: '#2196f3',
    },
  ];

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
        Dashboard Overview
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} mt={2}>
        {adminActions.map((action) => (
          <Grid item xs={12} sm={6} key={action.title}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
              onClick={() => handleNavigation(action.path)}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${action.color}20`,
                  color: action.color,
                  mb: 2,
                }}
              >
                {action.icon}
              </Box>
              <Typography variant="h6" gutterBottom>
                {action.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {action.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 