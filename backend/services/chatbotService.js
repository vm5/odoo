const predefinedPrompts = [
  {
    title: "What is StackIt?",
    prompt: "Tell me about StackIt and what makes it unique",
    response: "StackIt is a modern Q&A platform designed for developers. What makes it unique:\n\n" +
      "• Real-time collaboration and instant notifications\n" +
      "• Gamification with points, badges, and levels\n" +
      "• Smart code formatting and syntax highlighting\n" +
      "• Topic-based Hubs for focused discussions\n" +
      "• Built-in AI assistance for better answers"
  },
  {
    title: "How to Ask",
    prompt: "What's the best way to ask a question on StackIt?",
    response: "Tips for asking great questions on StackIt:\n\n" +
      "1. Be specific in your title\n" +
      "2. Include relevant code snippets\n" +
      "3. Explain what you've tried\n" +
      "4. Format your code properly\n" +
      "5. Tag with relevant topics\n" +
      "6. Respond to clarifying questions"
  },
  {
    title: "Quick Help",
    prompt: "How do I use StackIt's main features?",
    response: "Here are StackIt's main features:\n\n" +
      "📝 Asking Questions: Click 'Ask' button\n" +
      "💬 Answering: Use the rich text editor\n" +
      "🏷️ Tags: Add relevant topics\n" +
      "⬆️ Voting: Help rank best answers\n" +
      "🔔 Notifications: Stay updated\n" +
      "👥 Mentions: Use @ to tag users"
  },
  {
    title: "Reputation Guide",
    prompt: "How do I earn reputation on StackIt?",
    response: "Ways to earn reputation on StackIt:\n\n" +
      "⭐ Answer gets upvoted: +10 points\n" +
      "👍 Question gets upvoted: +5 points\n" +
      "✅ Answer gets accepted: +15 points\n" +
      "🎯 Your answer is precise: +2 points\n" +
      "🤝 Helping others: +2 points\n\n" +
      "Higher reputation unlocks new privileges!"
  },
  {
    title: "Badges & Rewards",
    prompt: "Tell me about StackIt's badges and rewards system",
    response: "StackIt's Badges & Rewards:\n\n" +
      "🥉 Bronze: Beginner achievements\n" +
      "🥈 Silver: Regular contributor\n" +
      "🥇 Gold: Expert status\n\n" +
      "Special Badges:\n" +
      "🌟 First Answer\n" +
      "🎯 Solution Master\n" +
      "🔥 Hot Streak\n" +
      "💡 Knowledge Sharer"
  }
];

class ChatbotService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.isInitialized) {
      try {
        console.log('Initializing Mistral 7B model...');
        this.model = await pipeline('text-generation', 'mistralai/Mistral-7B-v0.1');
        this.isInitialized = true;
        console.log('Model initialized successfully');
      } catch (error) {
        console.error('Error initializing model:', error);
        throw error;
      }
    }
  }

  getPredefinedPrompts() {
    return predefinedPrompts.map(({ title, prompt }) => ({ title, prompt }));
  }

  async generateResponse(prompt) {
    // Find the matching predefined prompt and return its response
    const matchingPrompt = predefinedPrompts.find(p => p.prompt === prompt);
    if (matchingPrompt) {
      return matchingPrompt.response;
    }
    return "I'm not sure about that. Please try one of the predefined topics!";
  }
}

module.exports = new ChatbotService(); 