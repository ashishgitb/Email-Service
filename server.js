const express = require('express');
const bodyParser = require('body-parser');

// Assume EmailService class code is placed here or imported
class EmailService {
    constructor() {
        // Array holding references to two mock email-sending functions
        this.providers = [this.sendUsingFirstProvider, this.sendUsingSecondProvider];
        this.activeProviderIndex = 0; // Index to keep track of the currently active provider
        this.maxRetryAttempts = 3; // Maximum number of retry attempts for sending an email
        this.sentEmailIds = new Set(); // A set to track email IDs to avoid resending the same email
        this.rateLimitThreshold = 2; // Maximum emails allowed within a specific time period
        this.currentEmailCount = 0; // Counter to track number of emails sent within the current time frame
        this.timePeriod = 60000; // Time frame in milliseconds (e.g., 1 minute)
        this.sendStatusLog = {}; // Object to log the status of email sending attempts
        this.initializeRateLimitReset(); // Method to periodically reset the email counter
      }
    
      // Method to reset the email counter after each defined time frame
      initializeRateLimitReset() {
        setInterval(() => {
          this.currentEmailCount = 0; // Reset the email count
        }, this.timePeriod);
      }
    
      // Simulated function to send email using the first mock provider
      sendUsingFirstProvider(email) {
        console.log(`Sending email via First Provider to: ${email.to}`);
        return Math.random() > 0.5; // Randomly simulate a success or failure
      }
    
      // Simulated function to send email using the second mock provider
      sendUsingSecondProvider(email) {
        console.log(`Sending email via Second Provider to: ${email.to}`);
        return Math.random() > 0.5; // Randomly simulate a success or failure
      }
    
      // Core function to handle email sending with retry logic and provider switching
      async attemptToSendEmail(email, remainingRetries = this.maxRetryAttempts) {
        // Check if the email was already sent to prevent duplicate sending
        if (this.sentEmailIds.has(email.id)) {
          console.log('Duplicate email detected. Skipping send operation.');
          this.sendStatusLog[email.id] = 'already_sent';
          return true;
        }
    
        // Check if the rate limit has been exceeded
        if (this.currentEmailCount >= this.rateLimitThreshold) {
          console.error('Rate limit has been exceeded. Please wait before sending more emails.');
          this.sendStatusLog[email.id] = 'rate_limit_exceeded';
          return false;
        }
    
        // Initialize delay for exponential backoff
        let backoffDelay = 1000; // Start with a 1-second delay
        for (let attempt = 0; attempt < remainingRetries; attempt++) {
          // Attempt to send the email using the current provider
          if (this.sendEmailUsingCurrentProvider(email)) {
            console.log('Email successfully sent!');
            this.sentEmailIds.add(email.id); // Mark the email ID as sent
            this.currentEmailCount++; // Increment the email counter
            this.sendStatusLog[email.id] = 'success';
            return true;
          }
    
          // Log the failure and prepare to retry
          console.log(`Failed attempt ${attempt + 1}. Changing provider and retrying in ${backoffDelay}ms...`);
          this.switchToNextProvider(); // Switch to the next provider in the list
          await new Promise((resolve) => setTimeout(resolve, backoffDelay)); // Wait for the backoff delay
          backoffDelay *= 2; // Double the delay for exponential backoff
        }
    
        // If all retry attempts fail, log the failure
        console.error('All attempts to send the email have failed.');
        this.sendStatusLog[email.id] = 'failure';
        return false;
      }
    
      // Method to send an email using the currently selected provider
      sendEmailUsingCurrentProvider(email) {
        const selectedProvider = this.providers[this.activeProviderIndex];
        const isSuccess = selectedProvider.call(this, email); // Call the provider function
        if (!isSuccess) {
          console.error('Failed to send email using the current provider.');
        }
        return isSuccess;
      }
    
      // Method to switch to the next provider in the provider list
      switchToNextProvider() {
        this.activeProviderIndex = (this.activeProviderIndex + 1) % this.providers.length;
      }
    
      // Method to retrieve the status of a particular email by its ID
      getEmailStatus(emailId) {
        return this.sendStatusLog[emailId] || 'status_unknown';
      }
    
}

const app = express();
const emailService = new EmailService();

app.use(bodyParser.json());


// Define a route to handle sending email
app.post('/send-email', async (req, res) => {
    const email = req.body;

    // Attempt to send the email
    const result = await emailService.attemptToSendEmail(email);
    if (result) {
        res.status(200).json({ message: 'Email sent successfully', status: 'success' });
    } else {
        res.status(500).json({ message: 'Failed to send email', status: 'failure' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
