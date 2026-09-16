import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBox,
  FaChartLine,
  FaShieldAlt,
  FaUsers,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";

import api from "../services/api";
import { errorAlert, successAlert } from "../utils/alerts";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // HANDLE LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      errorAlert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      // --------------------------------------------------------
      // Store authentication token
      // --------------------------------------------------------

      if (!res.data?.token) {
        errorAlert("Login failed. Authentication token not received.");
        return;
      }

      localStorage.setItem("token", res.data.token);

      // --------------------------------------------------------
      // Store logged-in user
      // --------------------------------------------------------

      if (res.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );
      }

      // --------------------------------------------------------
      // Success
      // --------------------------------------------------------

      successAlert("Login successful!");

      // Navigate only after token is successfully stored
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);

      errorAlert(
        err.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        bg-gradient-to-br
        from-slate-950
        via-blue-950
        to-indigo-950
        flex
        items-center
        justify-center
        px-4
        py-10
      "
    >

      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div
        className="
          absolute
          -top-40
          -left-40
          w-[500px]
          h-[500px]
          bg-blue-500/20
          rounded-full
          blur-3xl
          animate-pulse
        "
      />

      <div
        className="
          absolute
          -bottom-40
          -right-40
          w-[550px]
          h-[550px]
          bg-indigo-500/20
          rounded-full
          blur-3xl
          animate-pulse
        "
      />

      <div
        className="
          absolute
          top-1/3
          left-1/2
          -translate-x-1/2
          w-72
          h-72
          bg-cyan-500/10
          rounded-full
          blur-3xl
        "
      />

      {/* =====================================================
          FLOATING DOTS
      ===================================================== */}

      <div
        className="
          absolute
          top-20
          left-[15%]
          w-3
          h-3
          rounded-full
          bg-blue-400
          shadow-lg
          shadow-blue-400/50
          animate-bounce
        "
      />

      <div
        className="
          absolute
          bottom-28
          left-[25%]
          w-2
          h-2
          rounded-full
          bg-cyan-400
          animate-pulse
        "
      />

      <div
        className="
          absolute
          top-32
          right-[18%]
          w-2
          h-2
          rounded-full
          bg-indigo-400
          animate-pulse
        "
      />

      <div
        className="
          absolute
          bottom-20
          right-[25%]
          w-3
          h-3
          rounded-full
          bg-blue-400
          animate-bounce
        "
      />

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-6xl
          grid
          lg:grid-cols-2
          gap-8
          items-center
        "
      >

        {/* ===================================================
            LEFT SIDE - PROJECT DESCRIPTION
        =================================================== */}

        <div className="hidden lg:block text-white px-6">

          {/* Logo */}

          <div
            className="
              flex
              items-center
              gap-4
              mb-8
            "
          >

            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-white/10
                backdrop-blur-xl
                border
                border-white/20
                flex
                items-center
                justify-center
                shadow-2xl
              "
            >
              <FaBox className="text-3xl text-blue-400" />
            </div>

            <div>

              <h1 className="text-3xl font-extrabold">
                AssetFlow
              </h1>

              <p className="text-blue-200 text-sm">
                Enterprise Asset Management
              </p>

            </div>

          </div>

          {/* Heading */}

          <p
            className="
              uppercase
              tracking-[0.3em]
              text-xs
              text-blue-300
              font-semibold
            "
          >
            Smart • Secure • Organized
          </p>

          <h2
            className="
              mt-4
              text-5xl
              xl:text-6xl
              font-extrabold
              leading-tight
            "
          >
            Manage your{" "}
            <span className="text-blue-400">
              assets
            </span>
            <br />
            with confidence.
          </h2>

          <p
            className="
              mt-6
              text-lg
              text-slate-300
              max-w-xl
              leading-relaxed
            "
          >
            AssetFlow helps organizations register, track,
            allocate, maintain and analyze enterprise assets
            from one centralized platform.
          </p>

          {/* =================================================
              FEATURE CARDS
          ================================================= */}

          <div className="grid grid-cols-2 gap-4 mt-10">

            {/* Assets */}

            <div
              className="
                group
                p-5
                rounded-2xl
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                hover:bg-white/15
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-blue-500/20
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <FaBox className="text-blue-400" />
              </div>

              <h3 className="font-bold text-lg">
                Asset Tracking
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Track every asset throughout its lifecycle.
              </p>

            </div>

            {/* Users */}

            <div
              className="
                group
                p-5
                rounded-2xl
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                hover:bg-white/15
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-purple-500/20
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <FaUsers className="text-purple-400" />
              </div>

              <h3 className="font-bold text-lg">
                Resource Management
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Allocate and manage resources efficiently.
              </p>

            </div>

            {/* Analytics */}

            <div
              className="
                group
                p-5
                rounded-2xl
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                hover:bg-white/15
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-green-500/20
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <FaChartLine className="text-green-400" />
              </div>

              <h3 className="font-bold text-lg">
                Analytics
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Turn asset data into useful insights.
              </p>

            </div>

            {/* Security */}

            <div
              className="
                group
                p-5
                rounded-2xl
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                hover:bg-white/15
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-cyan-500/20
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <FaShieldAlt className="text-cyan-400" />
              </div>

              <h3 className="font-bold text-lg">
                Secure Management
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Keep enterprise information organized and secure.
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            RIGHT SIDE - LOGIN CARD
        =================================================== */}

        <div className="w-full max-w-md mx-auto">

          <div
            className="
              relative
              rounded-[2rem]
              bg-white/10
              backdrop-blur-2xl
              border
              border-white/20
              shadow-2xl
              shadow-black/30
              p-7
              sm:p-9
              overflow-hidden
            "
          >

            {/* Card glow */}

            <div
              className="
                absolute
                -top-20
                -right-20
                w-40
                h-40
                bg-blue-500/20
                rounded-full
                blur-3xl
              "
            />

            <div
              className="
                absolute
                -bottom-20
                -left-20
                w-40
                h-40
                bg-indigo-500/20
                rounded-full
                blur-3xl
              "
            />

            <div className="relative z-10">

              {/* Mobile Logo */}

              <div className="lg:hidden text-center mb-8">

                <div
                  className="
                    mx-auto
                    w-16
                    h-16
                    rounded-2xl
                    bg-blue-500/20
                    border
                    border-blue-400/20
                    flex
                    items-center
                    justify-center
                    mb-4
                  "
                >
                  <FaBox className="text-3xl text-blue-400" />
                </div>

                <h1 className="text-3xl font-extrabold text-white">
                  AssetFlow
                </h1>

                <p className="text-blue-200 text-sm mt-1">
                  Enterprise Asset Management
                </p>

              </div>

              {/* Login Heading */}

              <div className="mb-8">

                <p
                  className="
                    text-blue-300
                    text-sm
                    font-semibold
                    uppercase
                    tracking-widest
                  "
                >
                  Welcome Back
                </p>

                <h2
                  className="
                    text-3xl
                    sm:text-4xl
                    font-extrabold
                    text-white
                    mt-2
                  "
                >
                  Sign in to AssetFlow
                </h2>

                <p className="text-slate-300 mt-3">
                  Access your enterprise asset dashboard.
                </p>

              </div>

              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label
                    className="
                      block
                      mb-2
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <FaEnvelope
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@example.com"
                      autoComplete="email"
                      disabled={loading}
                      className="
                        w-full
                        rounded-2xl
                        bg-white/10
                        border
                        border-white/20
                        text-white
                        placeholder:text-slate-400
                        pl-12
                        pr-5
                        py-4
                        outline-none
                        transition
                        focus:bg-white/15
                        focus:border-blue-400
                        focus:ring-2
                        focus:ring-blue-500/30
                        disabled:opacity-60
                      "
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <label
                    className="
                      block
                      mb-2
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    Password
                  </label>

                  <div className="relative">

                    <FaLock
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="
                        w-full
                        rounded-2xl
                        bg-white/10
                        border
                        border-white/20
                        text-white
                        placeholder:text-slate-400
                        pl-12
                        pr-12
                        py-4
                        outline-none
                        transition
                        focus:bg-white/15
                        focus:border-blue-400
                        focus:ring-2
                        focus:ring-blue-500/30
                        disabled:opacity-60
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        hover:text-white
                        transition
                        disabled:opacity-50
                      "
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* Login Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    w-full
                    mt-3
                    py-4
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-600
                    via-indigo-600
                    to-purple-600
                    hover:from-blue-500
                    hover:via-indigo-500
                    hover:to-purple-500
                    text-white
                    font-bold
                    shadow-xl
                    shadow-blue-900/30
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >

                  {loading ? (
                    <>
                      <span
                        className="
                          w-5
                          h-5
                          border-2
                          border-white/30
                          border-t-white
                          rounded-full
                          animate-spin
                        "
                      />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In

                      <FaArrowRight
                        className="
                          group-hover:translate-x-1
                          transition
                        "
                      />
                    </>
                  )}

                </button>

              </form>

              {/* Bottom text */}

              <div
                className="
                  mt-8
                  pt-6
                  border-t
                  border-white/10
                  text-center
                "
              >

                <p className="text-sm text-slate-400">
                  Secure enterprise asset management
                </p>

                <div
                  className="
                    flex
                    justify-center
                    items-center
                    gap-2
                    mt-3
                    text-xs
                    text-slate-500
                  "
                >

                  <FaShieldAlt className="text-green-400" />

                  <span>
                    Your workspace is protected
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;