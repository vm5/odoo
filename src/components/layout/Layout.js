import React, { useState, useEffect } from 'react';
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
import LinearProgress from '@mui/material/LinearProgress';
import UserMenu from './UserMenu';

// Pages
import Home from '../../pages/Home';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import AskQuestion from '../../pages/AskQuestion';
import QuestionDetail from '../../pages/QuestionDetail';
import AdminDashboard from '../../pages/AdminDashboard';
import Hub from '../hub/Hub';
import Profile from '../profile/Profile';

const Layout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [xpCount, setXpCount] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    if (user?.xp?.total !== undefined) {
      setXpCount(user.xp.total);
    }
  }, [user?.xp?.total]);

  // Listen for XP gain animations
  useEffect(() => {
    const handleXPGain = (data) => {
      setXpGained(data.amount);
      setShowXPGain(true);
      setTimeout(() => setShowXPGain(false), 2000);
    };

    window.addEventListener('xp_gained', handleXPGain);
    return () => window.removeEventListener('xp_gained', handleXPGain);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StackIt
          </Typography>

          {isAuthenticated && (
            <>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mr: 2,
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: '20px',
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FFB88C 90%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 15px rgba(255,255,255,0.5)',
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {xpCount} XP 🔥
                  </Typography>
                </Box>

                {/* XP Gain Animation */}
                {showXPGain && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: '#4CAF50',
                      fontWeight: 'bold',
                      animation: 'float 2s ease-out forwards',
                      '@keyframes float': {
                        '0%': {
                          opacity: 1,
                          transform: 'translateX(-50%) translateY(0)'
                        },
                        '100%': {
                          opacity: 0,
                          transform: 'translateX(-50%) translateY(-30px)'
                        }
                      }
                    }}
                  >
                    +{xpGained} XP
                  </Box>
                )}
              </Box>

              <NotificationBell />
              <UserMenu />
            </>
          )}

          {!isAuthenticated && (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 