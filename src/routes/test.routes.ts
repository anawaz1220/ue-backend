// src/routes/test.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { sendEmail } from '../utils/email.util';

const router = Router();

// Define the route
router.post('/test-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    const emailOptions = {
      to: email,
      subject: 'Urban Ease - Test Email',
      html: '<h1>Urban Ease Test Email</h1><p>This is a test email from Mailgun integration.</p>'
    };
    
    const success = await sendEmail(emailOptions);
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email' 
      });
    }
  } catch (error) {
    next(error);
  }
});

// Also add a GET endpoint for easier browser testing
router.get('/test-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required as a query parameter' 
      });
    }
    
    const emailOptions = {
      to: email,
      subject: 'Urban Ease - Test Email',
      html: '<h1>Urban Ease Test Email</h1><p>This is a test email from Mailgun integration.</p>'
    };
    
    const success = await sendEmail(emailOptions);
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email' 
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;