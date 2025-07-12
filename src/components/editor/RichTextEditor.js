import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const theme = useTheme();
  const editorRef = useRef(null);
  const isDarkMode = theme.palette.mode === 'dark';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = async (searchTerm = '', newPage = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/auth/users`, {
        params: {
          search: searchTerm,
          page: newPage,
          limit: 10
        }
      });

      const { users: newUsers, pagination } = response.data;
      
      if (newPage === 1) {
        setUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
      }
      
      setHasMore(pagination.page < pagination.pages);
      setPage(pagination.page);
    } catch (error) {
      console.error('Failed to fetch users for mentions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box 
      sx={{ 
        '& .tox-tinymce': {
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          overflow: 'hidden',
        },
        '& .tox': {
          '& .tox-toolbar__primary': {
            background: theme.palette.background.paper,
          },
          '& .tox-toolbar__group': {
            border: 'none',
          },
          '& .tox-tbtn': {
            color: theme.palette.text.primary,
            '&:hover': {
              background: theme.palette.action.hover,
            },
          },
          '& .tox-edit-area__iframe': {
            background: theme.palette.background.paper,
          },
          '& .tox-mention': {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            padding: '2px 4px',
            borderRadius: '4px',
            textDecoration: 'none',
            cursor: 'pointer',
          },
          '& .tox-collection': {
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          },
          '& .tox-collection__item': {
            color: theme.palette.text.primary,
            '&:hover': {
              background: theme.palette.action.hover,
            },
          },
          '& .tox-collection__item--active': {
            background: theme.palette.action.selected,
          },
        },
      }}
    >
      <Editor
        apiKey="eq88r7dq9lmlzhyd4tcxxlrqxkdsl30ii3j7jb3b0jp75w4i"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={onChange}
        init={{
          height: 400,
          menubar: false,
          skin: isDarkMode ? 'oxide-dark' : 'oxide',
          content_css: isDarkMode ? 'dark' : 'default',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'wordcount', 'mention'
          ],
          toolbar: 'bold italic strikethrough | alignleft aligncenter alignright | numlist bullist | charmap link image',
          statusbar: false,
          placeholder: placeholder || 'Write your content here...',
          mentions: {
            delimiter: '@',
            minChars: 0,
            items: 10,
            source: async (query, process) => {
              try {
                // Show all users when @ is typed with no query
                if (!query) {
                  process(users.map(user => ({
                    id: user._id,
                    name: user.name,
                    value: `@${user.name}`
                  })));
                  return;
                }

                // Fetch filtered users from the server
                await fetchUsers(query);
                
                // Process the matches
                const items = users.map(user => ({
                  id: user._id,
                  name: user.name,
                  value: `@${user.name}`
                }));
                
                process(items);
              } catch (error) {
                console.error('Error fetching mentions:', error);
                process([]); // Return empty array on error
              }
            },
            insert: (item) => {
              return `<span class="tox-mention" data-mention-id="${item.id}">@${item.name}</span>`;
            },
            render: (item) => {
              return `<div class="mention-item">
                <span class="mention-name">${item.name}</span>
              </div>`;
            }
          },
          // Image upload handler
          images_upload_handler: async (blobInfo) => {
            // TODO: Implement image upload to your server
            // For now, convert to base64 for demo
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blobInfo.blob());
            });
          },
          // Custom styles
          content_style: `
            body { 
              font-family: ${theme.typography.fontFamily};
              font-size: 14px;
              color: ${theme.palette.text.primary};
              background-color: ${theme.palette.background.paper};
              padding: 1rem;
            }
            .tox-mention {
              background: ${theme.palette.primary.main};
              color: ${theme.palette.primary.contrastText};
              padding: 2px 4px;
              border-radius: 4px;
              text-decoration: none;
              cursor: pointer;
            }
            .mention-item {
              padding: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
              cursor: pointer;
            }
            .mention-name {
              font-weight: 500;
            }
            .mention-item:hover {
              background: ${theme.palette.action.hover};
            }
            .tox-collection__group {
              max-height: 300px;
              overflow-y: auto;
            }
          `,
          setup: (editor) => {
            editor.on('keydown', (e) => {
              if (e.key === '@') {
                // Trigger mention plugin
                editor.execCommand('mceFocus');
              }
            });

            // Load more users when scrolling to bottom of mention list
            editor.on('Scroll', (e) => {
              const mentionList = document.querySelector('.tox-collection__group');
              if (mentionList && hasMore && !loading) {
                const { scrollTop, scrollHeight, clientHeight } = mentionList;
                if (scrollTop + clientHeight >= scrollHeight - 50) {
                  fetchUsers('', page + 1);
                }
              }
            });
          }
        }}
      />
    </Box>
  );
};

export default RichTextEditor; 