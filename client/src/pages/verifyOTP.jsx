import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function VerifyOTP() {

  const { state } = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const handleReset = async () => {

    try {

      await api.post("/auth/verify-otp", {
        email: state.email,
        otp,
      });

      await api.post("/auth/reset-password", {
        email: state.email,
        password,
      });

      alert("Password Reset Successfully");

      navigate("/");

    } catch (error) {

      console.log(error);

      alert(error.response?.data?.message || "Failed");

    }

  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h1 className="text-2xl font-bold mb-6">

          Verify OTP

        </h1>

        <input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e)=>setOtp(e.target.value)}
          className="border p-3 rounded w-full mb-4"
        />

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="border p-3 rounded w-full mb-4"
        />

        <button
          onClick={handleReset}
          className="bg-green-600 text-white w-full py-3 rounded"
        >
          Reset Password
        </button>

      </div>

    </div>
  );
}

export default VerifyOTP;