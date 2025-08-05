import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './DB/connectDB.js';

import {
  globalErrorHandler,
  notFoundHandler
} from './middlewares/globalErrorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '16kb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // Parse URL-encoded bodies
app.use(express.static('public'));
app.use(cookieParser());

// Importing routes
import taskRoutes from './routes/taskRoute.js';
import userRoutes from './routes/userRoute.js';

// Mounting routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
