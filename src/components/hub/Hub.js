import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Button,
  Avatar,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Poll,
  Image,
  EmojiEmotions,
  Celebration,
  LocalFireDepartment,
  Psychology,
  SentimentVeryDissatisfied,
  Lightbulb,
  Coffee,
  Delete as DeleteIcon,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { getPosts, createPost, deletePost, votePost, addReaction, votePoll } from '../../services/postService';
import socketService from '../../services/socketService';

const Hub = () => {
  const { tag } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hubStats, setHubStats] = useState({ members: 0, activeNow: 0 });
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', '', '']
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { isAuthenticated, user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getPosts({ hub: tag });
        setPosts(fetchedPosts.data || fetchedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [tag]);

  useEffect(() => {
    // Connect to Socket.IO and join hub room
    const socket = socketService.connect();
    socketService.joinHub(tag);

    // Listen for new posts
    socketService.onPostCreated(tag, (newPost) => {
      setPosts(prevPosts => [(newPost.data || newPost), ...prevPosts]);
    });

    // Listen for post updates
    socketService.onPostUpdated(tag, (updatedPost) => {
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === updatedPost._id ? (updatedPost.data || updatedPost) : post
      ));
    });

    // Listen for deleted posts
    socketService.onPostDeleted(tag, (deletedPostId) => {
      setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    });

    // Listen for hub stats updates
    socketService.onHubStatsUpdated(tag, (stats) => {
      setHubStats(stats);
    });

    // Cleanup
    return () => {
      socketService.removeHubListeners(tag);
      socketService.leaveHub(tag);
    };
  }, [tag]);

  const getEmptyStateMessage = () => {
    const messages = [
      "No posts yet. More silent than your situationship 👀",
      "Waiting for someone to drop a TED Talk here... 🎤",
      "Empty like your DMs. Start the conversation! 📱",
      "This space is giving main character energy. Be the first! ✨",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getHubIcon = (tagName) => {
    if (!tagName) return <Lightbulb />;
    
    const icons = {
      web3: <Celebration />,
      mentallycoded: <Psychology />,
      burntout2boss: <Coffee />,
      default: <Lightbulb />,
    };
    return icons[tagName.toLowerCase()] || icons.default;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreatePost = async (type, content) => {
    try {
      const newPost = await createPost({
        type,
        title: content,
        content,
        hub: tag
      });

      socketService.emitNewPost(newPost.data || newPost);
      setPosts(prevPosts => [(newPost.data || newPost), ...prevPosts]);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handlePollDataChange = (field, value, index = null) => {
    setPollData(prev => {
      if (index !== null) {
        // Update option at specific index
        const newOptions = [...prev.options];
        newOptions[index] = value;
        return { ...prev, options: newOptions };
      }
      // Update question
      return { ...prev, [field]: value };
    });
  };

  const handleCreatePoll = async () => {
    try {
      // Validate poll data
      if (!pollData.question.trim()) {
        return; // Add error handling if needed
      }

      // Filter out empty options
      const validOptions = pollData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        return; // Add error handling if needed
      }

      const newPost = await createPost({
        type: 'poll',
        title: pollData.question,
        content: pollData.question,
        pollOptions: validOptions.map(text => ({ text, votes: 0 })),
        hub: tag
      });

      socketService.emitNewPost(newPost.data || newPost);
      setPosts(prevPosts => [(newPost.data || newPost), ...prevPosts]);
      
      // Reset form and close dialog
      setPollData({
        question: '',
        options: ['', '', '']
      });
      setPollDialogOpen(false);

      // Trigger success interaction
      window.triggerInteraction('poll_created', { hubId: tag });
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await deletePost(postToDelete._id);
      
      // Remove from local state
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete._id));
      
      // Notify other clients
      socketService.emitPostDeleted(postToDelete._id, tag);
      
      // Close dialog
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const canDeletePost = (post) => {
    return isAuthenticated && (isAdmin || post.author?._id === user?._id);
  };

  const handleVote = async (postId, isUpvote) => {
    if (!isAuthenticated) return;

    try {
      const updatedPost = await votePost(postId, isUpvote);
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === postId ? (updatedPost.data || updatedPost) : post
      ));
      socketService.emitUpdatePost(updatedPost.data || updatedPost);
      
      // Trigger interaction
      window.triggerInteraction('vote', { isUpvote });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleReaction = async (postId, emoji) => {
    if (!isAuthenticated) return;

    try {
      const updatedPost = await addReaction(postId, emoji);
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === postId ? (updatedPost.data || updatedPost) : post
      ));
      socketService.emitUpdatePost(updatedPost.data || updatedPost);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleVotePoll = async (postId, optionIndex) => {
    if (!isAuthenticated) return;

    try {
      const updatedPost = await votePoll(postId, optionIndex);
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === postId ? (updatedPost.data || updatedPost) : post
      ));
      socketService.emitUpdatePost(updatedPost.data || updatedPost);
    } catch (error) {
      console.error('Failed to vote on poll:', error);
    }
  };

  const renderPost = (post) => {
    return (
      <Card
        key={post._id}
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 107, 53, 0.1)',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(255, 107, 53, 0.15)',
          },
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {post.author?.name?.[0] || '?'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">
                {post.author?.name || 'Anonymous'}
              </Typography>
              <Chip
                label={post.author?.level || 'Member'}
                size="small"
                sx={{
                  background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
                  color: 'white',
                }}
              />
            </Box>
            {canDeletePost(post) && (
              <Tooltip title="Delete post">
                <IconButton
                  onClick={() => {
                    setPostToDelete(post);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      color: 'error.dark',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {post.type === 'poll' ? (
            <>
              <Typography variant="h6" gutterBottom>
                {post.title}
              </Typography>
              <Stack spacing={2} mt={2}>
                {post.pollOptions.map((option, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      height: 40,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: isAuthenticated ? 'pointer' : 'default',
                      '&:hover': {
                        bgcolor: isAuthenticated ? 'action.hover' : undefined,
                      },
                    }}
                    onClick={() => isAuthenticated && handleVotePoll(post._id, index)}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${(option.votes / Math.max(...post.pollOptions.map(o => o.votes), 1)) * 100}%`,
                        bgcolor: 'primary.main',
                        opacity: 0.2,
                      }}
                    />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        position: 'relative',
                        height: '100%',
                        px: 2,
                      }}
                    >
                      <Typography>{option.text}</Typography>
                      <Typography>{option.votes} votes</Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {post.content}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => isAuthenticated && handleVote(post._id, true)}
                    disabled={!isAuthenticated}
                  >
                    <ThumbUp />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {post.totalVotes || 0}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => isAuthenticated && handleVote(post._id, false)}
                    disabled={!isAuthenticated}
                  >
                    <ThumbDown />
                  </IconButton>
                </Stack>

                {post.type === 'meme' && (
                  <Stack direction="row" spacing={1}>
                    {['🔥', '😂', '🧠', '💯'].map(emoji => (
                      <Tooltip key={emoji} title={`React with ${emoji}`}>
                        <Chip
                          label={`${emoji} ${post.reactions?.[emoji] || 0}`}
                          onClick={() => isAuthenticated && handleReaction(post._id, emoji)}
                          disabled={!isAuthenticated}
                          size="small"
                          sx={{
                            cursor: isAuthenticated ? 'pointer' : 'default',
                            '&:hover': {
                              transform: isAuthenticated ? 'scale(1.05)' : undefined,
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                )}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!tag) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Hub not found 😢
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This hub doesn't exist or has been moved.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Hub Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          {getHubIcon(tag)}
          <Typography variant="h4" component="h1">
            #{tag}Hub
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Your vibe-check space for all things {tag} 💫
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Chip
            icon={<LocalFireDepartment />}
            label={`${hubStats.members} members`}
            color="primary"
            sx={{
              background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
              color: 'white',
            }}
          />
          <Chip
            icon={<Celebration />}
            label={`${hubStats.activeNow} active now`}
            color="secondary"
            sx={{
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
              color: 'white',
            }}
          />
        </Stack>

        {isAuthenticated && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Poll />}
              onClick={() => setPollDialogOpen(true)}
            >
              Create Poll
            </Button>
            <Button
              variant="contained"
              startIcon={<Image />}
              onClick={() => handleCreatePost('meme', '🤔 When the code works but you don\'t know why')}
            >
              Drop a Meme
            </Button>
          </Stack>
        )}
      </Box>

      {/* Content Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '1rem',
          },
        }}
      >
        <Tab label="🔥 Hot" />
        <Tab label="✨ New" />
        <Tab label="🎯 Polls" />
        <Tab label="😂 Memes" />
      </Tabs>

      {/* Content */}
      <Stack spacing={3}>
        {posts.length > 0 ? (
          posts
            .filter(post => {
              switch (tabValue) {
                case 0: // Hot
                  return true; // Show all posts, sorted by votes/reactions
                case 1: // New
                  return true; // Show all posts, already sorted by date
                case 2: // Polls
                  return post.type === 'poll';
                case 3: // Memes
                  return post.type === 'meme';
                default:
                  return true;
              }
            })
            .sort((a, b) => {
              if (tabValue === 0) {
                // Hot: Sort by total engagement (votes + reactions)
                const getEngagement = (post) => {
                  const reactionCount = post.reactions ? 
                    Object.values(post.reactions).reduce((sum, count) => sum + count, 0) : 0;
                  return (post.totalVotes || 0) + reactionCount;
                };
                return getEngagement(b) - getEngagement(a);
              }
              // New: Keep original order (most recent first)
              return 0;
            })
            .map((post) => renderPost(post))
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            {getEmptyStateMessage()}
          </Typography>
        )}
      </Stack>

      {/* Create Poll Dialog */}
      <Dialog
        open={pollDialogOpen}
        onClose={() => setPollDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create a Poll</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Question"
            fullWidth
            variant="outlined"
            value={pollData.question}
            onChange={(e) => handlePollDataChange('question', e.target.value)}
            sx={{ mb: 2 }}
          />
          {pollData.options.map((option, index) => (
            <TextField
              key={index}
              margin="dense"
              label={`Option ${index + 1}`}
              fullWidth
              variant="outlined"
              value={option}
              onChange={(e) => handlePollDataChange('options', e.target.value, index)}
            />
          ))}
          {pollData.options.length < 5 && (
            <Button
              sx={{ mt: 2 }}
              startIcon={<span>➕</span>}
              onClick={() => setPollData(prev => ({
                ...prev,
                options: [...prev.options, '']
              }))}
            >
              Add Option
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPollDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreatePoll}
            disabled={!pollData.question.trim() || pollData.options.filter(opt => opt.trim()).length < 2}
          >
            Create Poll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPostToDelete(null);
        }}
      >
        <DialogTitle>Delete Post?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {postToDelete?.type === 'poll' ? 'poll' : 'post'}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setPostToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePost}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Hub; 