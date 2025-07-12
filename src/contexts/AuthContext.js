import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add XP increment effect
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const incrementXP = () => {
      setUser(prevUser => ({
        ...prevUser,
        xp: {
          ...prevUser.xp,
          total: (prevUser.xp?.total || 0) + 10
        },
        levelTitle: `Level ${Math.floor(((prevUser.xp?.total || 0) + 10) / 100) + 1}`
      }));
    };

    const interval = setInterval(incrementXP, 40000); // 40 seconds

    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Get fresh user data
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const userData = response.data.data;
          console.log('Fresh user data:', userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
          
          // Connect to socket with user ID
          const socket = socketService.connect();
          if (userData?._id) {
            console.log('Connecting socket with user ID:', userData._id);
            socket.emit('user_connected', userData._id.toString());
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Add function to update user data
  const updateUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  };

  // Listen for XP and streak updates
  useEffect(() => {
    if (!user?._id) return;

    const socket = socketService.connect();
    
    // Listen for XP updates
    socket.on('xp_update', (data) => {
      console.log('XP Update:', data);
      setUser(prev => ({
        ...prev,
        xp: {
          ...prev.xp,
          total: data.newTotal,
          level: data.level
        }
      }));

      // Show XP gain animation
      window.triggerInteraction?.('xp_gained', {
        amount: data.xpGained,
        total: data.newTotal,
        level: data.levelTitle
      });
    });

    // Listen for streak updates
    socket.on('streak_update', (data) => {
      console.log('Streak Update:', data);
      setUser(prev => ({
        ...prev,
        streak: {
          ...prev.streak,
          current: data.current,
          longest: data.longest
        }
      }));

      // Show streak animation if increased
      if (data.current > user.streak.current) {
        window.triggerInteraction?.('streak_increased', {
          streak: data.current
        });
      }
    });

    // Listen for new badges
    socket.on('badge_earned', (badge) => {
      console.log('New Badge:', badge);
      setUser(prev => ({
        ...prev,
        badges: [...(prev.badges || []), {
          type: badge.type,
          earnedAt: new Date()
        }]
      }));

      // Show badge animation
      window.triggerInteraction?.('badge_earned', {
        title: badge.title,
        description: badge.description
      });
    });

    return () => {
      socket.off('xp_update');
      socket.off('streak_update');
      socket.off('badge_earned');
      socketService.removeXPListeners();
    };
  }, [user?._id]);

  // Function to trigger XP actions
  const triggerXPAction = async (actionType) => {
    if (!user?._id) return;
    socketService.emitUserAction(actionType);
  };

  const login = async (email, password) => {
    try {
      // Validate input
      if (!email || !password) {
        return {
          success: false,
          error: 'Please provide both email and password'
        };
      }

      // Trim whitespace
      email = email.trim();
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (!response.data.success) {
        return {
          success: false,
          error: response.data.error || 'Login failed'
        };
      }

      const { token, user } = response.data;
      console.log('Login successful, user data:', user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);

      // Connect to socket with user ID
      const socket = socketService.connect();
      if (user?._id) {
        console.log('User ID after login:', user._id);
        socket.emit('user_connected', user._id.toString());
      }

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid email or password'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);

      // Connect to socket with user ID
      const socket = socketService.connect();
      socket.emit('user_connected', user._id);

      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Disconnect socket
    socketService.disconnect();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserData,
    triggerXPAction // Export the function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 