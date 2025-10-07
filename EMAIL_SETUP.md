# Email Service Setup Guide

This guide explains how to configure the email service for sending invoices and notifications.

## Environment Variables

Add the following variables to your `.env` file:

### For Gmail (Recommended for Development)

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### For Custom SMTP (Recommended for Production)

```env
# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@yourdomain.com
SMTP_PASSWORD=your_smtp_password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

## Production Email Services

For production, consider using these services:

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASSWORD=your_mailgun_password
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_access_key
SMTP_PASSWORD=your_aws_secret_key
```

## Email Templates

The system includes the following email templates:

1. **Invoice Email** - Sent after successful payment
2. **Order Confirmation** - Sent when order is created
3. **Order Update** - Sent for status updates
4. **Custom Email** - For admin communications

## API Endpoints

### Send Invoice Email
```
POST /api/email/invoice/:orderId
Authorization: Bearer <admin_token>
```

### Send Order Confirmation
```
POST /api/email/confirmation/:orderId
Authorization: Bearer <admin_token>
```

### Send Order Update
```
POST /api/email/update/:orderId
Authorization: Bearer <admin_token>
Body: { "updateMessage": "Your order has been shipped!" }
```

### Send Custom Email
```
POST /api/email/custom
Authorization: Bearer <admin_token>
Body: {
  "to": "customer@example.com",
  "subject": "Custom Subject",
  "message": "Custom message content"
}
```

### Test Email Service
```
POST /api/email/test
Authorization: Bearer <admin_token>
Body: { "email": "test@example.com" } // optional
```

### Check Email Status
```
GET /api/email/status
Authorization: Bearer <admin_token>
```

## Automatic Email Sending

The system automatically sends invoice emails when:
- Payment is successfully verified via API
- Payment webhook is received from Razorpay
- Order status is updated to "Paid"

## Email Content

### Invoice Email Includes:
- Order details and items
- Customer information
- Shipping address
- Payment information
- Transaction ID
- Professional HTML formatting

### Order Confirmation Includes:
- Order summary
- Customer information
- Next steps information
- Contact details

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check email credentials
   - Ensure 2FA is enabled for Gmail
   - Use app password, not regular password

2. **Connection Timeout**
   - Check SMTP host and port
   - Verify firewall settings
   - Try different SMTP port (465 for SSL)

3. **Emails Not Sending**
   - Check email service status endpoint
   - Verify environment variables
   - Check server logs for errors

### Testing:

Use the test endpoint to verify email configuration:
```bash
curl -X POST http://localhost:5001/api/email/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive data
- Consider using email service APIs instead of SMTP for better security
- Implement rate limiting for email endpoints
- Log email sending activities for monitoring

## Performance Considerations

- Email sending is done asynchronously to avoid blocking payment flow
- Failed email sending doesn't affect order processing
- Consider implementing email queue for high volume
- Monitor email delivery rates and bounce handling
