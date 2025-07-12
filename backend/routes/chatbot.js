const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');

// GET /api/chatbot/prompts
router.get('/prompts', (req, res) => {
  try {
    console.log('Fetching prompts from service');
    const prompts = chatbotService.getPredefinedPrompts();
    console.log('Prompts fetched:', prompts);
    res.json({
      success: true,
      data: prompts
    });
  } catch (error) {
    console.error('Error in /prompts route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompts'
    });
  }
});

// POST /api/chatbot/chat
router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const response = await chatbotService.generateResponse(prompt);
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in /chat route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response'
    });
  }
});

module.exports = router; 