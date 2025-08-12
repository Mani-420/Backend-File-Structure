import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  // Initialize email service
  async initialize() {
    try {
      // Create transporter using Gmail SMTP
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password (not regular password)
        }
      });
      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
      this.isConfigured = true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.isConfigured = false;
      // Don't throw error - app should work without email
    }
  }

  // Send email with template
  async sendEmail({ to, subject, template, context = {}, attachments = [] }) {
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured, skipping email send');
      return false;
    }

    try {
      const htmlContent = this.getEmailTemplate(template, context);

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Your Platform',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html: htmlContent,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return false;
    }
  }

  // Email templates
  getEmailTemplate(templateName, context) {
    const templates = {
      welcome: this.welcomeTemplate(context),
      profile_liked: this.profileLikedTemplate(context),
      account_deletion: this.accountDeletionTemplate(context),
      password_reset: this.passwordResetTemplate(context),
      email_verification: this.emailVerificationTemplate(context)
    };

    return templates[templateName] || this.defaultTemplate(context);
  }

  // Welcome email template
  welcomeTemplate({ userName, fullName, actionUrl }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Platform</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Our Platform!</h1>
            </div>
            <div class="content">
                <h2>Hi ${fullName || userName}!</h2>
                <p>Welcome to our amazing platform! We're thrilled to have you on board.</p>
                
                <p><strong>Here's what you can do next:</strong></p>
                <ul>
                    <li>✅ Complete your profile</li>
                    <li>📸 Upload a profile picture</li>
                    <li>💼 Add your skills and experience</li>
                    <li>🔍 Search and connect with other users</li>
                    <li>❤️ Like profiles you find interesting</li>
                </ul>

                <div style="text-align: center;">
                    <a href="${actionUrl}" class="button">Complete Your Profile</a>
                </div>

                <p>If you have any questions, feel free to reach out to our support team.</p>
                
                <p>Happy networking!</p>
                <p><strong>The Platform Team</strong></p>
            </div>
            <div class="footer">
                <p>You received this email because you signed up for our platform.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Profile liked notification template
  profileLikedTemplate({
    likerName,
    likerUsername,
    profileUrl,
    unsubscribeUrl
  }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Someone Liked Your Profile!</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF6B6B; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .profile-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❤️ You Got a Like!</h1>
            </div>
            <div class="content">
                <div class="profile-card">
                    <h3>🎉 Great news!</h3>
                    <p><strong>${likerName}</strong> (@${likerUsername}) liked your profile!</p>
                </div>

                <p>This means your profile caught their attention. Why not check out their profile too?</p>

                <div style="text-align: center;">
                    <a href="${profileUrl}" class="button">View Their Profile</a>
                </div>

                <p><strong>Tips to get more likes:</strong></p>
                <ul>
                    <li>Keep your profile updated</li>
                    <li>Add more skills and experience</li>
                    <li>Write an engaging bio</li>
                    <li>Upload a professional photo</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                <p><a href="${unsubscribeUrl}">Unsubscribe from like notifications</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Account deletion template
  accountDeletionTemplate({ userName, supportEmail }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Account Deleted</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Account Deleted</h1>
            </div>
            <div class="content">
                <h2>Hi ${userName},</h2>
                <p>Your account has been deleted from our platform by an administrator.</p>
                
                <p>If you believe this was done in error, please contact our support team at:</p>
                <p><strong>${
                  supportEmail || 'support@platform.com'
                }</strong></p>
                
                <p>All your data has been permanently removed from our servers.</p>
                
                <p>Thank you for being part of our community.</p>
                <p><strong>The Platform Team</strong></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Password reset template
  passwordResetTemplate({ userName, resetUrl, expiresIn }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reset Your Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
                <h2>Hi ${userName},</h2>
                <p>You requested to reset your password. Click the button below to set a new password:</p>

                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>

                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This link expires in ${expiresIn || '1 hour'}</li>
                        <li>If you didn't request this, ignore this email</li>
                        <li>Never share this link with anyone</li>
                    </ul>
                </div>

                <p>If the button doesn't work, copy and paste this link:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Email verification template
  emailVerificationTemplate({ userName, verificationUrl, expiresIn }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Verify Your Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #9C27B0; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #9C27B0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 Verify Your Email</h1>
            </div>
            <div class="content">
                <h2>Hi ${userName},</h2>
                <p>Please verify your email address to complete your registration:</p>

                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email</a>
                </div>

                <p><strong>Why verify?</strong></p>
                <ul>
                    <li>✅ Access all platform features</li>
                    <li>🔔 Receive important notifications</li>
                    <li>🛡️ Keep your account secure</li>
                </ul>

                <p>This verification link expires in ${
                  expiresIn || '24 hours'
                }.</p>
                
                <p>If you didn't create this account, you can safely ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Default template fallback
  defaultTemplate({ subject, message, actionUrl, buttonText }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${subject || 'Notification'}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <h2>${subject || 'Notification'}</h2>
                <p>${
                  message || 'You have a new notification from our platform.'
                }</p>
                
                ${
                  actionUrl
                    ? `
                <div style="text-align: center;">
                    <a href="${actionUrl}" class="button">${
                        buttonText || 'View Details'
                      }</a>
                </div>
                `
                    : ''
                }
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Bulk email sending (for admin notifications)
  async sendBulkEmail(recipients, { subject, template, context }) {
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured, skipping bulk email send');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const success = await this.sendEmail({
        to: recipient.email,
        subject,
        template,
        context: {
          ...context,
          userName: recipient.userName,
          fullName: recipient.fullName
        }
      });

      if (success) sent++;
      else failed++;

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }
}

export const emailService = new EmailService();
