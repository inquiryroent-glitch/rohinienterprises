// Web3Forms Configuration
// Get your API key from https://web3forms.com/
// It's free and requires only an email address to get started

const WEB3FORMS_CONFIG = {
  // Web3Forms Access Key (API Key)
  // Get it from: https://web3forms.com/ (sign up with your email)
  accessKey: '3ec562cb-915d-4fcd-a37e-cfec23aac3dc',
  
  // Recipient Email (where form submissions will be sent)
  recipientEmail: 'inquiry.roent@gmail.com',
  
  // Email Subject
  subject: 'New Contact Form Inquiry - Rohini Enterprises'
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.WEB3FORMS_CONFIG = WEB3FORMS_CONFIG;
  // Keep EMAIL_CONFIG for backward compatibility (if needed)
  window.EMAIL_CONFIG = WEB3FORMS_CONFIG;
}
