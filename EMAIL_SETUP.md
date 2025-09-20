# Email Service Setup Guide

## Zoho Email Configuration

To use the email service with Zoho, you need to set up the following environment variables:

### Required Environment Variables

```bash
# Zoho Email Configuration
ZOHO_EMAIL=your-email@zoho.com
ZOHO_APP_PASSWORD=your-app-specific-password

# Test Email (optional, for testing)
TEST_EMAIL=test@example.com
```

### Setting up Zoho App Password

1. Go to [Zoho Mail Settings](https://mail.zoho.com/zm/#settings/accounts)
2. Navigate to **Security** → **App Passwords**
3. Click **Generate New Password**
4. Enter a name for your app (e.g., "ParcelX Backend")
5. Copy the generated password
6. Use this password as `ZOHO_APP_PASSWORD` in your environment variables

### Zoho SMTP Settings

- **Host:** smtp.zoho.com
- **Port:** 587 (TLS) or 465 (SSL)
- **Security:** TLS/SSL
- **Authentication:** Required

## API Endpoints

### 1. Send Custom Email
**POST** `/api/emails/send`

```json
{
  "to": "recipient@example.com",
  "subject": "Your Email Subject",
  "body": "<h1>Hello World!</h1><p>This is the email body.</p>",
  "isHtml": true
}
```

### 2. Send Order Confirmation
**POST** `/api/emails/order-confirmation`

```json
{
  "customerEmail": "customer@example.com",
  "trackingId": "PKG123456789",
  "status": "Confirmed",
  "items": ["Item 1", "Item 2"]
}
```

### 3. Send Status Update
**POST** `/api/emails/status-update`

```json
{
  "customerEmail": "customer@example.com",
  "trackingId": "PKG123456789",
  "status": "In Transit",
  "location": "New York, NY",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Test Email Service
**GET** `/api/emails/test?to=test@example.com`

## Frontend Integration Example

### JavaScript/Fetch
```javascript
// Send custom email
const sendEmail = async (emailData) => {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        isHtml: true
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Email sent successfully:', result.data);
    } else {
      console.error('Email failed:', result.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
sendEmail({
  to: 'customer@example.com',
  subject: 'Welcome to ParcelX!',
  body: '<h1>Welcome!</h1><p>Thank you for choosing ParcelX.</p>'
});
```

### React Example
```jsx
import { useState } from 'react';

const EmailForm = () => {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Email sent successfully!');
        setEmailData({ to: '', subject: '', body: '' });
      } else {
        alert('Failed to send email: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="To"
        value={emailData.to}
        onChange={(e) => setEmailData({...emailData, to: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Subject"
        value={emailData.subject}
        onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
        required
      />
      <textarea
        placeholder="Email Body"
        value={emailData.body}
        onChange={(e) => setEmailData({...emailData, body: e.target.value})}
        required
      />
      <button type="submit">Send Email</button>
    </form>
  );
};
```

## Error Handling

The API returns standardized responses:

### Success Response
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "messageId": "message-id-123",
    "recipient": "recipient@example.com",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Invalid recipient email format",
  "code": "INVALID_EMAIL"
}
```

## Security Notes

1. **Never expose your Zoho credentials** in frontend code
2. **Use environment variables** for all sensitive configuration
3. **Validate email addresses** before sending
4. **Rate limiting** should be implemented for production use
5. **HTTPS only** in production environments

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your Zoho app password
2. **Connection Timeout**: Verify SMTP settings and network connectivity
3. **Invalid Email**: Ensure email format is correct
4. **Rate Limiting**: Zoho may limit emails per hour/day

### Testing

Use the test endpoint to verify your configuration:
```
GET /api/emails/test?to=your-test-email@example.com
```
