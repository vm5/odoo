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

  // Mock data - replace with real data later
  const userStats = {
    posts: 42,
    solutions: 23,
    reputation: 1337,
    streak: 7,
    level: 'Bug Slayer 🔥',
    xp: 1250,
    nextLevelXp: 2000,
    badges: [
      '🧠 100+ IQ Posts',
      '👻 Ghost Coder',
      '💥 Meme Architect',
      '🚀 Early Adopter',
    ],
    achievements: [
      {
        icon: <Psychology />,
        title: 'Big Brain Time',
        description: 'Solved a problem that helped 100+ devs',
      },
      {
        icon: <Code />,
        title: 'Code Wizard',
        description: 'Posted 50+ solutions',
      },
      {
        icon: <Celebration />,
        title: 'Vibe Master',
        description: 'Created 10+ successful polls',
      },
    ],
  };

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
              <Typography variant="body2" color="text.secondary">
                XP Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userStats.xp} / {userStats.nextLevelXp} XP
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(userStats.xp / userStats.nextLevelXp) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(124, 77, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #7C4DFF 30%, #00E5FF 90%)',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

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
    </Box>
  );
};

export default Profile; 