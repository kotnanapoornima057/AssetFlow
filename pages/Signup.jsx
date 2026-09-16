import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async () => {
    setError("");

    if (!form.full_name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      // Signup always creates an Employee account — no role selection here.
      // Only an Admin can promote a user afterward via the Employee Directory.
      await api.post("/auth/register", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: "Employee",
        department_id: null,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-96">
        <h1 className="text-3xl font-bold text-center mb-2">
          AssetFlow
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create your account
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm text-center">
            Account created successfully! Redirecting to login...
          </div>
        ) : (
          <>
            <input
              name="full_name"
              type="text"
              placeholder="Full Name"
              className="border p-2 rounded w-full mb-4"
              value={form.full_name}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="border p-2 rounded w-full mb-4"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password (min 6 characters)"
              className="border p-2 rounded w-full mb-6"
              value={form.password}
              onChange={handleChange}
            />

            <button
              onClick={handleSignup}
              className="bg-blue-600 text-white w-full py-2 rounded font-semibold"
            >
              Sign Up
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              New accounts start as Employee. An Admin can promote your role afterward.
            </p>
          </>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;