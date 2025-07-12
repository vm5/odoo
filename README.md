# StackIt Q&A Platform

A modern Q&A platform built with React and Node.js, featuring real-time interactions and gamification elements.

## Features

- User Authentication and Authorization
- Real-time Question and Answer System
- XP and Level Progression System
- Achievement Badges
- Daily Streaks
- Rich Text Editor
- Real-time Notifications
- Admin Dashboard
- User Profile Management

## Tech Stack

### Frontend
- React
- Material-UI
- Socket.IO Client
- React Router
- Context API for State Management

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd odoo-app
```

2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Environment Setup
```bash
# Create .env file in root directory
cp .env.example .env

# Create .env file in backend directory
cd backend
cp .env.example .env
```

4. Start the Development Servers
```bash
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend server
cd ..
npm start
```

## Project Structure

```
odoo-app/
  backend/
    - controllers/     # Request handlers
    - middleware/      # Custom middleware
    - models/          # Database models
    - routes/          # API routes
    - services/        # Business logic
    - server.js        # Server entry point
  src/
    - components/      # React components
    - contexts/        # Context providers
    - pages/           # Page components
    - services/        # API services
    - utils/           # Utility functions
```

## API Documentation

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Questions
- GET /api/posts - Get all questions
- POST /api/posts - Create new question
- GET /api/posts/:id - Get question by ID
- PUT /api/posts/:id - Update question
- DELETE /api/posts/:id - Delete question

### Answers
- POST /api/posts/:id/answers - Add answer
- PUT /api/posts/:id/answers/:answerId - Update answer
- DELETE /api/posts/:id/answers/:answerId - Delete answer

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
