const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  xp: {
    type: {
      total: {
        type: Number,
        default: 0
      },
      level: {
        type: Number,
        default: 1
      },
      actions: {
        type: [{
          type: {
            type: String,
            enum: ['post_created', 'answer_added', 'comment_added', 'upvote_received', 'answer_accepted', 'hub_joined']
          },
          xp: Number,
          timestamp: {
            type: Date,
            default: Date.now
          }
        }],
        default: []
      }
    },
    default: {
      total: 0,
      level: 1,
      actions: []
    }
  },
  streak: {
    type: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActionDate: {
        type: Date,
        default: null
      }
    },
    default: {
      current: 0,
      longest: 0,
      lastActionDate: null
    }
  },
  badges: [{
    type: {
      type: String,
      enum: ['first_post', 'first_answer', 'first_accepted', 'streak_3', 'streak_7', 'upvote_10', 'answer_10']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    postsCreated: {
      type: Number,
      default: 0
    },
    answersGiven: {
      type: Number,
      default: 0
    },
    upvotesReceived: {
      type: Number,
      default: 0
    },
    acceptedAnswers: {
      type: Number,
      default: 0
    },
    hubsJoined: {
      type: Number,
      default: 0
    }
  },
  avatar: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// XP levels configuration
const XP_LEVELS = {
  1: { min: 0, title: 'Newbie 🌱' },
  2: { min: 100, title: 'Helper 🌿' },
  3: { min: 300, title: 'Regular 🌳' },
  4: { min: 700, title: 'Pro 🌟' },
  5: { min: 1500, title: 'Expert 💫' },
  6: { min: 3000, title: 'Master 👑' }
};

// XP rewards configuration
const XP_REWARDS = {
  post_created: 10,
  answer_added: 15,
  comment_added: 5,
  upvote_received: 10,
  answer_accepted: 25,
  hub_joined: 5
};

// Update XP and check for level up
userSchema.methods.addXP = async function(actionType) {
  const xpToAdd = XP_REWARDS[actionType];
  if (!xpToAdd) return;

  // Add XP action to history
  this.xp.actions.push({
    type: actionType,
    xp: xpToAdd
  });

  // Update total XP
  this.xp.total += xpToAdd;

  // Check for level up
  for (let level = 6; level >= 1; level--) {
    if (this.xp.total >= XP_LEVELS[level].min) {
      this.xp.level = level;
      break;
    }
  }

  // Update streak
  const now = new Date();
  const lastAction = this.streak.lastActionDate;
  
  if (lastAction) {
    const daysSinceLastAction = Math.floor((now - lastAction) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastAction === 0) {
      // Same day, no streak update
    } else if (daysSinceLastAction === 1) {
      // Next day, increase streak
      this.streak.current += 1;
      this.streak.longest = Math.max(this.streak.current, this.streak.longest);
    } else {
      // Streak broken
      this.streak.current = 1;
    }
  } else {
    // First action
    this.streak.current = 1;
    this.streak.longest = 1;
  }

  this.streak.lastActionDate = now;

  // Update stats
  switch (actionType) {
    case 'post_created':
      this.stats.postsCreated += 1;
      break;
    case 'answer_added':
      this.stats.answersGiven += 1;
      break;
    case 'upvote_received':
      this.stats.upvotesReceived += 1;
      break;
    case 'answer_accepted':
      this.stats.acceptedAnswers += 1;
      break;
    case 'hub_joined':
      this.stats.hubsJoined += 1;
      break;
  }

  await this.save();
  return {
    xpGained: xpToAdd,
    newTotal: this.xp.total,
    level: this.xp.level,
    levelTitle: XP_LEVELS[this.xp.level].title,
    streak: this.streak.current
  };
};

// Get user's current level title
userSchema.virtual('levelTitle').get(function() {
  return XP_LEVELS[this.xp.level].title;
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, global.JWT_CONFIG.secret, {
    expiresIn: global.JWT_CONFIG.expire
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 