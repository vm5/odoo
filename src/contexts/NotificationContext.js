import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token || !isAuthenticated) {
        console.log('No token or not authenticated, skipping notification fetch');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      console.log('Fetching notifications with token...');
      const response = await axios.get(`${API_URL}/auth/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('Fetched notifications:', response.data.notifications);
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.notifications.filter(n => !n.read).length);
      } else {
        console.error('Failed to fetch notifications:', response.data.error);
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        // Token might be invalid, clear it
        localStorage.removeItem('token');
        setNotifications([]);
        setUnreadCount(0);
      }
      setError(error.response?.data?.error || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Emit to server
      socketService.emitReadNotification(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      await fetchNotifications();
    }
  };

  // Initialize socket connection and fetch notifications
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    console.log('Setting up notifications for user:', user._id);
    const socket = socketService.connect();
    
    // Ensure user is connected to socket
    socket.emit('user_connected', user._id.toString());
    
    // Initial fetch
    fetchNotifications();

    // Listen for new notifications
    socket.on('notification', (notification) => {
      console.log('Received new notification:', notification);
      setNotifications(prev => {
        const exists = prev.some(n => n._id === notification._id);
        if (exists) return prev;
        window.triggerInteraction?.('notification');
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    });

    // Listen for read notifications
    socket.on('notification_read', (notificationId) => {
      console.log('Notification marked as read:', notificationId);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    return () => {
      console.log('Cleaning up notification listeners...');
      socket.off('notification');
      socket.off('notification_read');
      socketService.removeNotificationListeners();
    };
  }, [isAuthenticated, user?._id]);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    loading,
    error
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 