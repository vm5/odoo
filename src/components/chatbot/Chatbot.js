import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Chip,
  Collapse,
  Fade,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEFAULT_PROMPTS = [
  {
    title: "What is StackIt?",
    prompt: "Tell me about StackIt and what makes it unique"
  },
  {
    title: "How to Ask",
    prompt: "What's the best way to ask a question on StackIt?"
  },
  {
    title: "Quick Help",
    prompt: "How do I use StackIt's main features?"
  },
  {
    title: "Reputation Guide",
    prompt: "How do I earn reputation on StackIt?"
  },
  {
    title: "Badges & Rewards",
    prompt: "Tell me about StackIt's badges and rewards system"
  }
];

const Chatbot = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);
  const [showPrompts, setShowPrompts] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/prompts`);
      if (response.data.success && response.data.data) {
        setPrompts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const handlePromptClick = async (promptText) => {
    const newMessage = { text: promptText, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chatbot/chat`, {
        prompt: promptText
      });

      setMessages(prev => [
        ...prev,
        { text: response.data.data, sender: 'bot' }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Tooltip title="Open AI Assistant" placement="left">
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: theme.spacing(3),
            right: theme.spacing(3),
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            width: 56,
            height: 56,
            zIndex: 1200,
          }}
        >
          <ChatIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        zIndex: 1200,
        bgcolor: '#1a1a1a', // Dark background
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#ff5722', // Keep the orange header
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BotIcon />
          <Typography variant="h6">AI Assistant</Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setIsOpen(false)}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          color: 'white',
          bgcolor: '#1a1a1a', // Dark background
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              color: 'white',
              textAlign: 'center',
              p: 2,
            }}
          >
            <BotIcon sx={{ fontSize: 48, color: 'white' }} />
            <Typography variant="body1" sx={{ color: 'white' }}>
              Hi! I'm your AI assistant. Choose a topic below to get started!
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Fade in key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  gap: 1,
                  alignItems: 'flex-start',
                }}
              >
                {message.sender === 'bot' ? (
                  <BotIcon sx={{ color: '#ff5722' }} />
                ) : (
                  <PersonIcon sx={{ color: 'white' }} />
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: message.sender === 'user'
                      ? '#ff5722'
                      : '#2d2d2d', // Darker background for bot messages
                    borderRadius: 2,
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.text}
                  </Typography>
                </Paper>
              </Box>
            </Fade>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} sx={{ color: '#ff5722' }} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Prompts Section */}
      <Box 
        sx={{ 
          bgcolor: '#2d2d2d', // Darker background
          borderTop: '1px solid #404040',
          p: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
          Choose a Topic:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          {prompts.map((prompt, index) => (
            <Chip
              key={index}
              label={prompt.title}
              onClick={() => handlePromptClick(prompt.prompt)}
              sx={{
                cursor: 'pointer',
                bgcolor: '#ff5722',
                color: 'white',
                '&:hover': {
                  bgcolor: '#f4511e',
                },
                '&:active': {
                  bgcolor: '#e64a19',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default Chatbot; 