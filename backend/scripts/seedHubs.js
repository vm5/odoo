const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit';

const web3Posts = [
  {
    type: 'meme',
    content: '🤔 When your smart contract has more bugs than features',
    hub: 'web3',
    reactions: {
      '🔥': 5,
      '😂': 3,
      '🧠': 2,
      '💯': 4
    }
  },
  {
    type: 'poll',
    title: 'Favorite Web3 Development Framework?',
    content: 'What\'s your go-to Web3 development framework?',
    hub: 'web3',
    pollOptions: [
      { text: 'Hardhat', votes: 12 },
      { text: 'Truffle', votes: 8 },
      { text: 'Foundry', votes: 15 },
      { text: 'Brownie', votes: 5 }
    ]
  },
  {
    type: 'meme',
    content: '💸 Gas fees be like: "I\'m gonna make your wallet cry"',
    hub: 'web3',
    reactions: {
      '🔥': 7,
      '😂': 10,
      '🧠': 3,
      '💯': 6
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: 'admin@stackit.dev' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@stackit.dev',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Delete existing web3 posts
    await Post.deleteMany({ hub: 'web3' });
    console.log('Cleared existing web3 posts');

    // Create new posts
    const createdPosts = await Promise.all(
      web3Posts.map(post => Post.create({
        ...post,
        author: adminUser._id
      }))
    );
    console.log('Created new posts:', createdPosts);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 