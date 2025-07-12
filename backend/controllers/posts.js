const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { hub, type, author } = req.query;
    const query = {};

    if (hub) query.hub = hub;
    if (type) query.type = type;
    if (author) query.author = author;

    const posts = await Post.find(query)
      .populate('author', 'name level streak avatar')
      .sort('-createdAt');

    // Add user's vote status if authenticated
    if (req.user) {
      posts.forEach(post => {
        post.userVote = post.votes.find(vote => 
          vote.user.toString() === req.user.id
        )?.value || 0;
      });
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name level streak avatar')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name level streak avatar'
        },
        options: { sort: { 'createdAt': -1 } }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Add user's vote status if authenticated
    if (req.user) {
      post.userVote = post.votes.find(vote => 
        vote.user.toString() === req.user.id
      )?.value || 0;

      // Add vote status to answers
      if (post.answers && Array.isArray(post.answers)) {
        post.answers.forEach(answer => {
          answer.userVote = answer.votes.find(vote => 
            vote.user.toString() === req.user.id
          )?.value || 0;
        });
      }
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    req.body.author = req.user.id;

    // If this is an answer, validate and update the parent question
    if (req.body.type === 'answer') {
      if (!req.body.parentPost) {
        return res.status(400).json({
          success: false,
          error: 'Parent question ID is required for answers'
        });
      }

      const parentQuestion = await Post.findById(req.body.parentPost);
      if (!parentQuestion) {
        return res.status(404).json({
          success: false,
          error: 'Parent question not found'
        });
      }

      if (parentQuestion.type !== 'question') {
        return res.status(400).json({
          success: false,
          error: 'Parent post must be a question'
        });
      }
    }

    const post = await Post.create(req.body);
    
    // If this is an answer, add it to the parent question's answers array
    if (post.type === 'answer' && post.parentPost) {
      await Post.findByIdAndUpdate(post.parentPost, {
        $push: { answers: post._id }
      });

      // Populate the author details before sending response
      await post.populate('author', 'name level streak avatar');

      // Fetch the updated parent question to get the new answer count
      const updatedQuestion = await Post.findById(post.parentPost)
        .populate('answers')
        .populate('author', 'name level streak avatar');

      // Add the answer count to the response
      post._doc.answerCount = updatedQuestion.answers.length;
    } else {
      await post.populate('author', 'name level streak avatar');
    }

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Make sure user is post author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    // Handle accepting answers
    if (req.body.isAccepted !== undefined) {
      if (post.type !== 'answer') {
        return res.status(400).json({
          success: false,
          error: 'Only answers can be accepted'
        });
      }

      const parentQuestion = await Post.findById(post.parentPost);
      if (!parentQuestion) {
        return res.status(404).json({
          success: false,
          error: 'Parent question not found'
        });
      }

      // Only the question author can accept answers
      if (parentQuestion.author.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Only the question author can accept answers'
        });
      }

      // Don't allow accepting multiple answers
      if (parentQuestion.hasAcceptedAnswer && req.body.isAccepted) {
        return res.status(400).json({
          success: false,
          error: 'This question already has an accepted answer'
        });
      }
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'name level streak avatar');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Make sure user is post author
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    await post.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Vote on a post
// @route   PUT /api/posts/:id/vote
// @access  Private
exports.votePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user has already voted
    const existingVote = post.votes.find(vote => 
      vote.user.toString() === req.user.id
    );

    const voteValue = req.body.isUpvote ? 1 : -1;

    if (existingVote) {
      // Remove vote if clicking the same button
      if (existingVote.value === voteValue) {
        post.votes = post.votes.filter(vote => 
          vote.user.toString() !== req.user.id
        );
      } else {
        // Change vote
        existingVote.value = voteValue;
      }
    } else {
      // Add new vote
      post.votes.push({
        user: req.user.id,
        value: voteValue
      });
    }

    // Calculate total votes
    post.totalVotes = post.votes.reduce((acc, vote) => acc + vote.value, 0);

    await post.save();
    await post.populate('author', 'name level streak avatar');

    // Add user's vote status
    post.userVote = post.votes.find(vote => 
      vote.user.toString() === req.user.id
    )?.value || 0;

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Add reaction to a post
// @route   PUT /api/posts/:id/react
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const { emoji } = req.body;
    const currentCount = post.reactions.get(emoji) || 0;
    post.reactions.set(emoji, currentCount + 1);
    await post.save();
    await post.populate('author', 'name level streak avatar');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Vote on a poll option
// @route   PUT /api/posts/:id/poll-vote
// @access  Private
exports.votePoll = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.type !== 'poll') {
      return res.status(400).json({
        success: false,
        error: 'This post is not a poll'
      });
    }

    const { optionIndex } = req.body;
    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid poll option'
      });
    }

    post.pollOptions[optionIndex].votes += 1;
    await post.save();
    await post.populate('author', 'name level streak avatar');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}; 