const chatbotService = require('../services/chatbotService');

// @desc    Get predefined prompts
// @route   GET /api/chatbot/prompts
// @access  Public
exports.getPrompts = async (req, res) => {
  try {
    const prompts = chatbotService.getPredefinedPrompts();
    res.status(200).json({
      success: true,
      data: prompts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error fetching prompts'
    });
  }
};

// @desc    Generate chatbot response
// @route   POST /api/chatbot/chat
// @access  Public
exports.generateResponse = async (req, res) => {
  try {
    const { prompt, maxLength } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a prompt'
      });
    }

    const response = await chatbotService.generateResponse(prompt, maxLength);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({
      success: false,
      error: 'Error generating response'
    });
  }
}; 