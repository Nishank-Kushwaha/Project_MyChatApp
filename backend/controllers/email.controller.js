import { sendVerificationEmail } from "../utils/sendEmail.js";
import OTP from "../models/OTP.js";

/**
 * API endpoint to send verification email
 * POST /api/send-mail
 * Body: { toEmail, name, type, expiryMinutes? }
 */
export const sendMail = async (req, res) => {
  try {
    const { toEmail, name, type, otp } = req.body;

    console.log("email send backend:", toEmail, name, type, otp);

    // Input validation
    if (!toEmail || !type || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: toEmail, type, otp",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate type
    if (!["forgot", "reset"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'forgot' or 'reset'",
      });
    }

    // Send email
    const result = await sendVerificationEmail(toEmail, name, type, otp);

    // Check if email was sent successfully
    if (!result.success) {
      return res.status(500).json(result);
    }

    await OTP.create({
      email: toEmail,
      otp: otp.otp,
      expiryAt: otp.expiryAt,
      type: type,
      used: false,
    });

    console.log("✅ Verification email sent successfully:", result.messageId);

    res.status(200).json({
      success: true,
      message: `${type} verification email sent successfully`,
      messageId: result.messageId,
      expiryMinutes: otp.expiryMinutes,
    });
  } catch (error) {
    console.error("❌ Error in sendMail controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
