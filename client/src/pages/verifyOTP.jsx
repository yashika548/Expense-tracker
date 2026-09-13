import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function VerifyOTP() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const email = state?.email;

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email is missing. Please start again.");
      navigate("/forgot-password");
      return;
    }

    if (!otp || otp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    if (!password) {
      alert("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // Verify OTP
      await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      // Reset password
      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        password,
      });

      alert("Password Reset Successfully");

      navigate("/");
    } catch (error) {
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
          "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h1 className="text-2xl font-bold mb-2">
          Verify OTP
        </h1>

        <p className="text-gray-600 mb-6">
          OTP sent to:
        </p>

        <p className="font-medium mb-6">
          {email}
        </p>

        <form onSubmit={handleReset}>

          <input
            type="text"
            inputMode="numeric"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-3 rounded w-full mb-4"
          />

          <input
            type="password"
            placeholder="Enter New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded w-full mb-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white w-full py-3 rounded"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default VerifyOTP;