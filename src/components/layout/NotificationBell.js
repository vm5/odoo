import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Typography,
} from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, loading, error, fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Current notifications:', notifications);
    console.log('Unread count:', unreadCount);
  }, [notifications, unreadCount]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Refresh notifications when opening the menu
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.questionId) {
      navigate(`/question/${notification.questionId}`);
    }

    handleClose();
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;

    if (diff < 60000) { // less than 1 minute
      return 'just now';
    } else if (diff < 3600000) { // less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) { // less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return notifDate.toLocaleDateString();
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#ff4444',
              color: 'white',
              fontWeight: 'bold',
            }
          }}
        >
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            overflowY: 'auto',
            mt: 1.5,
            '& .MuiList-root': {
              py: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
        </Box>

        <List sx={{ py: 0 }}>
          {loading ? (
            <ListItem>
              <ListItemText
                primary="Loading notifications..."
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          ) : error ? (
            <ListItem>
              <ListItemText
                primary={error}
                sx={{ textAlign: 'center', color: 'error.main' }}
              />
            </ListItem>
          ) : notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No notifications"
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'grey.500' : 'primary.main' }}>
                      {notification.type === 'answer' ? 'A' :
                       notification.type === 'comment' ? 'C' : '@'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={formatTime(notification.createdAt)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: notification.read ? 'text.primary' : 'primary',
                      sx: { fontWeight: notification.read ? 'normal' : 'bold' }
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
                {index < notifications.length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationBell; 