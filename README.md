# Email-Service
Overview:
This project is a simple email-sending service API built using Node.js, Express, and a custom EmailService class. It allows sending emails through different providers with retry logic, rate limiting, and duplicate email detection. The application also includes exponential backoff for retry attempts.

Features
i.Supports sending emails using multiple providers.
ii.Implements retry logic with exponential backoff for failed email sends.
iii.Includes rate-limiting functionality to control the number of emails sent within a specific time frame.
iv.Tracks sent email IDs to avoid duplicate sends.
v.Provides API endpoints to send emails and retrieve email statuses.
vi.Prerequisites
vii.Node.js (version 12.x or higher)
viii.npm (Node Package Manager)

Usage
1. Send an Email
Endpoint: POST /send-email

Request Body: JSON format

json
Copy code
{
  "id": "unique-email-id",
  "to": "recipient@example.com",
  "subject": "Test Email",
  "body": "This is a test email."
}
Response:

Success: 200 OK with message Email sent successfully.
Failure: 500 Internal Server Error with message Failed to send email.
Example using curl:

bash
Copy code
curl -X POST http://localhost:3000/send-email \
     -H "Content-Type: application/json" \
     -d '{"id":"1234","to":"recipient@example.com","subject":"Hello","body":"Test email content."}'
2. Get Email Status
Endpoint: GET /email-status/:id
Response: Returns the status of the email with the given ID.
Assumptions
The system is designed to use mock email providers for sending emails.
Email sending success/failure is randomly simulated for demonstration purposes.
Rate limiting is set to a maximum of 2 emails per minute.
A unique email ID is required to track emails and avoid duplication.
Exponential backoff is used for retrying email sending, starting with a 1-second delay.

Conclusion
This email-sending service API provides a simple yet robust way to handle email delivery using multiple providers with built-in failover and rate-limiting mechanisms. By following the setup and usage instructions, you can get the service running on your local environment and use it to send test emails.
