import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import RichTextEditor from '../components/editor/RichTextEditor';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/postService';
import socketService from '../services/socketService';

// Tag categories with their options
const tagCategories = {
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c#', 'php', 'ruby', 'go',
    'rust', 'swift', 'kotlin', 'scala', 'r', 'dart', 'lua', 'perl'
  ],
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'html', 'css', 'sass',
    'tailwind', 'bootstrap', 'material-ui', 'styled-components', 'webpack',
    'vite', 'jquery', 'redux', 'mobx'
  ],
  backend: [
    'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
    'fastapi', 'graphql', 'rest', 'websocket', 'grpc', 'nest.js'
  ],
  database: [
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'firebase',
    'dynamodb', 'cassandra', 'sqlite', 'oracle', 'sql-server'
  ],
  devops: [
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'gitlab-ci',
    'github-actions', 'terraform', 'ansible', 'prometheus', 'grafana'
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
    'vscode', 'intellij', 'postman', 'insomnia'
  ],
  mobile: [
    'react-native', 'flutter', 'ios', 'android', 'xamarin', 'ionic',
    'cordova', 'capacitor'
  ],
  testing: [
    'jest', 'cypress', 'selenium', 'puppeteer', 'mocha', 'chai', 'junit',
    'pytest', 'testng', 'playwright'
  ],
  security: [
    'authentication', 'authorization', 'oauth', 'jwt', 'encryption',
    'cybersecurity', 'penetration-testing', 'ssl-tls'
  ],
  concepts: [
    'algorithms', 'data-structures', 'design-patterns', 'clean-code',
    'microservices', 'serverless', 'api-design', 'caching', 'performance'
  ],
  ai_ml: [
    'machine-learning', 'deep-learning', 'tensorflow', 'pytorch', 'opencv',
    'nlp', 'computer-vision', 'data-science', 'neural-networks'
  ],
  blockchain: [
    'web3', 'ethereum', 'solidity', 'smart-contracts', 'nft', 'defi',
    'cryptocurrency', 'blockchain'
  ],
  soft_skills: [
    'career-advice', 'interview-prep', 'productivity', 'team-management',
    'communication', 'mentoring', 'work-life-balance'
  ],
  community: [
    'help-wanted', 'discussion', 'best-practices', 'code-review',
    'brainstorming', 'debugging', 'optimization', 'refactoring'
  ]
};

// Flatten all tags for the Autocomplete component
const allTags = Object.values(tagCategories).flat();

const AskQuestion = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || selectedTags.length === 0) return;

    try {
      setIsSubmitting(true);
      const newPost = await createPost({
        type: 'question',
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags.map(tag => typeof tag === 'string' ? tag : String(tag))
      });

      // Emit the new post to all connected clients
      socketService.emitNewPost(newPost);

      // Safely trigger interaction
      try {
        window.triggerInteraction?.('question_created', { tags: selectedTags });
      } catch (error) {
        console.warn('Interaction trigger not available:', error);
      }

      // Trigger XP for creating a post
      window.triggerXPAction?.('post_created');

      // Show success message
      window.triggerInteraction?.('post_created');

      // Navigate to the new question
      navigate(`/question/${typeof newPost._id === 'string' ? newPost._id : String(newPost._id)}`);
    } catch (error) {
      console.error('Failed to create question:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ask a Question
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            helperText="Be specific and imagine you're asking a question to another person"
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Include all the information someone would need to answer your question"
            />
          </Box>

          {/* Tag Categories */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Tag Categories
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {Object.keys(tagCategories).map((category) => (
                <Chip
                  key={category}
                  label={category.replace('_', ' ').toUpperCase()}
                  onClick={() => setSelectedCategory(category)}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  sx={{ 
                    textTransform: 'capitalize',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Tag Selection */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Popular tags in {selectedCategory ? selectedCategory.replace('_', ' ') : 'all categories'}:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {(selectedCategory ? tagCategories[selectedCategory] : allTags.slice(0, 10)).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => {
                    if (selectedTags.length < 5 && !selectedTags.includes(tag)) {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  sx={{
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      cursor: 'pointer',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Autocomplete
            multiple
            id="tags"
            options={allTags}
            value={selectedTags}
            onChange={(event, newValue) => {
              if (newValue.length <= 5) {
                setSelectedTags(newValue);
              }
            }}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selected Tags"
                placeholder={selectedTags.length >= 5 ? "Maximum 5 tags" : "Add at least one tag"}
                helperText="Add 1-5 tags to describe what your question is about"
                error={selectedTags.length === 0}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  sx={{
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                />
              ))
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                cursor: 'text',
                '& .MuiAutocomplete-input': {
                  cursor: 'text'
                }
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!title.trim() || !content.trim() || selectedTags.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AskQuestion; 