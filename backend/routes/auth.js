const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  getUserStats,
  getUsers,
  updateUserStatus
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/details', protect, updateDetails);
router.put('/password', protect, updatePassword);
router.get('/stats', getUserStats);

// User management routes
router.get('/users', getUsers);
router.put('/users/:id', protect, updateUserStatus);

// Notification routes
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user._id 
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({ 
      success: true,
      notifications 
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications' 
    });
  }
});

module.exports = router; 