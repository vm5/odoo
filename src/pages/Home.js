import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Grid,
  Avatar,
  Tooltip,
  Container,
  IconButton,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment,
  CheckCircle,
  LocalFireDepartment,
  EmojiEvents,
  Mood,
  Psychology,
  Celebration,
  Code,
  Coffee,
} from '@mui/icons-material';
import { Link, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import { getPosts, votePost, addReaction } from '../services/postService';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hubStats, setHubStats] = useState({
    web3: { members: 0, activeNow: 0 },
    mentallyCoded: { members: 0, activeNow: 0 },
    burntout2boss: { members: 0, activeNow: 0 }
  });

  // Hub definitions with their metadata
  const hubs = [
    {
      tag: 'web3',
      icon: <Celebration />,
      description: 'All things blockchain and web3 development',
    },
    {
      tag: 'mentallyCoded',
      icon: <Psychology />,
      description: 'Support group for debugging nightmares',
    },
    {
      tag: 'burntout2boss',
      icon: <Coffee />,
      description: 'From imposter syndrome to tech lead',
    },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Only fetch questions, not answers
        const fetchedPosts = await getPosts({ type: 'question' });
        console.log('Fetched posts:', JSON.stringify(fetchedPosts, null, 2)); // Debug log
        setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    // Connect to Socket.IO
    const socket = socketService.connect();

    // Join all hubs to get their stats
    hubs.forEach(hub => {
      socketService.joinHub(hub.tag);
      socketService.onHubStatsUpdated(hub.tag, (stats) => {
        setHubStats(prev => ({
          ...prev,
          [hub.tag]: {
            members: stats.members,
            activeNow: stats.activeNow
          }
        }));
      });
    });

    // Listen for post updates
    socketService.onPostUpdated(null, (updatedPost) => {
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      ));
    });

    // Cleanup
    return () => {
      hubs.forEach(hub => {
        socketService.removeHubListeners(hub.tag);
        socketService.leaveHub(hub.tag);
      });
    };
  }, []);

  const handleVote = async (postId, isUpvote) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const updatedPost = await votePost(postId, isUpvote);
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === postId ? updatedPost : post
      ));
      socketService.emitUpdatePost(updatedPost);
      
      // Trigger interaction
      window.triggerInteraction('vote', { isUpvote });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleReaction = async (postId, emoji) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const updatedPost = await addReaction(postId, emoji);
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === postId ? updatedPost : post
      ));
      socketService.emitUpdatePost(updatedPost);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  // Calculate total votes
  const calculateVotes = (votes) => {
    if (!Array.isArray(votes)) return 0;
    return votes.reduce((acc, vote) => acc + (typeof vote.value === 'number' ? vote.value : 0), 0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to StackIt
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Your Community for Developer Q&A
        </Typography>
        {isAuthenticated ? (
          <Button
            variant="contained"
            component={Link}
            to="/ask"
            size="large"
            startIcon={<span>🚀</span>}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.2rem',
            }}
          >
            Start Your Journey
          </Button>
        ) : (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              component={Link}
              to="/register"
              size="large"
              startIcon={<span>✨</span>}
            >
              Join the Community
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/login"
              size="large"
              startIcon={<span>👋</span>}
            >
              Welcome Back
            </Button>
          </Stack>
        )}
      </Box>

      {/* Hubs Section */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Popular Hubs 🌟
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {hubs.map((hub) => (
          <Grid item xs={12} md={4} key={hub.tag}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {hub.icon}
                    <Typography variant="h6" component={Link} to={`/hub/${hub.tag}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      #{hub.tag}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    {hub.description}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Members in this hub">
                      <Chip
                        icon={<LocalFireDepartment />}
                        label={`${hubStats[hub.tag]?.members || 0} devs`}
                        size="small"
                        sx={{
                          background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
                          color: 'white',
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Currently online">
                      <Chip
                        icon={<Celebration />}
                        label={`${hubStats[hub.tag]?.activeNow || 0} online`}
                        size="small"
                        sx={{
                          background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                          color: 'white',
                        }}
                      />
                    </Tooltip>
                  </Stack>
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/hub/${hub.tag}`}
                    fullWidth
                  >
                    Join the Vibe
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Questions Section */}
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 3,
          background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Latest Questions 🔥
      </Typography>
      
      <Stack spacing={3}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading posts...</Typography>
          </Box>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Card
              key={typeof post._id === 'string' ? post._id : String(post._id)}
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
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {typeof post.author?.name === 'string' ? post.author.name[0].toUpperCase() : 'A'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {typeof post.author?.name === 'string' ? post.author.name : 'Anonymous'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {typeof post.author?.level === 'string' ? post.author.level : 'Member'}
                      </Typography>
                      {typeof post.author?.streak === 'number' && post.author.streak > 0 && (
                        <Tooltip title="Knowledge Streak">
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LocalFireDepartment sx={{ fontSize: 14, color: 'error.main' }} />
                            <Typography variant="caption">{post.author.streak}</Typography>
                          </Stack>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                </Stack>

                <Typography
                  variant="h6"
                  component={Link}
                  to={`/question/${post._id}`}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'block',
                    mb: 2,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {typeof post.title === 'string' ? post.title : ''}
                </Typography>

                {Array.isArray(post.tags) && (
                  <Stack direction="row" spacing={1} mb={2}>
                    {post.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={typeof tag === 'string' ? tag : String(tag)}
                        component={Link}
                        to={`/hub/${tag}`}
                        clickable
                        size="small"
                        sx={{
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                )}

                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleVote(post._id, true)}
                      color={post.userVote === 1 ? 'primary' : 'default'}
                    >
                      <ThumbUp />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {calculateVotes(post.votes)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleVote(post._id, false)}
                      color={post.userVote === -1 ? 'primary' : 'default'}
                    >
                      <ThumbDown />
                    </IconButton>
                  </Stack>

                  <Button
                    variant="outlined"
                    size="small"
                    component={RouterLink}
                    to={`/question/${post._id}`}
                    startIcon={<Comment />}
                    sx={{
                      ml: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Answer
                  </Button>

                  <Box flex={1} />

                  {post.type === 'question' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={post.answerCount === 0 ? "Be the first to answer!" : `${post.answerCount} answers`}>
                        <Chip
                          icon={<Comment fontSize="small" />}
                          label={`${typeof post.answerCount === 'number' ? post.answerCount : 0} answers`}
                          color={post.answerCount > 0 ? "primary" : "default"}
                          size="small"
                          sx={{
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                          }}
                          component={RouterLink}
                          to={`/question/${post._id}`}
                          clickable
                        />
                      </Tooltip>
                      {post.hasAcceptedAnswer && (
                        <Tooltip title="Has accepted answer">
                          <CheckCircle color="success" fontSize="small" />
                        </Tooltip>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 4,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No questions yet. Be the first to ask!
            </Typography>
            {isAuthenticated && (
              <Button
                variant="contained"
                component={Link}
                to="/ask"
                startIcon={<span>🚀</span>}
                sx={{ mt: 2 }}
              >
                Ask First Question
              </Button>
            )}
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default Home; 