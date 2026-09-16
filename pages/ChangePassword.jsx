import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to change password.");
        return;
      }

      setSuccess(true);
      setMessage(data.message || "Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-6 py-10 transition-colors">

      <div className="max-w-4xl mx-auto">

        {/* Heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <FaLock className="text-white text-xl" />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Change Password
            </h1>
          </div>

          <p className="text-slate-500 dark:text-slate-400">
            Update your password to keep your AssetFlow account secure.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-7">
            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <FaLock className="text-white text-2xl" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  Password Security
                </h2>

                <p className="text-blue-100 mt-1">
                  Choose a strong password that you don't use elsewhere.
                </p>
              </div>

            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-5 py-4 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
              <div className="mb-6 rounded-xl border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-5">

                <div className="flex items-start gap-4">

                  <FaCheckCircle className="text-green-500 text-2xl mt-1" />

                  <div className="flex-1">
                    <h3 className="font-bold text-green-700 dark:text-green-400 text-lg">
                      Password Updated Successfully
                    </h3>

                    <p className="text-green-600 dark:text-green-300 mt-1">
                      {message}
                    </p>
                  </div>

                  {/* CLOSE BUTTON */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                  >
                    <FaTimes />
                    Close
                  </button>

                </div>
              </div>
            )}

            {/* Current Password */}
            <div className="mb-6">

              <label className="block mb-2 font-semibold text-slate-700 dark:text-slate-200">
                Current Password
              </label>

              <div className="relative">

                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>

            </div>

            {/* New Password */}
            <div className="mb-6">

              <label className="block mb-2 font-semibold text-slate-700 dark:text-slate-200">
                New Password
              </label>

              <div className="relative">

                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Password must contain at least 6 characters.
              </p>

            </div>

            {/* Confirm Password */}
            <div className="mb-8">

              <label className="block mb-2 font-semibold text-slate-700 dark:text-slate-200">
                Confirm New Password
              </label>

              <div className="relative">

                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>

            </div>

            {/* Buttons */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-end gap-4">

              {/* Close */}
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
              >
                Close
              </button>

              {/* Change Password */}
              <button
                type="submit"
                disabled={success}
                className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold flex items-center gap-2 transition"
              >
                <FaLock />
                Change Password
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;