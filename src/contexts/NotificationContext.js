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
  const { isAuthenticated, user } = useAuth();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/auth/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    if (!isAuthenticated || !user?._id) return;

    const socket = socketService.connect();
    
    // Listen for new notifications
    socket.on('notification', (notification) => {
      console.log('Received new notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      window.triggerInteraction?.('notification');
    });

    // Listen for read notifications
    socket.on('notification_read', (notificationId) => {
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    // Fetch existing notifications
    fetchNotifications();

    // Cleanup
    return () => {
      socketService.removeNotificationListeners();
    };
  }, [isAuthenticated, user?._id]);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 