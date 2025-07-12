import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import {
  AccountCircle,
  LocalFireDepartment,
  EmojiEvents,
  Pets,
} from '@mui/icons-material';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../auth/ProtectedRoute';
import Stack from '@mui/material/Stack';
import NotificationBell from './NotificationBell';

// Pages
import Home from '../../pages/Home';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import AskQuestion from '../../pages/AskQuestion';
import QuestionDetail from '../../pages/QuestionDetail';
import AdminDashboard from '../../pages/AdminDashboard';
import Hub from '../hub/Hub';
import Profile from '../profile/Profile';

const Layout = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  
  const streakCount = 5;
  const level = "Bug Slayer 🔥";
  const xp = 1250;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Pets sx={{ fontSize: 28 }} />
            StackIt 💬
          </Typography>

          {isAuthenticated ? (
            <>
              <Button
                variant="contained"
                component={Link}
                to="/ask"
                sx={{ 
                  mr: 2,
                  background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF5B25 30%, #FFD600 90%)',
                  }
                }}
                startIcon={<span>🤔</span>}
              >
                Ask Away!
              </Button>

              {/* Streak Counter */}
              <Tooltip title="Knowledge Streak 🔥">
                <Chip
                  icon={<LocalFireDepartment color="error" />}
                  label={`${streakCount} days`}
                  sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
                    color: 'white'
                  }}
                />
              </Tooltip>

              {/* Level Badge */}
              <Tooltip title={`${xp} XP to next level!`}>
                <Chip
                  icon={<EmojiEvents sx={{ color: '#FFD700' }} />}
                  label={level}
                  sx={{ 
                    mr: 2, 
                    background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                    color: 'white'
                  }}
                />
              </Tooltip>

              {/* Notification Bell */}
              <NotificationBell />

              <Tooltip title="Your Vibe">
                <IconButton
                  onClick={handleMenu}
                  sx={{ 
                    background: 'linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #6C3DFF 30%, #00D5FF 90%)',
                    }
                  }}
                >
                  <Avatar
                    alt={user?.name || 'User'}
                    src={user?.avatar}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.name?.charAt(0) || <AccountCircle />}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 2,
                  }
                }}
              >
                {isAdmin && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate('/admin');
                    }}
                  >
                    👑 Admin Dashboard
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                >
                  🎭 Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>👋 Peace Out</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{ mr: 2 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="secondary"
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ pt: 8 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route
              path="/ask"
              element={
                <ProtectedRoute>
                  <AskQuestion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/hub/:hubName" element={<Hub />} />
          </Routes>
        </Container>
      </Box>
    </>
  );
};

export default Layout; 