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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Stack from '@mui/material/Stack';
import NotificationBell from './NotificationBell';
import LinearProgress from '@mui/material/LinearProgress';

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

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

          {/* Add XP Counter here */}
          {user && user.xp && user.xp.total !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mr: 2,
                background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
                padding: '4px 12px',
                borderRadius: '20px',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(255, 105, 135, 0.4)',
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {user.xp.total} 
                <span style={{ 
                  fontSize: '0.8em',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  animation: 'pulse 2s infinite',
                }}>
                  XP 🔥
                </span>
              </Typography>
            </Box>
          )}

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

              {/* Level Badge */}
              {user && user.xp && user.levelTitle && (
                <Tooltip 
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Level Up! 🚀 {user.levelTitle} ✨
                      </Typography>
                      <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user.xp.total} XP 💫
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(user.xp.total % 500) / 500 * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(45deg, #FFD700 30%, #FF6B35 90%)',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 1
                      }}>
                        {500 - (user.xp.total % 500)} XP to next level 🎯
                      </Typography>
                    </Box>
                  }
                >
                  <Chip
                    icon={<EmojiEvents sx={{ 
                      color: '#FFD700',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          transform: 'scale(1)',
                          opacity: 1
                        },
                        '50%': {
                          transform: 'scale(1.2)',
                          opacity: 0.8
                        },
                        '100%': {
                          transform: 'scale(1)',
                          opacity: 1
                        }
                      }
                    }} />}
                    label={`${user.levelTitle} 🌟`}
                    sx={{ 
                      mr: 2, 
                      background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        background: 'linear-gradient(45deg, #45A049 30%, #7CB342 90%)',
                      }
                    }}
                  />
                </Tooltip>
              )}

              {/* Streak Counter */}
              {user && user.streak && typeof user.streak.current === 'number' && (
                <Tooltip 
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        {user.streak.current >= 7 ? '🔥 UNSTOPPABLE! 🔥' : 
                         user.streak.current >= 5 ? '🌟 On Fire! 🌟' :
                         user.streak.current >= 3 ? '⚡ Getting Hot! ⚡' :
                         '✨ Keep Going! ✨'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Current Streak: {user.streak.current} days 🎯
                      </Typography>
                      <Typography variant="body2">
                        Longest Streak: {user.streak.longest} days 👑
                      </Typography>
                    </Box>
                  }
                >
                  <Chip
                    icon={<LocalFireDepartment sx={{ 
                      color: '#FF4444',
                      animation: user.streak.current >= 3 ? 'flame 1.5s infinite' : 'none',
                      '@keyframes flame': {
                        '0%': {
                          transform: 'rotate(-5deg) scale(1)'
                        },
                        '50%': {
                          transform: 'rotate(5deg) scale(1.1)'
                        },
                        '100%': {
                          transform: 'rotate(-5deg) scale(1)'
                        }
                      }
                    }} />}
                    label={`${user.streak.current} 🔥`}
                    sx={{ 
                      mr: 2,
                      background: 'linear-gradient(45deg, #FF4444 30%, #FF8C00 90%)',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        background: 'linear-gradient(45deg, #FF3333 30%, #FF7B00 90%)',
                      }
                    }}
                  />
                </Tooltip>
              )}

              <NotificationBell />

              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{ ml: 2 }}
              >
                {user?.avatar ? (
                  <Avatar src={user.avatar} alt={user.name} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleClose}
                >
                  Profile
                </MenuItem>
                {isAdmin && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={handleClose}
                  >
                    Admin Dashboard
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                color="primary"
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
              >
                Register
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Add spacing below AppBar */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout; 