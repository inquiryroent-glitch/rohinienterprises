# Email Integration Setup Guide

## Overview
This website uses EmailJS to send contact form submissions via email. Follow these steps to configure email functionality.

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

## Step 2: Create Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended)
4. Follow the setup instructions
5. Copy your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template
1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use this template structure:

**Template Name:** Contact Form Inquiry

**Subject:** New Contact Form Inquiry - Rohini Enterprises

**Content:**
```
New contact form submission:

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Message:
{{message}}

---
This email was sent from the Rohini Enterprises website contact form.
```

4. Save the template and copy your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Public Key
1. Go to **Account** → **General** in EmailJS dashboard
2. Copy your **Public Key** (e.g., `abcdefghijklmnop`)

## Step 5: Update Configuration
1. Open `js/email-config.js`
2. Replace the placeholder values:
   - `YOUR_SERVICE_ID` → Your Service ID from Step 2
   - `YOUR_TEMPLATE_ID` → Your Template ID from Step 3
   - `YOUR_PUBLIC_KEY` → Your Public Key from Step 4

Example:
```javascript
const EMAIL_CONFIG = {
  serviceID: 'service_abc123',
  templateID: 'template_xyz789',
  publicKey: 'abcdefghijklmnop',
  recipientEmail: 'inquiry.roent@gmail.com',
  subject: 'New Contact Form Inquiry - Rohini Enterprises'
};
```

## Step 6: Test the Form
1. Open `contact.html` in your browser
2. Fill out the contact form
3. Submit the form
4. Check your email inbox (inquiry.roent@gmail.com) for the submission

## Troubleshooting

### Form shows "Email service may need configuration"
- Check that all three values (Service ID, Template ID, Public Key) are updated in `email-config.js`
- Ensure EmailJS script is loaded (check browser console for errors)
- Verify your EmailJS account is active

### Emails not being received
- Check spam/junk folder
- Verify EmailJS service is connected to your email provider
- Check EmailJS dashboard for delivery logs
- Ensure template variables match: `{{from_name}}`, `{{from_email}}`, `{{phone}}`, `{{message}}`

### Need Help?
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com

## Alternative: Using Your Own Backend
If you prefer to use your own backend API instead of EmailJS:
1. Update `js/main.js` → `initContactForm()` function
2. Replace EmailJS code with your API endpoint
3. Update the form submission to POST to your API
