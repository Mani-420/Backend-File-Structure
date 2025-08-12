import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './DB/connectDB.js';

import {
  globalErrorHandler,
  notFoundHandler
} from './middlewares/globalErrorHandler.js';

import { emailService } from './app/services/emailService.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Initialize email service (non-blocking)
emailService.initialize().catch((err) => {
  console.error('Email service initialization failed:', err.message);
});

// Importing routes
import taskRoutes from './routes/taskRoute.js';
import userRoutes from './routes/userRoute.js';

// Mounting routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
