import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socketService = {
  socket: null,
  reconnectTimer: null,

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, skipping socket connection');
      return null;
    }

    console.log('Connecting socket with token...');
    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData?._id) {
        console.log('Emitting user_connected:', userData._id);
        this.socket.emit('user_connected', userData._id.toString());
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Invalid token') {
        localStorage.removeItem('token');
      }
    });

    return this.socket;
  },

  attemptReconnect() {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect socket...');
      if (this.socket) {
        this.socket.connect();
      } else {
        this.connect();
      }
      this.reconnectTimer = null;
    }, 2000);
  },

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  },

  // Hub-related functions
  joinHub(hub) {
    if (!hub || typeof hub !== 'string') {
      console.warn('Invalid hub name:', hub);
      return;
    }

    const sanitizedHub = hub.toLowerCase().trim();
    if (!sanitizedHub) {
      console.warn('Empty hub name after sanitization');
      return;
    }

    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Joining hub:', sanitizedHub);
    this.socket?.emit('join_hub', sanitizedHub);
  },

  leaveHub(hub) {
    if (!hub || typeof hub !== 'string') {
      console.warn('Invalid hub name:', hub);
      return;
    }

    const sanitizedHub = hub.toLowerCase().trim();
    if (!sanitizedHub) {
      console.warn('Empty hub name after sanitization');
      return;
    }

    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Leaving hub:', sanitizedHub);
    this.socket?.emit('leave_hub', sanitizedHub);
  },

  onHubStatsUpdated(hub, callback) {
    this.socket?.on(`hub:stats:${hub}`, callback);
  },

  onPostCreated(hub, callback) {
    this.socket?.on(`post:created:${hub}`, callback);
  },

  onPostUpdated(hub, callback) {
    this.socket?.on(`post:updated:${hub}`, callback);
  },

  onPostDeleted(hub, callback) {
    this.socket?.on(`post:deleted:${hub}`, callback);
  },

  removeHubListeners(hub) {
    if (this.socket) {
      this.socket.off(`post:created:${hub}`);
      this.socket.off(`post:updated:${hub}`);
      this.socket.off(`post:deleted:${hub}`);
      this.socket.off(`hub:stats:${hub}`);
    }
  },

  // Post-related functions
  emitNewPost(post) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    this.socket?.emit('post:create', post);
  },

  emitUpdatePost(post) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    this.socket?.emit('post:update', post);
  },

  emitPostDeleted(postId, hub) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    this.socket?.emit('post:delete', { postId, hub });
  },

  // Notification functions
  emitAnswerNotification(questionId, answerId, authorId) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Emitting answer notification:', { questionId, answerId, authorId });
    this.socket?.emit('notification:answer', {
      questionId,
      answerId,
      authorId
    });
  },

  emitMentionNotification(mentionedUserId, postId, mentionerName) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Emitting mention notification:', { mentionedUserId, postId, mentionerName });
    this.socket?.emit('notification:mention', {
      mentionedUserId,
      postId,
      mentionerName
    });
  },

  emitCommentNotification(answerId, commentId, authorId) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Emitting comment notification:', { answerId, commentId, authorId });
    this.socket?.emit('notification:comment', {
      answerId,
      commentId,
      authorId
    });
  },

  emitReadNotification(notificationId) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Marking notification as read:', notificationId);
    this.socket?.emit('read_notification', notificationId);
  },

  onNotification(callback) {
    this.socket?.on('notification', callback);
  },

  onNotificationRead(callback) {
    this.socket?.on('notification_read', callback);
  },

  removeNotificationListeners() {
    if (this.socket) {
      this.socket.off('notification');
      this.socket.off('notification_read');
    }
  },

  emitXPAction(actionType) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Emitting XP action:', actionType);
    this.socket?.emit('xp_action', { type: actionType });
  },

  onXPUpdate(callback) {
    this.socket?.on('xp_update', (data) => {
      console.log('XP Update received:', data);
      callback(data);
    });
  },

  onStreakUpdate(callback) {
    this.socket?.on('streak_update', (data) => {
      console.log('Streak Update received:', data);
      callback(data);
    });
  },

  onBadgeEarned(callback) {
    this.socket?.on('badge_earned', (data) => {
      console.log('New badge earned:', data);
      callback(data);
      // Play celebration sound
      window.triggerInteraction?.('badge_earned');
    });
  },

  // Call this when user performs actions
  emitUserAction(actionType) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    console.log('Emitting user action:', actionType);
    this.socket?.emit('user_action', { type: actionType });
  },

  // Clean up listeners
  removeXPListeners() {
    this.socket?.off('xp_update');
    this.socket?.off('streak_update');
    this.socket?.off('badge_earned');
  }
};

export default socketService; 