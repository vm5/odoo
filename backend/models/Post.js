const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['question', 'answer', 'meme', 'poll'],
    required: true
  },
  title: {
    type: String,
    required: function() {
      return this.type === 'question';  // Title only required for questions
    },
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  hub: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    required: false
  }],
  votes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    value: {
      type: Number,
      enum: [-1, 1],
      required: true
    }
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  reactions: {
    type: Map,
    of: Number,
    default: {}
  },
  pollOptions: [{
    text: String,
    votes: {
      type: Number,
      default: 0
    }
  }],
  parentPost: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: false
  },
  answers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Post'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  hasAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  moderationNote: {
    type: String,
    default: null
  },
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ hub: 1, type: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ parentPost: 1 });

// Virtual field for user's vote status
postSchema.virtual('userVote').get(function() {
  if (!this._userVote) return 0;
  return this._userVote;
}).set(function(v) {
  this._userVote = v;
});

// Virtual field for answer count
postSchema.virtual('answerCount').get(function() {
  return this.answers ? this.answers.length : 0;
});

module.exports = mongoose.model('Post', postSchema); 