import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socketService = {
  socket: null,

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        
        // Re-emit user_connected if we have the user data in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user?._id) {
            console.log('Re-emitting user_connected for user:', user._id);
            this.socket.emit('user_connected', user._id);
          }
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });

      this.socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }
    return this.socket;
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  emitNewPost(post) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, reconnecting...');
      this.connect();
    }
    this.socket?.emit('post:create', post);
  },

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

  // Notification Events
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
  }
};

export default socketService; 