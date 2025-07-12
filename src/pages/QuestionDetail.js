import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  IconButton,
  Avatar,
  Alert,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment,
  CheckCircle,
} from '@mui/icons-material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/editor/RichTextEditor';
import { getPost, createPost, updatePost, votePost } from '../services/postService';
import socketService from '../services/socketService';
import AnswerComment from '../components/interactions/AnswerComment';

const QuestionDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchQuestionAndAnswers();

    // Connect to socket for real-time updates
    const socket = socketService.connect();
    
    // Listen for new answers
    socket?.on(`post:created`, (post) => {
      if (post.parentPost === id) {
        fetchQuestionAndAnswers();
      }
    });

    // Listen for answer updates
    socket?.on(`post:updated`, (post) => {
      if (post.parentPost === id || post._id === id) {
        fetchQuestionAndAnswers();
      }
    });

    return () => {
      socket?.off(`post:created`);
      socket?.off(`post:updated`);
    };
  }, [id]);

  const fetchQuestionAndAnswers = async () => {
    try {
      const response = await getPost(id);
      if (!response || !response.data) {
        setError('Question not found');
        setLoading(false);
        return;
      }
      console.log('Question data:', JSON.stringify(response.data, null, 2)); // Debug log
      setQuestion(response.data);
      // Set answers from the question's answers array
      setAnswers(Array.isArray(response.data.answers) ? response.data.answers : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching question:', err);
      setError(err?.response?.data?.error || 'Failed to load question details');
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please log in to post an answer');
      return;
    }

    if (!newAnswer.trim()) {
      setError('Answer cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newAnswerResponse = await createPost({
        type: 'answer',
        content: newAnswer,
        parentPost: id,
      });

      setNewAnswer('');
      setSuccess(true);
      
      // Emit the new post event
      socketService.emitNewPost(newAnswerResponse);

      // Extract mentions from the answer content
      const mentionRegex = /(?:<span class="tox-mention" data-mention-id="([^"]+)">@([^<]+)<\/span>|@([a-zA-Z0-9_-]+))/g;
      const mentions = [...newAnswer.matchAll(mentionRegex)];
      
      // Send notifications for mentions
      mentions.forEach(match => {
        // Handle both rich text editor mentions and plain text mentions
        const userId = match[1] || match[3];  // match[1] for rich text, match[3] for plain text
        const username = match[2] || match[3]; // match[2] for rich text, match[3] for plain text
        
        if (userId && username && userId !== user._id) {
          socketService.emitMentionNotification(
            userId,
            newAnswerResponse._id,
            user.name
          );
        }
      });

      // Emit notification for the question author
      if (question?.author?._id && question.author._id !== user._id) {
        console.log('Emitting answer notification:', {
          questionId: id,
          answerId: newAnswerResponse._id,
          authorId: question.author._id
        });
        
        socketService.emitAnswerNotification(
          id, // questionId
          newAnswerResponse._id, // answerId
          question.author._id // authorId
        );

        // Trigger notification sound
        window.triggerInteraction?.('notification');
      }

      // Fetch updated question to get the new answers array
      fetchQuestionAndAnswers();

      // Show success message
      window.triggerInteraction?.('answer_posted');
    } catch (err) {
      console.error('Error posting answer:', err);
      setError(err?.response?.data?.error || 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId, value) => {
    if (!isAuthenticated) {
      setError('Please log in to vote');
      return;
    }

    try {
      await votePost(answerId, value);
      fetchQuestionAndAnswers(); // Refresh votes
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!isAuthenticated || (question?.author?._id !== user?._id)) {
      setError('Only the question author can accept answers');
      return;
    }

    try {
      await updatePost(id, { acceptedAnswer: answerId });
      fetchQuestionAndAnswers(); // Refresh question and answers
    } catch (err) {
      setError('Failed to accept answer');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/"
          startIcon={<span>🏠</span>}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  if (!question) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Question not found
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/"
          startIcon={<span>🏠</span>}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  // Calculate total votes
  const calculateVotes = (votes) => {
    if (!Array.isArray(votes)) return 0;
    return votes.reduce((acc, vote) => acc + (typeof vote.value === 'number' ? vote.value : 0), 0);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Question Section */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2}>
            <Stack alignItems="center">
              <IconButton 
                onClick={() => handleVote(question._id, 1)}
                color={question.userVote === 1 ? 'primary' : 'default'}
              >
                <ThumbUp />
              </IconButton>
              <Typography>
                {calculateVotes(question.votes)}
              </Typography>
              <IconButton
                onClick={() => handleVote(question._id, -1)}
                color={question.userVote === -1 ? 'primary' : 'default'}
              >
                <ThumbDown />
              </IconButton>
            </Stack>

            <Box flex={1}>
              <Typography variant="h5" gutterBottom>
                {question.title}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {question.author?.name?.[0] || 'A'}
                </Avatar>
                <Typography variant="subtitle2">
                  {question.author?.name || 'Anonymous'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(question.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
              <div dangerouslySetInnerHTML={{ __html: question.content }} />
              <Stack direction="row" spacing={1} mt={2}>
                {question.tags?.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Answers Section */}
        <Box>
          {/* Answer Input */}
          {isAuthenticated ? (
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom>
                Your Answer
              </Typography>
              <RichTextEditor
                value={newAnswer}
                onChange={setNewAnswer}
                placeholder="Write your answer..."
              />
              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  variant="contained"
                  onClick={handleAnswerSubmit}
                  disabled={submitting || !newAnswer.trim()}
                  size="small"
                >
                  {submitting ? 'Posting...' : 'Post Answer'}
                </Button>
                {success && (
                  <Alert severity="success" sx={{ flex: 1 }}>
                    Answer posted successfully!
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ flex: 1 }}>
                    {error}
                  </Alert>
                )}
              </Stack>
            </Box>
          ) : (
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Alert severity="info">
                Please <RouterLink to="/login">log in</RouterLink> to post an answer.
              </Alert>
            </Box>
          )}

          {/* Answers Count */}
          <Box sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Comment fontSize="small" />
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Answers List */}
          <Box>
            {answers.map((answer) => (
              <Box
                key={answer._id}
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <AnswerComment
                  answer={answer}
                  onVote={handleVote}
                  onAccept={handleAcceptAnswer}
                  isQuestionAuthor={question.author?._id === user?._id}
                  isAccepted={question.acceptedAnswer === answer._id}
                  calculateVotes={calculateVotes}
                  onComment={async (content) => {
                    try {
                      const commentResponse = await createPost({
                        type: 'comment',
                        content,
                        parentPost: answer._id,
                      });

                      // Emit the new post event
                      socketService.emitNewPost(commentResponse);

                      // Refresh the answers to show the new comment
                      fetchQuestionAndAnswers();

                      return commentResponse;
                    } catch (err) {
                      console.error('Error posting comment:', err);
                      setError('Failed to post comment');
                      throw err;
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuestionDetail; 