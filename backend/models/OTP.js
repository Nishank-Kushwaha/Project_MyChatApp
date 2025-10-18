import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["forgot", "reset"], required: true },
  expiryAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto delete after 10 mins
});

export default mongoose.models.OTP || mongoose.model("OTP", otpSchema);
