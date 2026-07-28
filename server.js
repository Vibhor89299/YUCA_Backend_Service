import './config/env.js';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { verifyCloudinaryConfig } from './config/cloudinary.js';
import { startOrderCleanupJob } from './utils/orderCleanup.js';

// Connect to MongoDB
connectDB();

// Verify Cloudinary configuration
verifyCloudinaryConfig();

// Initialize express
const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS with dynamic origin
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:5173', // Alternative localhost
  'http://localhost:3000', // Common React dev port
  'http://127.0.0.1:3000', // Alternative React dev port
  'https://yucalifestyle.com', // Production domain
  'https://www.yucalifestyle.com', // Production domain with www
  'http://localhost:5174',
  'https://admin.yucalifestyle.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in the static allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow origins containing Cloudflare Pages deployments
    if (origin.includes('yuca-admin.pages.dev') || origin.includes('yuca-frontend.pages.dev')) {
      return callback(null, true);
    }

    // Reject all other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Razorpay webhook needs the RAW body to verify the HMAC signature.
// This MUST be registered before express.json() — otherwise the JSON parser
// consumes the stream first and the signature is computed over a parsed object,
// which never matches and silently rejects every webhook. (YL-002)
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subscribeRoutes);

// Handle 404 - Not Found
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Start periodic cleanup of expired unpaid orders
  startOrderCleanupJob();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown on SIGTERM (e.g. `pm2 reload`) — drain in-flight requests
// before exiting so a zero-downtime deploy doesn't cut active connections. (YL-003)
process.on('SIGTERM', () => {
  console.log('SIGTERM received — closing server gracefully...');
  server.close(() => {
    console.log('Server closed. Exiting.');
    process.exit(0);
  });
});
