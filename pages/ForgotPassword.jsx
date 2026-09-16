import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    // Stub: in a full implementation this would call a backend endpoint
    // that emails a reset link. For now we just acknowledge the request.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-2">
          Reset Password
        </h1>

        {!submitted ? (
          <>
            <p className="text-center text-gray-500 mb-6 text-sm">
              Enter your email and we'll send you a reset link.
            </p>

            <input
              type="email"
              placeholder="Email"
              className="border p-2 rounded w-full mb-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white w-full py-2 rounded font-semibold"
            >
              Send Reset Link
            </button>
          </>
        ) : (
          <p className="text-center text-green-600 text-sm">
            If an account exists for {email}, a reset link has been sent.
          </p>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          <a href="/" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;