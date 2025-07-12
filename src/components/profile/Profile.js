import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Button,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Edit,
  EmojiEvents,
  LocalFireDepartment,
  Psychology,
  Code,
  Celebration,
  AutoAwesome,
  Pets,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [selectedBanner, setSelectedBanner] = useState('pixel-forest');

  // Remove mock data and use real user data
  const userStats = user ? {
    posts: user.stats.postsCreated,
    solutions: user.stats.answersGiven,
    reputation: user.stats.upvotesReceived,
    streak: user.streak.current,
    level: user.levelTitle,
    xp: user.xp.total,
    nextLevelXp: user.xp.level < 6 ? user.xp.level * 500 : user.xp.total, // Simple calculation for next level
    badges: user.badges.map(badge => {
      const emoji = {
        'first_post': '🎯',
        'first_answer': '💡',
        'first_accepted': '✅',
        'streak_3': '🔥',
        'streak_7': '🌟',
        'upvote_10': '👍',
        'answer_10': '💪'
      }[badge.type] || '🏆';
      return `${emoji} ${badge.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    }),
    achievements: [
      {
        icon: <Psychology />,
        title: 'Solutions Given',
        description: `${user.stats.answersGiven} answers provided to help others`
      },
      {
        icon: <Code />,
        title: 'Knowledge Shared',
        description: `${user.stats.postsCreated} posts created`
      },
      {
        icon: <Celebration />,
        title: 'Community Impact',
        description: `${user.stats.upvotesReceived} upvotes received`
      }
    ]
  } : null;

  const bannerStyles = {
    'pixel-forest': {
      background: 'url(https://i.imgur.com/example1.png)',
      backgroundColor: '#1a1a1a',
    },
    'cyber-punk': {
      background: 'linear-gradient(45deg, #ff00ff 0%, #00ffff 100%)',
    },
    'retro-wave': {
      background: 'linear-gradient(180deg, #ff6b6b 0%, #4ecdc4 100%)',
    },
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Profile Header */}
      <Card
        sx={{
          position: 'relative',
          mb: 4,
          borderRadius: 4,
          overflow: 'visible',
        }}
      >
        {/* Banner */}
        <Box
          sx={{
            height: 200,
            ...bannerStyles[selectedBanner],
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            },
          }}
        >
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <Edit />
          </IconButton>
        </Box>

        {/* Avatar and Basic Info */}
        <CardContent
          sx={{
            mt: -8,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack direction="row" spacing={3} alignItems="flex-end">
            <Avatar
              sx={{
                width: 120,
                height: 120,
                border: '4px solid',
                borderColor: 'background.paper',
                background: 'linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)',
              }}
            >
              {user?.name?.charAt(0) || <Pets />}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                {user?.name || 'Anonymous'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<EmojiEvents sx={{ color: '#FFD700' }} />}
                  label={userStats.level}
                  sx={{
                    background: 'linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)',
                    color: 'white',
                  }}
                />
                <Tooltip title="Knowledge Streak">
                  <Chip
                    icon={<LocalFireDepartment color="error" />}
                    label={`${userStats.streak} days`}
                  />
                </Tooltip>
              </Stack>
            </Box>
          </Stack>

          {/* XP Progress */}
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="h6" sx={{ 
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <EmojiEvents sx={{ 
                  color: '#FFD700',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                  },
                }} />
                Level Progress 🚀
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {userStats?.xp} / {userStats?.nextLevelXp} XP ✨
              </Typography>
            </Stack>
            <Box sx={{ 
              position: 'relative',
              height: 24,
              bgcolor: 'rgba(124, 77, 255, 0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid rgba(124, 77, 255, 0.2)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${(userStats?.xp / userStats?.nextLevelXp) * 100}%`,
                  background: 'linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)',
                  borderRadius: 'inherit',
                  transition: 'width 1s ease-in-out',
                  animation: 'shimmer 2s infinite',
                  '@keyframes shimmer': {
                    '0%': { 
                      backgroundPosition: '100% 0',
                      filter: 'brightness(1)',
                    },
                    '50%': {
                      backgroundPosition: '0 0',
                      filter: 'brightness(1.2)',
                    },
                    '100%': {
                      backgroundPosition: '100% 0',
                      filter: 'brightness(1)',
                    },
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transform: 'translateX(-100%)',
                    animation: 'shine 2s infinite',
                  },
                  '@keyframes shine': {
                    '100%': {
                      transform: 'translateX(100%)',
                    },
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  fontWeight: 'bold',
                  zIndex: 1,
                }}
              >
                {userStats?.level} {
                  userStats?.level === 'Master 👑' ? '👑 LEGENDARY 👑' :
                  userStats?.level === 'Expert 💫' ? '🌟 AMAZING 🌟' :
                  userStats?.level === 'Pro 🌟' ? '⚡ AWESOME ⚡' :
                  userStats?.level === 'Regular 🌳' ? '🔥 RISING 🔥' :
                  userStats?.level === 'Helper 🌿' ? '✨ GROWING ✨' :
                  '🌱 STARTING 🌱'
                }
              </Typography>
            </Box>
            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                Current Level: {userStats?.level} {
                  userStats?.level === 'Master 👑' ? '👑' :
                  userStats?.level === 'Expert 💫' ? '💫' :
                  userStats?.level === 'Pro 🌟' ? '🌟' :
                  userStats?.level === 'Regular 🌳' ? '🌳' :
                  userStats?.level === 'Helper 🌿' ? '🌿' :
                  '🌱'
                }
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                Next Level: {Math.ceil(userStats?.nextLevelXp / 500)} 🎯
              </Typography>
            </Stack>

            {/* Stats Cards with enhanced styling */}
            <Grid container spacing={3} mt={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{
                  bgcolor: 'rgba(124, 77, 255, 0.1)',
                  borderRadius: 3,
                  p: 2,
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}>
                  <Stack spacing={1} alignItems="center">
                    <Psychology sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {userStats?.solutions} 🧠
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Solutions Given ⭐
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  borderRadius: 3,
                  p: 2,
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}>
                  <Stack spacing={1} alignItems="center">
                    <LocalFireDepartment sx={{ 
                      fontSize: 40, 
                      color: '#FF6B35',
                      animation: userStats?.streak >= 3 ? 'flame 1.5s infinite' : 'none',
                      '@keyframes flame': {
                        '0%': { transform: 'rotate(-5deg) scale(1)' },
                        '50%': { transform: 'rotate(5deg) scale(1.1)' },
                        '100%': { transform: 'rotate(-5deg) scale(1)' },
                      },
                    }} />
                    <Typography variant="h4" sx={{ color: '#FF6B35' }}>
                      {userStats?.streak} {
                        userStats?.streak >= 7 ? '🔥🔥🔥' :
                        userStats?.streak >= 5 ? '🔥🔥' :
                        userStats?.streak >= 3 ? '🔥' : '✨'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Day Streak 🎯
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 3,
                  p: 2,
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}>
                  <Stack spacing={1} alignItems="center">
                    <EmojiEvents sx={{ fontSize: 40, color: '#4CAF50' }} />
                    <Typography variant="h4" sx={{ color: '#4CAF50' }}>
                      {userStats?.reputation} ⭐
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reputation Points 🏆
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Stats & Badges */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Achievements
                  </Typography>
                  <Grid container spacing={3}>
                    {userStats.achievements.map((achievement, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                          sx={{
                            bgcolor: 'rgba(124, 77, 255, 0.05)',
                            borderRadius: 3,
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            },
                          }}
                        >
                          <CardContent>
                            <Stack alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  display: 'flex',
                                }}
                              >
                                {achievement.icon}
                              </Box>
                              <Typography variant="subtitle1" align="center">
                                {achievement.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                              >
                                {achievement.description}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={4}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Badges
                    </Typography>
                    <Stack spacing={1}>
                      {userStats.badges.map((badge, index) => (
                        <Chip
                          key={index}
                          label={badge}
                          icon={<AutoAwesome />}
                          sx={{
                            background: 'linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)',
                            color: 'white',
                            '& .MuiChip-icon': {
                              color: 'white',
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Stats
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Posts
                        </Typography>
                        <Typography variant="h4">
                          {userStats.posts}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Solutions
                        </Typography>
                        <Typography variant="h4">
                          {userStats.solutions}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Reputation
                        </Typography>
                        <Typography variant="h4">
                          {userStats.reputation}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile; 