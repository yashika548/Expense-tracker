import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      await api.post("/auth/forgot-password", { email });

      alert("OTP Sent Successfully");

      navigate("/verify-otp", {
        state: { email },
      });

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h1 className="text-2xl font-bold mb-6">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="border p-3 rounded w-full mb-4"
        />

        <button
          onClick={handleSendOTP}
          className="bg-blue-600 text-white w-full py-3 rounded"
        >
          Send OTP
        </button>

      </div>

    </div>
  );
}

export default ForgotPassword;