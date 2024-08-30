class EmailService {
    constructor() {
      this.providers = [this.sendViaProvider1, this.sendViaProvider2];
      this.currentProviderIndex = 0;
      this.maxRetries = 3;
      this.sentEmails = new Set(); 
      this.rateLimit = 2; 
      this.emailCount = 0; 
      this.timeFrame = 60000; 
      this.statusLog = {}; 
      this.resetRateLimit(); 
    }
  
    // Resets the email count at the end of each time frame
    resetRateLimit() {
      setInterval(() => {
        this.emailCount = 0;
      }, this.timeFrame);
    }
  
    // Mock function to simulate sending email via Provider 1
    sendViaProvider1(email) {
      console.log(`Attempting to send email via Provider 1 to ${email.to}`);
      return Math.random() > 0.5; 
    }
  
    // Mock function to simulate sending email via Provider 2
    sendViaProvider2(email) {
      console.log(`Attempting to send email via Provider 2 to ${email.to}`);
      return Math.random() > 0.5; 
    }
  
    // Main function to send an email with retry logic and fallback mechanism
    async sendEmailWithRetry(email, retries = this.maxRetries) {
      if (this.sentEmails.has(email.id)) {
        console.log('Email already sent. Skipping...');
        this.statusLog[email.id] = 'already_sent';
        return true;
      }
  
      if (this.emailCount >= this.rateLimit) {
        console.error('Rate limit exceeded. Please wait and try again.');
        this.statusLog[email.id] = 'rate_limit_exceeded';
        return false;
      }
  
      let delay = 1000; 
      for (let attempt = 0; attempt < retries; attempt++) {
        if (this.sendEmail(email)) {
          console.log('Email sent successfully');
          this.sentEmails.add(email.id); // Mark email as sent
          this.emailCount++; // Increment email count for rate limiting
          this.statusLog[email.id] = 'success';
          return true;
        }
        console.log(`Retry attempt ${attempt + 1} failed. Switching provider and retrying in ${delay}ms...`);
        this.switchProvider(); // Switch to the next provider
        await new Promise((resolve) => setTimeout(resolve, delay)); // Exponential backoff
        delay *= 2;
      }
      console.error('All retry attempts failed');
      this.statusLog[email.id] = 'failed';
      return false;
    }
  
    // Function to send email using the current provider
    sendEmail(email) {
      const provider = this.providers[this.currentProviderIndex];
      const success = provider.call(this, email); // Call the selected provider function
      if (!success) {
        console.error('Email sending failed');
      }
      return success;
    }
  
    // Switch to the next provider in the list
    switchProvider() {
      this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    }
  
    // Retrieve the status of a specific email sending attempt by ID
    getStatus(emailId) {
      return this.statusLog[emailId] || 'not_found';
    }
  }
  
  // Example usage of the EmailService class
  const emailService = new EmailService();
  emailService.sendEmailWithRetry({ id: '123', to: 'test@example.com', subject: 'Hello', body: 'Hello, world!' })
    .then(() => console.log(emailService.getStatus('123')));
  
