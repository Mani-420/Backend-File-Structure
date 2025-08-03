const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_crud_api',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

module.exports = { connectDB };
