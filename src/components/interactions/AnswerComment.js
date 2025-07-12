import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  Button,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  CheckCircle,
  Reply,
} from '@mui/icons-material';
import RichTextEditor from '../editor/RichTextEditor';
import socketService from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';

const AnswerComment = ({ 
  answer, 
  onVote, 
  onAccept, 
  isQuestionAuthor, 
  isAccepted,
  calculateVotes,
  onComment,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    // Extract mentions from the reply content
    const mentionRegex = /(?:<span class="tox-mention" data-mention-id="([^"]+)">@([^<]+)<\/span>|@([a-zA-Z0-9_-]+))/g;
    const mentions = [...replyContent.matchAll(mentionRegex)];
    
    // Create the comment first
    const comment = await onComment(replyContent);
    
    // Send notifications for mentions
    mentions.forEach(match => {
      const userId = match[1] || match[3];  // match[1] for rich text, match[3] for plain text
      const username = match[2] || match[3]; // match[2] for rich text, match[3] for plain text
      
      if (userId && username && userId !== user._id) {
        socketService.emitMentionNotification(
          userId,
          answer._id,
          user.name
        );
      }
    });

    // Notify the answer author about the comment
    if (answer.author?._id && answer.author._id !== user._id) {
      socketService.emitCommentNotification(
        answer._id,
        comment._id,
        answer.author._id
      );
      
      // Trigger notification sound
      window.triggerInteraction('notification');
    }

    setReplyContent('');
    setShowReply(false);
  };

  return (
    <Box
      sx={{
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none'
        }
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <Avatar 
          sx={{ 
            width: 28, 
            height: 28,
            fontSize: '0.875rem'
          }}
        >
          {answer.author?.name?.[0] || 'A'}
        </Avatar>
        <Box flex={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" fontWeight="medium">
              {answer.author?.name || 'Anonymous'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(answer.createdAt).toLocaleDateString()}
            </Typography>
            {isQuestionAuthor && (
              <Tooltip title={isAccepted ? "Accepted answer" : "Accept this answer"}>
                <IconButton
                  size="small"
                  onClick={() => onAccept(answer._id)}
                  color={isAccepted ? 'success' : 'default'}
                  sx={{ p: 0.5 }}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          
          <Box 
            sx={{ 
              my: 1,
              color: 'text.primary',
              fontSize: '0.9375rem',
              lineHeight: 1.5
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: answer.content }} />
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={() => onVote(answer._id, 1)}
              color={answer.userVote === 1 ? 'primary' : 'default'}
              sx={{ p: 0.5 }}
            >
              <ThumbUp sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {calculateVotes(answer.votes)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onVote(answer._id, -1)}
              color={answer.userVote === -1 ? 'primary' : 'default'}
              sx={{ p: 0.5 }}
            >
              <ThumbDown sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setShowReply(!showReply)}
              sx={{ p: 0.5 }}
            >
              <Reply sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>

          {showReply && (
            <Box sx={{ mt: 2 }}>
              <RichTextEditor
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Write your reply..."
              />
              <Stack direction="row" spacing={1} mt={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                >
                  Post Reply
                </Button>
                <Button
                  size="small"
                  onClick={() => setShowReply(false)}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default AnswerComment; 