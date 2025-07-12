const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const Post = require('./models/Post');
const Notification = require('./models/Notification');
const User = require('./models/User');

dotenv.config();

// Set default values if env vars are not set
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

global.JWT_CONFIG = {
  secret: JWT_SECRET,
  expire: JWT_EXPIRE
};

const auth = require('./routes/auth');
const posts = require('./routes/posts');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Track hub stats
const hubStats = new Map();

// Initialize hub stats
const initializeHubStats = (hub) => {
  if (!hubStats.has(hub)) {
    hubStats.set(hub, {
      members: 0,
      activeUsers: new Set(),
    });
  }
};

// Update hub stats
const updateHubStats = (hub) => {
  const stats = hubStats.get(hub);
  if (stats) {
    io.to(hub).emit('hub_stats_updated', {
      hub,
      members: stats.members,
      activeNow: stats.activeUsers.size
    });
  }
};

// Track connected users
const connectedUsers = new Map();

app.use(express.json());
app.use(cors());
app.use('/api/auth', auth);
app.use('/api/posts', posts);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Store user ID when they connect
  socket.on('user_connected', (userId) => {
    console.log('User connected:', userId);
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log('Updated connected users:', Array.from(connectedUsers.entries()));
    }
  });
  
  socket.on('join_hub', (hub) => {
    socket.join(hub);
    console.log(`Socket ${socket.id} joined hub: ${hub}`);
    
    // Initialize hub if not exists
    initializeHubStats(hub);
    
    // Update active users
    const stats = hubStats.get(hub);
    stats.activeUsers.add(socket.id);
    stats.members += 1;
    
    // Broadcast updated stats
    updateHubStats(hub);
  });

  socket.on('leave_hub', (hub) => {
    socket.leave(hub);
    console.log(`Socket ${socket.id} left hub: ${hub}`);
    
    // Update active users
    const stats = hubStats.get(hub);
    if (stats) {
      stats.activeUsers.delete(socket.id);
      stats.members = Math.max(0, stats.members - 1);
      
      // Broadcast updated stats
      updateHubStats(hub);
    }
  });

  socket.on('post:create', async (post) => {
    if (post.hub) {
      const populatedPost = await Post.findById(post._id).populate('author', 'name level streak avatar');
      io.to(post.hub).emit('post:created', populatedPost);
    }
  });

  socket.on('post:update', async (post) => {
    if (post.hub) {
      const populatedPost = await Post.findById(post._id).populate('author', 'name level streak avatar');
      io.to(post.hub).emit('post:updated', populatedPost);
    }
  });

  socket.on('post:delete', ({ postId, hub }) => {
    if (hub) {
      io.to(hub).emit('post:deleted', postId);
    }
  });

  // Handle answer notifications
  socket.on('notification:answer', async ({ questionId, answerId, authorId }) => {
    try {
      console.log('Creating answer notification:', { questionId, answerId, authorId });
      
      const question = await Post.findById(questionId).populate('author', 'name');
      const answer = await Post.findById(answerId).populate('author', 'name');
      
      if (question && answer) {
        const notification = await Notification.create({
          recipient: authorId,
          type: 'answer',
          message: `${answer.author.name} answered your question: "${question.title}"`,
          questionId,
          answerId
        });

        // Get the socket ID for the recipient
        const recipientSocketId = connectedUsers.get(authorId);
        console.log('Recipient socket ID:', recipientSocketId);
        
        if (recipientSocketId) {
          console.log('Emitting notification to user:', authorId);
          io.to(recipientSocketId).emit('notification', notification);
        } else {
          console.log('User not connected:', authorId);
        }
      }
    } catch (error) {
      console.error('Error creating answer notification:', error);
    }
  });

  // Handle mention notifications
  socket.on('notification:mention', async ({ mentionedUserId, postId, mentionerName }) => {
    try {
      console.log('Received mention notification:', { mentionedUserId, postId, mentionerName });
      
      // Find the mentioned user
      const mentionedUser = await User.findById(mentionedUserId);
      if (!mentionedUser) {
        console.error('Mentioned user not found:', mentionedUserId);
        return;
      }

      const post = await Post.findById(postId);
      if (!post) {
        console.error('Referenced post not found:', postId);
        return;
      }

      const notification = await Notification.create({
        recipient: mentionedUserId,
        type: 'mention',
        message: `${mentionerName} mentioned you in a ${post.type}`,
        questionId: post.type === 'question' ? post._id : post.parentPost,
        answerId: post.type === 'answer' ? post._id : null
      });

      // Get the socket ID for the mentioned user
      const recipientSocketId = connectedUsers.get(mentionedUserId);
      console.log('Recipient socket ID:', recipientSocketId);
      
      if (recipientSocketId) {
        console.log('Emitting notification to user:', mentionedUserId);
        io.to(recipientSocketId).emit('notification', notification);
      } else {
        console.log('User not connected:', mentionedUserId);
      }
    } catch (error) {
      console.error('Error creating mention notification:', error);
    }
  });

  // Handle comment notifications
  socket.on('notification:comment', async ({ answerId, commentId, authorId }) => {
    try {
      console.log('Creating comment notification:', { answerId, commentId, authorId });
      
      const answer = await Post.findById(answerId).populate('author', 'name');
      const comment = await Post.findById(commentId).populate('author', 'name');
      
      if (answer && comment) {
        const notification = await Notification.create({
          recipient: authorId,
          type: 'comment',
          message: `${comment.author.name} commented on your answer`,
          questionId: answer.parentPost,
          answerId
        });

        // Get the socket ID for the recipient
        const recipientSocketId = connectedUsers.get(authorId);
        console.log('Recipient socket ID:', recipientSocketId);
        
        if (recipientSocketId) {
          console.log('Emitting notification to user:', authorId);
          io.to(recipientSocketId).emit('notification', notification);
        } else {
          console.log('User not connected:', authorId);
        }
      }
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  });

  // Handle notification read status
  socket.on('read_notification', async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );

      if (notification) {
        const recipientSocketId = connectedUsers.get(notification.recipient.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('notification_read', notificationId);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove user from connected users map
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        console.log('Removing disconnected user:', userId);
        connectedUsers.delete(userId);
        break;
      }
    }
    
    // Remove user from all hubs they were active in
    hubStats.forEach((stats, hub) => {
      if (stats.activeUsers.has(socket.id)) {
        stats.activeUsers.delete(socket.id);
        stats.members = Math.max(0, stats.members - 1);
        updateHubStats(hub);
      }
    });
  });
});

console.log('Connecting to MongoDB at:', MONGODB_URI);
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 