import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuestionDetail from './pages/QuestionDetail';
import AskQuestion from './pages/AskQuestion';
import AdminDashboard from './pages/AdminDashboard';
import AdminModeration from './pages/AdminModeration';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MicroInteractions from './components/interactions/MicroInteractions';
import theme from './theme/darkTheme';
import Chatbot from './components/chatbot/Chatbot';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <MicroInteractions />
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />
                <Route path="/chatbot" element={<Chatbot />} />

                {/* Protected routes */}
                <Route path="/ask" element={<ProtectedRoute><AskQuestion /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/moderation" element={<ProtectedRoute><AdminModeration /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
