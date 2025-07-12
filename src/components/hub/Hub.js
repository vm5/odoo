import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';

const Hub = () => {
  const { tag } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const { isAuthenticated } = useAuth();

  const mockPosts = [
    {
      _id: '1',
        type: 'poll',
      title: 'Best Web3 Stack?',
      content: 'Vote for your favorite!',
      author: { name: 'CryptoWizard', level: 'Pro 🌟' },
      pollOptions: [
        { text: 'Ethereum + React', votes: 156 },
        { text: 'Solana + Vue', votes: 89 },
        { text: 'Polygon + Next.js', votes: 134 }
      ]
    },
    {
      _id: '2',
      type: 'meme',
      content: '🚀 When your smart contract deploys perfectly on the first try',
      author: { name: 'BlockchainBoss', level: 'Expert 💫' },
      reactions: { '🔥': 42, '😂': 23, '🧠': 15 }
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        #{tag} Hub
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Posts" />
          <Tab label="Memes" />
          <Tab label="Polls" />
        </Tabs>
            </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockPosts.map(post => (
          <Box key={post._id} sx={{ 
            p: 3, 
                      bgcolor: 'background.paper',
                      borderRadius: 2,
            boxShadow: 1
          }}>
            <Typography variant="h6">{post.title || post.content}</Typography>
            {post.type === 'poll' && (
              <Box sx={{ mt: 2 }}>
                {post.pollOptions.map((option, idx) => (
                  <Button 
                    key={idx}
                    variant="outlined" 
                    fullWidth 
                    sx={{ mt: 1 }}
                  >
                    {option.text} ({option.votes} votes)
                  </Button>
                ))}
              </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {post.reactions && Object.entries(post.reactions).map(([emoji, count]) => (
                <Button key={emoji} size="small" variant="outlined">
                  {emoji} {count}
                </Button>
              ))}
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Posted by {post.author.name} • {post.author.level}
        </Typography>
      </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Hub; 