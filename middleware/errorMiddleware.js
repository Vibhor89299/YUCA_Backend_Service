import { validationResult } from 'express-validator';

// Not Found Error Handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = [];

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = [{
      field: Object.keys(err.keyValue)[0],
      message: `This ${Object.keys(err.keyValue)[0]} is already in use`
    }];
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized, token failed';
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired, please log in again';
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};
