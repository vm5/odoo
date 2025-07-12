const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  votePost,
  acceptAnswer,
  getPostStats
} = require('../controllers/posts');
const { protect } = require('../middleware/auth');

// Stats route must come before :id route to avoid being treated as an ID
router.get('/stats', getPostStats);

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/vote', protect, votePost);
router.put('/:id/accept', protect, acceptAnswer);

module.exports = router; 