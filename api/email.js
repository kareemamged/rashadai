const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

// إعداد تطبيق Express
const app = express();

// تكوين CORS للسماح بالطلبات من أي مصدر
app.use(cors({
  origin: true, // السماح بالطلبات من أي مصدر
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// زيادة حد حجم الطلب
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// إنشاء transporter
let transporter = null;

// تهيئة transporter بإعدادات SMTP
function initializeTransporter(smtpConfig) {
    try {
        // التحقق من وجود الإعدادات المطلوبة
        if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || !smtpConfig.auth || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
            console.error('Missing required SMTP configuration');
            return false;
        }

        // طباعة معلومات التكوين للتشخيص (بدون كلمة المرور)
        console.log('Initializing SMTP transporter with:');
        console.log('- Host:', smtpConfig.host);
        console.log('- Port:', smtpConfig.port);
        console.log('- Secure:', smtpConfig.secure);
        console.log('- User:', smtpConfig.auth.user);

        // إنشاء transporter
        transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            auth: {
                user: smtpConfig.auth.user,
                pass: smtpConfig.auth.pass
            },
            // إضافة خيارات إضافية لتحسين الأداء والموثوقية
            tls: {
                // لا تفشل إذا كانت الشهادة غير صالحة
                rejectUnauthorized: false
            },
            // إضافة مهلة زمنية للاتصال
            connectionTimeout: 10000, // 10 ثوانٍ
            // إضافة مهلة زمنية للإرسال
            greetingTimeout: 10000 // 10 ثوانٍ
        });

        console.log('SMTP transporter initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing transporter:', error);
        return false;
    }
}

// معالج طلبات API
const handler = async (req, res) => {
    console.log('API request received:', req.url);
    console.log('Request method:', req.method);

    // تعيين CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // معالجة طلبات OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // معالجة طلبات POST فقط
    if (req.method === 'POST') {
        console.log('Request body:', req.body);

        // استخراج المسار من URL
        let path = '';
        if (req.url.includes('/send-email')) {
            path = 'send-email';
        } else if (req.url.includes('/test-smtp')) {
            path = 'test-smtp';
        } else {
            path = req.url.split('/').pop();
        }

        if (path === 'send-email') {
            try {
                const { smtp, email } = req.body;

                // تهيئة transporter بإعدادات SMTP المقدمة
                if (!initializeTransporter(smtp)) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to initialize SMTP transporter'
                    });
                }

                // إعداد خيارات البريد الإلكتروني
                const mailOptions = {
                    from: smtp.auth.user,
                    to: email.to,
                    subject: email.subject,
                    text: email.text,
                    html: email.html || '',
                    replyTo: smtp.auth.user
                };

                // إرسال البريد الإلكتروني
                console.log('Attempting to send email to:', mailOptions.to);

                try {
                    // إضافة مهلة زمنية للإرسال
                    const sendPromise = transporter.sendMail(mailOptions);

                    // إنشاء وعد بمهلة زمنية
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Email sending timeout after 20 seconds')), 20000);
                    });

                    // انتظار أول وعد يتم حله
                    const info = await Promise.race([sendPromise, timeoutPromise]);

                    console.log('Email sent successfully to:', mailOptions.to);
                    console.log('Message ID:', info.messageId);

                    // التحقق من نجاح الإرسال
                    if (info && info.messageId) {
                        return res.status(200).json({
                            success: true,
                            message: 'Email sent successfully',
                            messageId: info.messageId
                        });
                    } else {
                        throw new Error('Email sent but no message ID returned');
                    }
                } catch (sendError) {
                    console.error('Error sending email:', sendError);
                    return res.status(500).json({
                        success: false,
                        message: `Failed to send email: ${sendError.message}`
                    });
                }
            } catch (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({
                    success: false,
                    message: `Failed to send email: ${error.message}`
                });
            }
        } else if (path === 'test-smtp') {
            try {
                const { smtp, testEmail } = req.body;

                // تهيئة transporter بإعدادات SMTP المقدمة
                if (!initializeTransporter(smtp)) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to initialize SMTP transporter'
                    });
                }

                // التحقق من اتصال SMTP
                const verifyResult = await transporter.verify();

                if (!verifyResult) {
                    return res.status(500).json({
                        success: false,
                        message: 'SMTP connection verification failed'
                    });
                }

                // إرسال بريد إلكتروني اختباري
                const mailOptions = {
                    from: smtp.auth.user,
                    to: testEmail,
                    subject: 'RashadAI SMTP Test',
                    text: 'This is a test email to verify SMTP settings are working correctly.',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h1 style="color: #4169E1;">RashadAI SMTP Test</h1>
                            <p>This is a test email to verify SMTP settings are working correctly.</p>
                            <p>If you received this email, it means your SMTP settings are configured properly.</p>
                            <p>Test time: ${new Date().toISOString()}</p>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                                <p>RashadAI &copy; ${new Date().getFullYear()} All Rights Reserved</p>
                            </div>
                        </div>
                    `
                };

                console.log('Attempting to send test email to:', testEmail);

                try {
                    // إضافة مهلة زمنية للإرسال
                    const sendPromise = transporter.sendMail(mailOptions);

                    // إنشاء وعد بمهلة زمنية
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Test email sending timeout after 20 seconds')), 20000);
                    });

                    // انتظار أول وعد يتم حله
                    const info = await Promise.race([sendPromise, timeoutPromise]);

                    console.log('Test email sent successfully to:', testEmail);
                    console.log('Message ID:', info.messageId);

                    // التحقق من نجاح الإرسال
                    if (info && info.messageId) {
                        return res.status(200).json({
                            success: true,
                            message: `SMTP connection test successful. A test email has been sent to ${testEmail}.`,
                            messageId: info.messageId
                        });
                    } else {
                        throw new Error('Test email sent but no message ID returned');
                    }
                } catch (sendError) {
                    console.error('Error sending test email:', sendError);
                    return res.status(500).json({
                        success: false,
                        message: `Failed to send test email: ${sendError.message}`
                    });
                }
            } catch (error) {
                console.error('Error testing SMTP connection:', error);
                return res.status(500).json({
                    success: false,
                    message: `SMTP connection test failed: ${error.message}`
                });
            }
        } else {
            return res.status(404).json({
                success: false,
                message: 'Endpoint not found'
            });
        }
    } else {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }
};

// تصدير الدالة كـ serverless function
module.exports = handler;
