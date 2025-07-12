const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['answer', 'comment', 'mention'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  questionId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true
  },
  answerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: false
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema); 