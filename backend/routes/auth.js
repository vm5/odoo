const express = require('express');
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

// @route   GET /api/auth/users
// @desc    Get users for mentions
// @access  Public
router.get('/users', async (req, res) => {
  try {
    const { search = '', limit = 10, page = 1 } = req.query;
    
    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const users = await User.find(query)
      .select('name _id')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ name: 1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// @route   GET /api/auth/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router; 