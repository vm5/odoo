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

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const chatbotRoutes = require('./routes/chatbot');

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

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chatbot', chatbotRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Store user ID when they connect
  socket.on('user_connected', (userId) => {
    console.log('User connected:', userId);
    if (userId) {
      connectedUsers.set(userId.toString(), socket.id);
      console.log('Updated connected users:', Array.from(connectedUsers.entries()));
    }
  });
  
  socket.on('join_hub', (hub) => {
    if (typeof hub === 'object') {
      hub = hub.hub; // Extract hub string if it's an object
    }
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
    if (typeof hub === 'object') {
      hub = hub.hub; // Extract hub string if it's an object
    }
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
      console.log('Processing mention notification:', { mentionedUserId, postId, mentionerName });
      
      // First try to find user by username
      let mentionedUser = await User.findOne({ 
        $or: [
          { name: mentionedUserId },
          { _id: mongoose.Types.ObjectId.isValid(mentionedUserId) ? mentionedUserId : null }
        ]
      });

      if (!mentionedUser) {
        console.log('Could not find mentioned user:', mentionedUserId);
        return;
      }

      console.log('Found mentioned user:', mentionedUser.name, mentionedUser._id);

      const post = await Post.findById(postId);
      if (!post) {
        console.error('Referenced post not found:', postId);
        return;
      }

      // Don't create notification if user mentions themselves
      const mentionerUser = await User.findOne({ name: mentionerName });
      if (mentionerUser?._id.toString() === mentionedUser._id.toString()) {
        console.log('Skipping self-mention notification');
        return;
      }

      const notification = await Notification.create({
        recipient: mentionedUser._id,
        type: 'mention',
        message: `${mentionerName} mentioned you in a ${post.type}`,
        questionId: post.type === 'question' ? post._id : post.parentPost,
        answerId: post.type === 'answer' ? post._id : null
      });

      // Get the socket ID for the mentioned user
      const recipientSocketId = connectedUsers.get(mentionedUser._id.toString());
      console.log('Recipient socket ID:', recipientSocketId, 'for user:', mentionedUser._id);
      console.log('Connected users:', Array.from(connectedUsers.entries()));
      
      if (recipientSocketId) {
        console.log('Emitting notification to user:', mentionedUser._id);
        io.to(recipientSocketId).emit('notification', notification);
      } else {
        console.log('User not connected:', mentionedUser._id);
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
        // Don't create notification if author is commenting on their own answer
        if (comment.author._id.toString() === authorId.toString()) {
          console.log('Skipping notification - author commenting on own answer');
          return;
        }

        const notification = await Notification.create({
          recipient: authorId,
          type: 'comment',
          message: `${comment.author.name} commented on your answer`,
          questionId: answer.parentPost,
          answerId
        });

        // Get the socket ID for the recipient
        const recipientSocketId = connectedUsers.get(authorId.toString());
        console.log('Recipient socket ID:', recipientSocketId, 'for user:', authorId);
        console.log('Connected users:', Array.from(connectedUsers.entries()));
        
        if (recipientSocketId) {
          console.log('Emitting notification to user:', authorId);
          io.to(recipientSocketId).emit('notification', notification);
        } else {
          console.log('User not connected:', authorId);
          // Store notification in database even if user is not connected
          // They will see it when they log in next time
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

  // Handle user actions and XP updates
  socket.on('user_action', async ({ type }) => {
    try {
      // Get user from connected users map
      const userId = Array.from(connectedUsers.entries())
        .find(([_, socketId]) => socketId === socket.id)?.[0];

      if (!userId) {
        console.warn('User not found for socket:', socket.id);
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        console.warn('User document not found:', userId);
        return;
      }

      console.log('Processing user action:', type, 'for user:', userId);

      // Add XP and update streak
      const result = await user.addXP(type);
      
      // Emit XP update to user
      socket.emit('xp_update', {
        xpGained: result.xpGained,
        newTotal: result.newTotal,
        level: result.level,
        levelTitle: result.levelTitle
      });

      // Emit streak update if changed
      if (result.streak !== user.streak.current) {
        socket.emit('streak_update', {
          current: result.streak,
          longest: user.streak.longest
        });

        // Check for streak badges
        if (result.streak >= 7) {
          const hasBadge = user.badges.some(b => b.type === 'streak_7');
          if (!hasBadge) {
            user.badges.push({ type: 'streak_7' });
            socket.emit('badge_earned', {
              type: 'streak_7',
              title: '7 Day Streak! 🔥',
              description: 'Maintained a 7-day activity streak'
            });
          }
        } else if (result.streak >= 3) {
          const hasBadge = user.badges.some(b => b.type === 'streak_3');
          if (!hasBadge) {
            user.badges.push({ type: 'streak_3' });
            socket.emit('badge_earned', {
              type: 'streak_3',
              title: '3 Day Streak! 🎯',
              description: 'Maintained a 3-day activity streak'
            });
          }
        }
      }

      // Check for other badges based on stats
      if (type === 'post_created' && user.stats.postsCreated === 1) {
        user.badges.push({ type: 'first_post' });
        socket.emit('badge_earned', {
          type: 'first_post',
          title: 'First Post! 📝',
          description: 'Created your first post'
        });
      } else if (type === 'answer_added' && user.stats.answersGiven === 1) {
        user.badges.push({ type: 'first_answer' });
        socket.emit('badge_earned', {
          type: 'first_answer',
          title: 'First Answer! ✨',
          description: 'Posted your first answer'
        });
      }

      await user.save();
    } catch (error) {
      console.error('Error processing user action:', error);
    }
  });

  // Handle XP actions directly
  socket.on('xp_action', async ({ type }) => {
    try {
      const userId = Array.from(connectedUsers.entries())
        .find(([_, socketId]) => socketId === socket.id)?.[0];

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          const result = await user.addXP(type);
          socket.emit('xp_update', {
            xpGained: result.xpGained,
            newTotal: result.newTotal,
            level: result.level,
            levelTitle: result.levelTitle
          });
        }
      }
    } catch (error) {
      console.error('Error processing XP action:', error);
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