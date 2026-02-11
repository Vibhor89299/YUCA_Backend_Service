import nodemailer from 'nodemailer';

// Create transporter for email sending
export const createTransporter = () => {
  // For development, you can use Gmail or other SMTP services
  // For production, consider using services like SendGrid, Mailgun, or AWS SES
  
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    },
    // Alternative SMTP configuration (uncomment if not using Gmail)
    /*
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
    */
  });

  return transporter;
};

// Email templates
export const emailTemplates = {
  invoice: (orderData, paymentData) => {
    const { order, customerInfo } = orderData;
    const { payment } = paymentData;

    return {
      subject: `Invoice for Order #${order.orderNumber} - Yuca Lifestyle`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice - Order #${order.orderNumber}</title>
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
            .tagline {
              color: #666;
              font-style: italic;
            }
            .invoice-title {
              font-size: 24px;
              color: #2c5530;
              margin-bottom: 20px;
              text-align: center;
            }
            .order-info {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table th,
            .items-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .items-table th {
              background-color: #2c5530;
              color: white;
              font-weight: bold;
            }
            .items-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .total-section {
              background-color: #2c5530;
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .total-label {
              font-weight: bold;
            }
            .total-amount {
              font-size: 20px;
              font-weight: bold;
            }
            .payment-info {
              background-color: #e8f5e8;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .contact-info {
              margin-top: 15px;
            }
            .contact-info a {
              color: #2c5530;
              text-decoration: none;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-paid {
              background-color: #d4edda;
              color: #155724;
            }
            .status-shipped {
              background-color: #cce5ff;
              color: #004085;
            }
            .status-delivered {
              background-color: #d1ecf1;
              color: #0c5460;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Yuca Lifestyle</div>
              <div class="tagline">Sustainable Living, Natural Beauty</div>
            </div>

            <h1 class="invoice-title">Invoice</h1>

            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Invoice Number:</span>
                <span class="info-value">#${order.orderNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Date:</span>
                <span class="info-value">${new Date(payment.updatedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Status:</span>
                <span class="info-value">
                  <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${payment.paymentMethod || 'Online Payment'}</span>
              </div>
            </div>

            <div class="order-info">
              <h3 style="margin-top: 0; color: #2c5530;">Customer Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${customerInfo.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${customerInfo.email}</span>
              </div>
              ${customerInfo.phone ? `
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${customerInfo.phone}</span>
              </div>
              ` : ''}
            </div>

            <div class="order-info">
              <h3 style="margin-top: 0; color: #2c5530;">Shipping Address</h3>
              <div style="line-height: 1.8;">
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.name}</strong>
                    </td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toLocaleString('en-IN')}</td>
                    <td>₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Shipping:</span>
                <span>₹0</span>
              </div>
              <div class="total-row">
                <span class="total-label">Tax:</span>
                <span>₹0</span>
              </div>
              <div class="total-row" style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; margin-top: 10px;">
                <span class="total-amount">Total Paid:</span>
                <span class="total-amount">₹${order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="payment-info">
              <h4 style="margin-top: 0; color: #2c5530;">Payment Information</h4>
              <p><strong>Transaction ID:</strong> ${payment.razorpayPaymentId || 'N/A'}</p>
              <p><strong>Payment Status:</strong> <span class="status-badge status-paid">Paid</span></p>
              <p><strong>Amount Paid:</strong> ₹${payment.amount.toLocaleString('en-IN')}</p>
            </div>

            <div class="footer">
              <p>Thank you for choosing Yuca Lifestyle! 🌿</p>
              <p>Your order is being processed and will be shipped soon.</p>

              <div class="contact-info">
                <p><strong>Need Help?</strong></p>
                <p>Email: <a href="mailto:support@yucalifestyle.com">support@yucalifestyle.com</a></p>
                <p>Phone: <a href="tel:+91-XXXXXXXXXX">+91-XXXXXXXXXX</a></p>
                <p>Website: <a href="https://yucalifestyle.com">yucalifestyle.com</a></p>
              </div>

              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated invoice. Please keep this email for your records.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Invoice for Order #${order.orderNumber} - Yuca Lifestyle

        Order Details:
        - Order Number: ${order.orderNumber}
        - Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
        - Payment Date: ${new Date(payment.updatedAt).toLocaleDateString('en-IN')}
        - Status: ${order.status}

        Customer Information:
        - Name: ${customerInfo.name}
        - Email: ${customerInfo.email}
        ${customerInfo.phone ? `- Phone: ${customerInfo.phone}` : ''}

        Shipping Address:
        ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}
        ${order.shippingAddress.address}
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}

        Items Ordered:
        ${order.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price.toLocaleString('en-IN')} each`).join('\n')}

        Total Amount: ₹${order.totalPrice.toLocaleString('en-IN')}

        Payment Information:
        - Transaction ID: ${payment.razorpayPaymentId || 'N/A'}
        - Payment Method: ${payment.paymentMethod || 'Online Payment'}
        - Status: Paid

        Thank you for choosing Yuca Lifestyle!

        For support, contact us at:
        Email: support@yucalifestyle.com
        Phone: +91-XXXXXXXXXX
        Website: yucalifestyle.com
      `
    };
  },

  retailInvoice: (orderData, paymentData) => {
    const { order, customerInfo } = orderData;
    const { payment } = paymentData;

    return {
      subject: `Retail Sale Receipt #${order.orderNumber} - Yuca Lifestyle`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Retail Sale Receipt - Order #${order.orderNumber}</title>
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
            .tagline {
              color: #666;
              font-style: italic;
            }
            .receipt-title {
              font-size: 24px;
              color: #2c5530;
              margin-bottom: 20px;
              text-align: center;
            }
            .sale-info {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table th,
            .items-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .items-table th {
              background-color: #2c5530;
              color: white;
              font-weight: bold;
            }
            .items-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .total-section {
              background-color: #2c5530;
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .total-label {
              font-weight: bold;
            }
            .total-amount {
              font-size: 20px;
              font-weight: bold;
            }
            .payment-info {
              background-color: #e8f5e8;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .contact-info {
              margin-top: 15px;
            }
            .contact-info a {
              color: #2c5530;
              text-decoration: none;
            }
            .retail-badge {
              background-color: #fff3cd;
              color: #856404;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              display: inline-block;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Yuca Lifestyle</div>
              <div class="tagline">Sustainable Living, Natural Beauty</div>
            </div>

            <div class="retail-badge">Retail Sale Receipt</div>

            <h1 class="receipt-title">Sale Receipt</h1>

            <div class="sale-info">
              <div class="info-row">
                <span class="info-label">Receipt Number:</span>
                <span class="info-value">#${order.orderNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Sale Date:</span>
                <span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${payment.paymentMethod || 'Cash'}</span>
              </div>
            </div>

            <div class="sale-info">
              <h3 style="margin-top: 0; color: #2c5530;">Customer Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${customerInfo.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${customerInfo.email}</span>
              </div>
              ${customerInfo.phone ? `
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${customerInfo.phone}</span>
              </div>
              ` : ''}
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.name}</strong>
                    </td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toLocaleString('en-IN')}</td>
                    <td>₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row">
                <span class="total-label">GST (Included):</span>
                <span>₹0 (Already included in prices)</span>
              </div>
              <div class="total-row" style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; margin-top: 10px;">
                <span class="total-amount">Total Paid:</span>
                <span class="total-amount">₹${order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="payment-info">
              <h4 style="margin-top: 0; color: #2c5530;">Payment Information</h4>
              <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Paid</span></p>
              <p><strong>Payment Method:</strong> ${payment.paymentMethod || 'Cash'}</p>
              <p><strong>Amount Paid:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">
                *All prices include GST (Goods and Services Tax)
              </p>
            </div>

            <div class="footer">
              <p>Thank you for shopping at Yuca Lifestyle! 🌿</p>
              <p>We appreciate your support for sustainable products.</p>

              <div class="contact-info">
                <p><strong>Visit Us Again!</strong></p>
                <p>Email: <a href="mailto:enquire@yucalifestyle.com">enquire@yucalifestyle.com</a></p>
                <p>Website: <a href="https://yucalifestyle.com">yucalifestyle.com</a></p>
              </div>

              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is your retail sale receipt. Please keep this email for your records.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Retail Sale Receipt #${order.orderNumber} - Yuca Lifestyle

        Sale Details:
        - Receipt Number: ${order.orderNumber}
        - Sale Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
        - Payment Method: ${payment.paymentMethod || 'Cash'}

        Customer Information:
        - Name: ${customerInfo.name}
        - Email: ${customerInfo.email}
        ${customerInfo.phone ? `- Phone: ${customerInfo.phone}` : ''}

        Items Purchased:
        ${order.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price.toLocaleString('en-IN')} each`).join('\n')}

        Subtotal: ₹${order.totalPrice.toLocaleString('en-IN')}
        GST (Included): ₹0 (Already included in prices)
        Total Paid: ₹${order.totalPrice.toLocaleString('en-IN')}

        Payment Information:
        - Payment Status: Paid
        - Payment Method: ${payment.paymentMethod || 'Cash'}
        - Amount Paid: ₹${order.totalPrice.toLocaleString('en-IN')}
        *All prices include GST (Goods and Services Tax)

        Thank you for shopping at Yuca Lifestyle!
        We appreciate your support for sustainable products.

        For support, contact us at:
        Email: enquire@yucalifestyle.com
        Website: yucalifestyle.com
      `
    };
  },

  // Welcome email for newsletter/coming soon subscribers
  welcomeSubscription: (email, source = 'coming_soon') => {
    const sourceMessages = {
      coming_soon: "You've joined our exclusive early access list!",
      homepage: "You've subscribed to our newsletter!",
      footer: "You've subscribed to our newsletter!",
      checkout: "You've opted in for updates!",
      popup: "You've subscribed to our newsletter!"
    };

    const sourceMessage = sourceMessages[source] || "You've subscribed to our updates!";

    return {
      subject: "Welcome to YUCA Lifestyle! 🌿",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to YUCA Lifestyle</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              line-height: 1.8;
              color: #2D2D23;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #F2E0CF;
            }
            .container {
              background-color: #FFFDF9;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(45, 45, 35, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 30px;
              margin-bottom: 30px;
              border-bottom: 2px solid #B48954;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #854628;
              letter-spacing: 3px;
              margin-bottom: 10px;
            }
            .tagline {
              color: #7C7458;
              font-style: italic;
              font-size: 14px;
            }
            .welcome-title {
              font-size: 28px;
              color: #854628;
              text-align: center;
              margin-bottom: 20px;
            }
            .welcome-message {
              background: linear-gradient(135deg, #F2E0CF 0%, #D4C7B4 100%);
              padding: 25px;
              border-radius: 10px;
              margin: 25px 0;
              text-align: center;
            }
            .welcome-message p {
              margin: 0;
              font-size: 16px;
              color: #2D2D23;
            }
            .features {
              margin: 30px 0;
            }
            .feature-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 15px;
              padding: 15px;
              background-color: #FAF7F2;
              border-radius: 8px;
              border-left: 3px solid #B48954;
            }
            .feature-icon {
              font-size: 24px;
              margin-right: 15px;
            }
            .feature-text {
              flex: 1;
            }
            .feature-text strong {
              color: #854628;
              display: block;
              margin-bottom: 5px;
            }
            .feature-text span {
              color: #7C7458;
              font-size: 14px;
            }
            .cta-section {
              text-align: center;
              margin: 35px 0;
            }
            .cta-button {
              display: inline-block;
              background-color: #854628;
              color: #F2E0CF !important;
              padding: 15px 35px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              letter-spacing: 1px;
              transition: background-color 0.3s;
            }
            .cta-button:hover {
              background-color: #6B3820;
            }
            .social-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background-color: #FAF7F2;
              border-radius: 8px;
            }
            .social-section h3 {
              color: #854628;
              margin-bottom: 15px;
              font-size: 16px;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #854628;
              text-decoration: none;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 35px;
              padding-top: 25px;
              border-top: 1px solid #D4C7B4;
              color: #7C7458;
              font-size: 13px;
            }
            .unsubscribe {
              margin-top: 15px;
              font-size: 12px;
            }
            .unsubscribe a {
              color: #7C7458;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">YUCA</div>
              <div class="tagline">Handcrafted with Care, Just for You</div>
            </div>

            <h1 class="welcome-title">Welcome to the YUCA Family!</h1>

            <div class="welcome-message">
              <p>${sourceMessage}</p>
              <p style="margin-top: 15px; font-size: 14px; color: #7C7458;">
                We're thrilled to have you join us on this journey of sustainable, handcrafted living.
              </p>
            </div>

            <div class="features">
              <div class="feature-item">
                <span class="feature-icon">🌿</span>
                <div class="feature-text">
                  <strong>Early Access</strong>
                  <span>Be the first to know about new collections and exclusive launches</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">✨</span>
                <div class="feature-text">
                  <strong>Special Offers</strong>
                  <span>Subscriber-only discounts and early bird pricing</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎁</span>
                <div class="feature-text">
                  <strong>Behind the Scenes</strong>
                  <span>Stories of our artisans and the craft behind each piece</span>
                </div>
              </div>
            </div>

            <div class="cta-section">
              <a href="https://yucalifestyle.com" class="cta-button">EXPLORE YUCA</a>
            </div>

            <div class="social-section">
              <h3>Follow Our Journey</h3>
              <div class="social-links">
                <a href="https://instagram.com/yucalifestyle">Instagram</a>
                <a href="https://facebook.com/yucalifestyle">Facebook</a>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for believing in handcrafted, sustainable living.</p>
              <p style="margin-top: 10px;"><strong>With warmth,</strong><br>The YUCA Team</p>

              <div class="unsubscribe">
                <p>You received this email because you subscribed at yucalifestyle.com</p>
                <p><a href="https://yucalifestyle.com/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to YUCA Lifestyle! 🌿

        ${sourceMessage}

        We're thrilled to have you join us on this journey of sustainable, handcrafted living.

        What you can look forward to:

        🌿 Early Access
        Be the first to know about new collections and exclusive launches

        ✨ Special Offers
        Subscriber-only discounts and early bird pricing

        🎁 Behind the Scenes
        Stories of our artisans and the craft behind each piece

        Visit us: https://yucalifestyle.com

        Follow Our Journey:
        - Instagram: https://instagram.com/yucalifestyle
        - Facebook: https://facebook.com/yucalifestyle

        Thank you for believing in handcrafted, sustainable living.

        With warmth,
        The YUCA Team

        ---
        You received this email because you subscribed at yucalifestyle.com
        To unsubscribe, visit: https://yucalifestyle.com/unsubscribe?email=${encodeURIComponent(email)}
      `
    };
  },

  orderConfirmation: (orderData) => {
    const { order, customerInfo } = orderData;
    
    return {
      subject: `Order Confirmation #${order.orderNumber} - Yuca Lifestyle`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - Order #${order.orderNumber}</title>
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
            .tagline {
              color: #666;
              font-style: italic;
            }
            .confirmation-title {
              font-size: 24px;
              color: #2c5530;
              margin-bottom: 20px;
              text-align: center;
            }
            .order-info {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .items-list {
              margin-bottom: 30px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .item:last-child {
              border-bottom: none;
            }
            .total-section {
              background-color: #2c5530;
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .next-steps {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .next-steps h3 {
              margin-top: 0;
              color: #2c5530;
            }
            .next-steps ul {
              margin: 0;
              padding-left: 20px;
            }
            .next-steps li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌿 Yuca Lifestyle</div>
              <div class="tagline">Sustainable Living, Natural Beauty</div>
            </div>
            
            <h1 class="confirmation-title">Order Confirmation</h1>
            
            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span class="info-value">#${order.orderNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${order.status}</span>
              </div>
            </div>

            <div class="order-info">
              <h3 style="margin-top: 0; color: #2c5530;">Customer Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${customerInfo.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${customerInfo.email}</span>
              </div>
            </div>

            <div class="order-info">
              <h3 style="margin-top: 0; color: #2c5530;">Items Ordered</h3>
              <div class="items-list">
                ${order.items.map(item => `
                  <div class="item">
                    <span><strong>${item.name}</strong> (Qty: ${item.quantity})</span>
                    <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="total-section">
              <div>Total Amount</div>
              <div class="total-amount">₹${order.totalPrice.toLocaleString('en-IN')}</div>
            </div>

            <div class="next-steps">
              <h3>What's Next?</h3>
              <ul>
                <li>We'll process your order within 1-2 business days</li>
                <li>You'll receive a payment confirmation email once payment is processed</li>
                <li>We'll send you tracking information once your order ships</li>
                <li>Your order will be delivered within 3-7 business days</li>
              </ul>
            </div>

            <div class="footer">
              <p>Thank you for choosing Yuca Lifestyle! 🌿</p>
              <p>We're excited to bring you sustainable, natural products.</p>
              
              <div style="margin-top: 20px;">
                <p><strong>Need Help?</strong></p>
                <p>Email: <a href="mailto:support@yucalifestyle.com" style="color: #2c5530;">support@yucalifestyle.com</a></p>
                <p>Phone: <a href="tel:+91-XXXXXXXXXX" style="color: #2c5530;">+91-XXXXXXXXXX</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Confirmation #${order.orderNumber} - Yuca Lifestyle
        
        Thank you for your order!
        
        Order Details:
        - Order Number: ${order.orderNumber}
        - Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
        - Status: ${order.status}
        
        Customer Information:
        - Name: ${customerInfo.name}
        - Email: ${customerInfo.email}
        
        Items Ordered:
        ${order.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`).join('\n')}
        
        Total Amount: ₹${order.totalPrice.toLocaleString('en-IN')}
        
        What's Next?
        - We'll process your order within 1-2 business days
        - You'll receive a payment confirmation email once payment is processed
        - We'll send you tracking information once your order ships
        - Your order will be delivered within 3-7 business days
        
        Thank you for choosing Yuca Lifestyle!
        
        For support, contact us at:
        Email: support@yucalifestyle.com
        Phone: +91-XXXXXXXXXX
      `
    };
  }
};

// Email service class
export class EmailService {
  constructor() {
    this.transporter = createTransporter();
  }

  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: {
          name: 'Yuca Lifestyle',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: subject,
        html: html,
        text: text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendRetailInvoice(orderData, paymentData) {
    const template = emailTemplates.retailInvoice(orderData, paymentData);
    return await this.sendEmail(
      orderData.customerInfo.email,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendInvoice(orderData, paymentData) {
    const template = emailTemplates.invoice(orderData, paymentData);
    return await this.sendEmail(
      orderData.customerInfo.email,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendOrderConfirmation(orderData) {
    const template = emailTemplates.orderConfirmation(orderData);
    return await this.sendEmail(
      orderData.customerInfo.email,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendWelcomeEmail(email, source = 'coming_soon') {
    const template = emailTemplates.welcomeSubscription(email, source);
    return await this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendOrderUpdate(orderData, updateMessage) {
    const { order, customerInfo } = orderData;
    
    const template = {
      subject: `Order Update #${order.orderNumber} - Yuca Lifestyle`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Update - Order #${order.orderNumber}</title>
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
            .update-message {
              background-color: #e8f5e8;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #2c5530;
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
            
            <h1 style="color: #2c5530; text-align: center;">Order Update</h1>
            
            <p>Hello ${customerInfo.name},</p>
            
            <div class="update-message">
              <h3 style="margin-top: 0; color: #2c5530;">Update for Order #${order.orderNumber}</h3>
              <p>${updateMessage}</p>
            </div>
            
            <p>Thank you for choosing Yuca Lifestyle!</p>
            
            <div class="footer">
              <p>For any questions, contact us at:</p>
              <p>Email: <a href="mailto:support@yucalifestyle.com" style="color: #2c5530;">support@yucalifestyle.com</a></p>
              <p>Phone: <a href="tel:+91-XXXXXXXXXX" style="color: #2c5530;">+91-XXXXXXXXXX</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Update #${order.orderNumber} - Yuca Lifestyle
        
        Hello ${customerInfo.name},
        
        Update for Order #${order.orderNumber}:
        ${updateMessage}
        
        Thank you for choosing Yuca Lifestyle!
        
        For any questions, contact us at:
        Email: support@yucalifestyle.com
        Phone: +91-XXXXXXXXXX
      `
    };

    return await this.sendEmail(
      customerInfo.email,
      template.subject,
      template.html,
      template.text
    );
  }
}

export default EmailService;
