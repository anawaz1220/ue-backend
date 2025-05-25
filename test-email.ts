// test-email.ts
import { sendEmail } from './src/utils/email.util';

async function testEmail() {
  try {
    const result = await sendEmail({
      to: "asifnawaz1220@gmail.com", // Replace with your email to test
      subject: "Test Email from Urban Ease",
      html: "<h1>This is a test email</h1><p>If you're seeing this, email sending works!</p>"
    });
    
    console.log("Email sending result:", result);
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testEmail();