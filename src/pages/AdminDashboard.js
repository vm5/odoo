import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import {
  Block,
  Delete,
  Warning,
  Message,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ mt: 3 }}>
    {value === index && children}
  </Box>
);

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [platformMessage, setPlatformMessage] = useState('');

  // Mock data - will be replaced with real data later
  const reportedContent = [
    {
      id: 1,
      type: 'question',
      title: 'How to hack a website?',
      author: 'suspicious_user',
      reason: 'Inappropriate content',
      reportedBy: 'concerned_user',
      date: '2023-08-20',
    },
    // Add more mock reported content
  ];

  const bannedUsers = [
    {
      id: 1,
      username: 'spammer123',
      reason: 'Multiple spam posts',
      bannedDate: '2023-08-15',
    },
    // Add more mock banned users
  ];

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteContent = (contentId) => {
    // TODO: Implement content deletion
    console.log('Delete content:', contentId);
  };

  const handleBanUser = (userId) => {
    // TODO: Implement user banning
    console.log('Ban user:', userId);
  };

  const handleSendMessage = () => {
    // TODO: Implement platform-wide message
    console.log('Send platform message:', platformMessage);
    setPlatformMessage('');
    setMessageDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Reported Content" />
          <Tab label="Banned Users" />
          <Tab label="Platform Messages" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <List>
            {reportedContent.map((item) => (
              <ListItem key={item.id} divider>
                <ListItemText
                  primary={item.title}
                  secondary={`Reported by ${item.reportedBy} - ${item.reason}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDeleteContent(item.id)}
                    sx={{ mr: 1 }}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="warning"
                    onClick={() => handleBanUser(item.author)}
                  >
                    <Block />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {bannedUsers.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemText
                  primary={user.username}
                  secondary={`Banned on ${user.bannedDate} - ${user.reason}`}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => console.log('Unban user:', user.id)}
                  >
                    Unban
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Button
              variant="contained"
              startIcon={<Message />}
              onClick={() => setMessageDialogOpen(true)}
            >
              Send Platform Message
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      <Dialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Platform-wide Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={platformMessage}
            onChange={(e) => setPlatformMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={!platformMessage.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 