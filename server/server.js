const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create a transporter object
let transporter = null;

// Initialize transporter with SMTP settings
function initializeTransporter(smtpConfig) {
    try {
        transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            auth: {
                user: smtpConfig.auth.user,
                pass: smtpConfig.auth.pass
            }
        });

        console.log('SMTP transporter initialized with settings:');
        console.log('Host:', smtpConfig.host);
        console.log('Port:', smtpConfig.port);
        console.log('Secure:', smtpConfig.secure);
        console.log('User:', smtpConfig.auth.user);

        return true;
    } catch (error) {
        console.error('Error initializing transporter:', error);
        return false;
    }
}

// API endpoint to send email
app.post('/api/send-email', async(req, res) => {
    try {
        const { smtp, email } = req.body;

        // Initialize transporter with provided SMTP settings
        if (!initializeTransporter(smtp)) {
            return res.status(500).json({
                success: false,
                message: 'Failed to initialize SMTP transporter'
            });
        }

        // Prepare email options
        const mailOptions = {
            from: smtp.auth.user, // Always use the SMTP username as the sender
            to: email.to,
            subject: email.subject,
            text: email.text,
            html: email.html || '',
            replyTo: smtp.auth.user // Always use the SMTP username as the reply-to
        };

        console.log('Sending email with options:', mailOptions);

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.messageId);

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: `Failed to send email: ${error.message}`
        });
    }
});

// API endpoint to test SMTP connection
app.post('/api/test-smtp', async(req, res) => {
    try {
        const { smtp, testEmail } = req.body;

        // Initialize transporter with provided SMTP settings
        if (!initializeTransporter(smtp)) {
            return res.status(500).json({
                success: false,
                message: 'Failed to initialize SMTP transporter'
            });
        }

        // Verify SMTP connection
        const verifyResult = await transporter.verify();

        if (!verifyResult) {
            return res.status(500).json({
                success: false,
                message: 'SMTP connection verification failed'
            });
        }

        // Send test email
        const mailOptions = {
            from: smtp.auth.user,
            to: testEmail,
            subject: 'RashadAI SMTP Test',
            text: 'This is a test email to verify SMTP settings are working correctly.',
            html: '<h1>RashadAI SMTP Test</h1><p>This is a test email to verify SMTP settings are working correctly.</p>'
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Test email sent successfully:', info.messageId);

        res.json({
            success: true,
            message: `SMTP connection test successful. A test email has been sent to ${testEmail}.`
        });
    } catch (error) {
        console.error('Error testing SMTP connection:', error);
        res.status(500).json({
            success: false,
            message: `SMTP connection test failed: ${error.message}`
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Email server running on port ${PORT}`);
});