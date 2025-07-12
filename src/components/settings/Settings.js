import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  VolumeUp,
  VolumeOff,
  Celebration,
  Palette,
  Notifications,
  DarkMode,
} from '@mui/icons-material';
import soundEffects from '../../utils/soundEffects';

const Settings = () => {
  const [settings, setSettings] = useState({
    soundEffects: soundEffects.isEnabled(),
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: localStorage.getItem('notifications') !== 'false',
    confetti: localStorage.getItem('confetti') !== 'false',
  });

  const handleSettingChange = (setting) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting],
      };

      // Update localStorage and apply changes
      localStorage.setItem(setting, newSettings[setting]);

      // Handle specific setting changes
      switch (setting) {
        case 'soundEffects':
          soundEffects.toggle();
          // Play a test sound if enabled
          if (newSettings.soundEffects) {
            soundEffects.play('notification');
          }
          break;
        case 'darkMode':
          // TODO: Implement dark mode toggle
          break;
        case 'notifications':
          // TODO: Implement notification permission request
          break;
        default:
          break;
      }

      return newSettings;
    });
  };

  const themes = [
    { name: 'Cyber Punk', colors: ['#FF00FF', '#00FFFF'] },
    { name: 'Retro Wave', colors: ['#FF6B6B', '#4ECDC4'] },
    { name: 'Forest Vibes', colors: ['#7AFDD6', '#9B59B6'] },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Customize Your Vibe ✨
      </Typography>

      <Stack spacing={4}>
        {/* General Settings */}
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Sound Effects"
                  secondary="Pop, ding, and other satisfying sounds"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.soundEffects}
                    onChange={() => handleSettingChange('soundEffects')}
                    icon={<VolumeOff />}
                    checkedIcon={<VolumeUp />}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Easy on the eyes, heavy on the vibe"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.darkMode}
                    onChange={() => handleSettingChange('darkMode')}
                    icon={<DarkMode />}
                    checkedIcon={<DarkMode />}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Notifications"
                  secondary="Stay in the loop with push notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.notifications}
                    onChange={() => handleSettingChange('notifications')}
                    icon={<Notifications />}
                    checkedIcon={<Notifications />}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Confetti Effects"
                  secondary="Celebrate your wins with style"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.confetti}
                    onChange={() => handleSettingChange('confetti')}
                    icon={<Celebration />}
                    checkedIcon={<Celebration />}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Theme Selection */}
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Theme Selection
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose your aesthetic vibe
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              {themes.map((theme) => (
                <Button
                  key={theme.name}
                  variant="outlined"
                  startIcon={<Palette />}
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${theme.colors[0]} 30%, ${theme.colors[1]} 90%)`,
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {theme.name}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Profile Customization */}
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Flair
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Show off your achievements with these badges
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Chip label="🧠 100+ IQ Posts" />
              <Chip label="👻 Ghost Coder" />
              <Chip label="💥 Meme Architect" />
              <Chip label="🚀 Early Adopter" />
              <Chip label="🎯 Problem Solver" />
              <Chip label="🌟 Rising Star" />
            </Stack>
            <Button
              variant="contained"
              startIcon={<Celebration />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Customize Profile Banner
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Settings; 