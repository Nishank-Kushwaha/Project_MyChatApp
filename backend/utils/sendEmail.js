import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

// create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your App Password (NOT your Gmail login password)
  },
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter ready");
  }
});

// function to generate mail options
const generateEmailOptions = (
  toEmail,
  type,
  userName = "User",
  otp,
  expiryTime = 10
) => {
  // Email templates based on type
  const templates = {
    verify: {
      subject: "Email Verification - OTP",
      heading: "Verify Your Email Address",
      message:
        "Please use the OTP below to verify your email address and activate your account.",
      expiryNote: `This OTP will expire in ${expiryTime} minutes.`,
    },
    reset: {
      subject: "Reset Your Password - OTP",
      heading: "Password Reset Request",
      message:
        "We received a request to reset your password. Use the OTP below to proceed.",
      expiryNote: `This OTP will expire in ${expiryTime} minutes.`,
    },
  };

  const template = templates[type] || templates.verify;

  return {
    from: `"Chat App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: template.subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
          }
          .message {
            font-size: 14px;
            color: #666;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: scale(1.05);
          }
          .fallback-link {
            font-size: 12px;
            color: #999;
            margin-top: 15px;
            word-break: break-all;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
          }
          .security-note {
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #0c5460;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <h1>${template.heading}</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Hi ${userName},
            </div>

            <div class="message">
              ${template.message}
            </div>

            <!-- OTP Display -->
            <div class="button-container">
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 12px; color: #666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
            </div>

            <!-- Expiry Information -->
            <div class="security-note">
              ⏱️ ${template.expiryNote}
            </div>

            <!-- Security Warning -->
            <div class="warning">
              ⚠️ If you didn't request this, please ignore this email or contact our support team immediately.
            </div>

            <!-- Fallback Link -->
            <div class="fallback-link">
              <strong>Don't share this OTP with anyone.</strong><br>
              Our team will never ask for your OTP via email or phone.
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Chat App. All rights reserved.</p>
            <p style="margin: 5px 0;">
              <a href="${
                process.env.FRONTEND_URL
              }" style="color: #667eea; text-decoration: none;">Visit our website</a> | 
              <a href="${
                process.env.FRONTEND_URL
              }/help" style="color: #667eea; text-decoration: none;">Help Center</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ${template.heading}

      Hi ${userName},

      ${template.message}

      Your OTP: ${otp}

      ${template.expiryNote}

      Do not share this OTP with anyone.
      Our team will never ask for your OTP via email or phone.

      If you didn't request this, please ignore this email.

      Chat App - ${new Date().getFullYear()}
    `,
  };
};

// function to send verification email
export const sendVerificationEmail = async (toEmail, name, type, otp) => {
  // Validate inputs
  if (!toEmail || !type || !otp) {
    throw new Error("Missing required parameters: toEmail, type, otp");
  }
  const mailOptions = generateEmailOptions(
    toEmail,
    type,
    name,
    otp.otp,
    otp.expiryMinutes
  );

  try {
    const info = await transporter.sendMail(mailOptions);

    // Return success response with OTP data (for database storage)
    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      otp: otp.otp,
      expiryAt: otp.expiryAt,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Error sending verification email:", error.message);
    return {
      success: false,
      message: error.message,
      error: error.toString(),
    };
  }
};
