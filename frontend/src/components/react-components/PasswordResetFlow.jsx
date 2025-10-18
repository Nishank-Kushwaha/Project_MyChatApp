import { useState } from "react";
import { Mail, ArrowRight, Lock, Check, Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

// handle otp functionality
const generateOTP = (length = 6, alphanumeric = false, expiryMinutes = 5) => {
  let otp = "";

  if (alphanumeric) {
    // Alphanumeric OTP (numbers + uppercase letters)
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } else {
    // Numeric OTP only
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    otp = Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  // Calculate expiry time
  const createdAt = new Date();
  const expiryAt = new Date(createdAt.getTime() + expiryMinutes * 60 * 1000);

  return {
    otp,
    createdAt,
    expiryAt,
    expiryMinutes,
    isExpired: () => new Date() > expiryAt,
    timeRemaining: () => {
      const now = new Date();
      const diff = expiryAt - now;
      if (diff <= 0) return { expired: true, minutes: 0, seconds: 0 };

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return { expired: false, minutes, seconds };
    },
  };
};

export default function PasswordResetFlow() {
  const { type } = useParams();
  const [step, setStep] = useState(1);

  const { user, loginStatus } = useSelector((state) => state.user);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otp_generated = generateOTP();
  console.log("otp_generated", otp_generated);

  const handleEmailSubmit = async () => {
    setError("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (type === "reset") {
      if (email !== user.email) {
        setError("Please enter email address used in this account");
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/send-mail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            toEmail: email,
            name: type === "reset" ? user.username : "User",
            type: type,
            otp: otp_generated,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${data.message}`);
        setStep(2);
      } else {
        setError(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("❌ Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${data.message}`);
        setStep(3);
      } else {
        setError(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("❌ Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const handlePasswordReset = async () => {
    if (type === "reset") {
      setError("");

      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: email,
              oldPassword: oldPassword,
              newPassword: newPassword,
              confirmPassword: confirmPassword,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          console.log(`✅ ${data.message}`);
          setStep(5);
        } else {
          setError(`❌ ${data.message}`);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("❌ Failed to reset password");
      } finally {
        setLoading(false);
      }
    } else {
      setError("");

      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/reset-password-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: email,
              newPassword: newPassword,
              confirmPassword: confirmPassword,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          console.log(`✅ ${data.message}`);
          setStep(5);
        } else {
          setError(`❌ ${data.message}`);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("❌ Failed to reset password");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Email Input Page */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Enter your email address and we'll send you an OTP to reset your
              password
            </p>

            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleEmailSubmit)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleEmailSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Remember your password?{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        )}

        {/* OTP Verification Page */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Verify OTP
            </h2>
            <p className="text-gray-600 text-center mb-8">
              We've sent a 6-digit code to
              <br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>

            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyPress={(e) => handleKeyPress(e, handleOtpSubmit)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-semibold text-black"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleOtpSubmit}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Didn't receive the code?{" "}
                <span className="text-purple-600 font-medium">Resend</span>
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-center w-full text-sm text-gray-600 hover:text-gray-900 mt-4"
            >
              ← Back to email
            </button>
          </div>
        )}

        {/* Success Page */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              OTP Verified!
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Your OTP has been verified successfully. You can now reset your
              password.
            </p>

            <button
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
              onClick={() => setStep(4)}
            >
              Set New Password
            </button>
          </div>
        )}

        {/* Set New Password Page */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Set New Password
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Create a strong password for your account
            </p>

            <div>
              {type === "reset" && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Old Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter your old password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-12 text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showOldPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-12 text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handlePasswordReset)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-12 text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePasswordReset}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Final Success Page */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </p>

            <a
              href="/profile"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition block text-center"
            >
              Go to Profile Page
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
