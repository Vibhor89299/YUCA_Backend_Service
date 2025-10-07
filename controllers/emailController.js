import EmailService from '../config/email.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Guest from '../models/Guest.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

const emailService = new EmailService();

// Send invoice email after successful payment
export const sendInvoiceEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order with populated data
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('guest', 'name email phone')
      .populate('paymentId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find payment record
    const payment = await Payment.findById(order.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Prepare customer info based on order type
    let customerInfo;
    if (order.orderType === 'registered' && order.user) {
      customerInfo = {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || null
      };
    } else if (order.orderType === 'guest' && order.guestInfo) {
      customerInfo = {
        name: order.guestInfo.name,
        email: order.guestInfo.email,
        phone: order.guestInfo.phone
      };
    } else {
      return res.status(400).json({ message: 'Customer information not found' });
    }

    // Prepare order and payment data
    const orderData = { order, customerInfo };
    const paymentData = { payment };

    // Send invoice email
    const result = await emailService.sendInvoice(orderData, paymentData);

    if (result.success) {
      res.status(200).json({
        message: 'Invoice email sent successfully',
        messageId: result.messageId,
        orderId: order._id,
        customerEmail: customerInfo.email
      });
    } else {
      res.status(500).json({
        message: 'Failed to send invoice email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({
      message: 'Error sending invoice email',
      error: error.message
    });
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order with populated data
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('guest', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prepare customer info based on order type
    let customerInfo;
    if (order.orderType === 'registered' && order.user) {
      customerInfo = {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || null
      };
    } else if (order.orderType === 'guest' && order.guestInfo) {
      customerInfo = {
        name: order.guestInfo.name,
        email: order.guestInfo.email,
        phone: order.guestInfo.phone
      };
    } else {
      return res.status(400).json({ message: 'Customer information not found' });
    }

    // Prepare order data
    const orderData = { order, customerInfo };

    // Send order confirmation email
    const result = await emailService.sendOrderConfirmation(orderData);

    if (result.success) {
      res.status(200).json({
        message: 'Order confirmation email sent successfully',
        messageId: result.messageId,
        orderId: order._id,
        customerEmail: customerInfo.email
      });
    } else {
      res.status(500).json({
        message: 'Failed to send order confirmation email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    res.status(500).json({
      message: 'Error sending order confirmation email',
      error: error.message
    });
  }
};

// Send order update email
export const sendOrderUpdateEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderId } = req.params;
    const { updateMessage } = req.body;
    
    if (!updateMessage) {
      return res.status(400).json({ message: 'Update message is required' });
    }
    
    // Find order with populated data
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('guest', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prepare customer info based on order type
    let customerInfo;
    if (order.orderType === 'registered' && order.user) {
      customerInfo = {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || null
      };
    } else if (order.orderType === 'guest' && order.guestInfo) {
      customerInfo = {
        name: order.guestInfo.name,
        email: order.guestInfo.email,
        phone: order.guestInfo.phone
      };
    } else {
      return res.status(400).json({ message: 'Customer information not found' });
    }

    // Prepare order data
    const orderData = { order, customerInfo };

    // Send order update email
    const result = await emailService.sendOrderUpdate(orderData, updateMessage);

    if (result.success) {
      res.status(200).json({
        message: 'Order update email sent successfully',
        messageId: result.messageId,
        orderId: order._id,
        customerEmail: customerInfo.email
      });
    } else {
      res.status(500).json({
        message: 'Failed to send order update email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error sending order update email:', error);
    res.status(500).json({
      message: 'Error sending order update email',
      error: error.message
    });
  }
};

// Send custom email (admin only)
export const sendCustomEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        message: 'To, subject, and message are required' 
      });
    }

    // Create HTML template for custom email
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2c5530;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2c5530;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌿 Yuca Lifestyle</div>
          </div>
          
          <div class="content">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Yuca Lifestyle! 🌿</p>
            <p>For support, contact us at: <a href="mailto:support@yucalifestyle.com" style="color: #2c5530;">support@yucalifestyle.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send custom email
    const result = await emailService.sendEmail(to, subject, html, message);

    if (result.success) {
      res.status(200).json({
        message: 'Custom email sent successfully',
        messageId: result.messageId,
        recipient: to
      });
    } else {
      res.status(500).json({
        message: 'Failed to send custom email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({
      message: 'Error sending custom email',
      error: error.message
    });
  }
};

// Test email functionality
export const testEmail = async (req, res) => {
  try {
    const testEmail = req.body.email || process.env.EMAIL_USER;
    
    const result = await emailService.sendEmail(
      testEmail,
      'Test Email - Yuca Lifestyle',
      `
        <h2>Test Email</h2>
        <p>This is a test email from Yuca Lifestyle email service.</p>
        <p>If you received this email, the email service is working correctly!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
      'This is a test email from Yuca Lifestyle email service. If you received this email, the email service is working correctly!'
    );

    if (result.success) {
      res.status(200).json({
        message: 'Test email sent successfully',
        messageId: result.messageId,
        recipient: testEmail
      });
    } else {
      res.status(500).json({
        message: 'Failed to send test email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      message: 'Error sending test email',
      error: error.message
    });
  }
};

// Get email service status
export const getEmailStatus = async (req, res) => {
  try {
    // Test email configuration
    const transporter = emailService.transporter;
    await transporter.verify();
    
    res.status(200).json({
      message: 'Email service is configured and ready',
      status: 'active',
      service: process.env.EMAIL_SERVICE || 'gmail',
      from: process.env.EMAIL_USER
    });

  } catch (error) {
    console.error('Email service verification failed:', error);
    res.status(500).json({
      message: 'Email service is not properly configured',
      status: 'inactive',
      error: error.message
    });
  }
};
