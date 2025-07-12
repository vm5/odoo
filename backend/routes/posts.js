const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  votePost,
  addReaction,
  votePoll
} = require('../controllers/posts');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.put('/:id/vote', protect, votePost);
router.put('/:id/react', protect, addReaction);
router.put('/:id/poll-vote', protect, votePoll);

module.exports = router; 