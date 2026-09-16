import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

import {
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaBuilding,
  FaCheckCircle,
  FaCamera,
  FaEdit,
  FaLock,
  FaShieldAlt,
  FaChartLine,
  FaBoxes,
  FaCalendarAlt,
  FaTools,
  FaArrowRight,
  FaTimes,
  FaSave,
} from "react-icons/fa";

function Profile() {
  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigate = useNavigate();

  // =====================================================
  // STORED USER
  // =====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [user, setUser] = useState(storedUser);

  const [photo, setPhoto] = useState(null);

  const [preview, setPreview] = useState(
    storedUser?.profile_photo
      ? `http://localhost:5000/uploads/profiles/${storedUser.profile_photo}`
      : null
  );

  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: storedUser?.full_name || "",
    email: storedUser?.email || "",
  });

  // =====================================================
  // FETCH LATEST USER FROM DATABASE
  // =====================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/users/me");

        const latestUser = response.data;

        console.log("LATEST USER:", latestUser);

        setUser(latestUser);

        localStorage.setItem(
          "user",
          JSON.stringify(latestUser)
        );

        if (latestUser.profile_photo) {
          setPreview(
            `http://localhost:5000/uploads/profiles/${latestUser.profile_photo}?t=${Date.now()}`
          );
        } else {
          setPreview(null);
        }

        setEditForm({
          full_name: latestUser.full_name || "",
          email: latestUser.email || "",
        });
      } catch (err) {
        console.error(
          "Failed to load profile:",
          err
        );
      }
    };

    loadProfile();
  }, []);

  // =====================================================
  // PROFILE PHOTO SELECT
  // =====================================================

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image size should be less than 5MB"
      );
      return;
    }

    setPhoto(file);

    setPreview(URL.createObjectURL(file));
  };

  // =====================================================
  // UPLOAD PROFILE PHOTO
  // =====================================================

  const uploadPhoto = async () => {
    if (!photo) {
      toast.error("Please select an image");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("photo", photo);

      const response = await api.put(
        "/users/profile-photo",
        formData
      );

      const updatedUser = response.data.user;

      console.log("UPDATED USER:", updatedUser);

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setPreview(
        `http://localhost:5000/uploads/profiles/${response.data.photo}?t=${Date.now()}`
      );

      setPhoto(null);

      toast.success(
        "Profile photo updated successfully!"
      );
    } catch (err) {
      console.error(
        "UPLOAD PHOTO ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Profile photo upload failed"
      );
    }
  };

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const openEditModal = () => {
    setEditForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
    });

    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    if (!editForm.full_name.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    if (!editForm.email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    try {
      await api.put(
        `/users/${user.user_id}`,
        {
          full_name: editForm.full_name.trim(),
          email: editForm.email.trim(),
          role: user.role,
          status: user.status,
          department_id:
            user.department_id || null,
        }
      );

      const updatedUser = {
        ...user,
        full_name: editForm.full_name.trim(),
        email: editForm.email.trim(),
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setShowEditModal(false);

      toast.success(
        "Profile information updated!"
      );
    } catch (err) {
      console.error(
        "UPDATE PROFILE ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  // =====================================================
  // PROFILE COMPLETION
  // =====================================================

  const completionFields = [
    user?.full_name,
    user?.email,
    user?.department_name,
    user?.role,
    user?.profile_photo,
  ];

  const completedFields =
    completionFields.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedFields /
      completionFields.length) *
      100
  );

  // =====================================================
  // COMMON STYLES
  // =====================================================

  const glassCard = `
    bg-white/70
    dark:bg-slate-900/70
    backdrop-blur-xl
    border
    border-white/70
    dark:border-slate-700/70
    shadow-[0_20px_60px_rgba(15,23,42,0.08)]
  `;

  const muted =
    "text-slate-500 dark:text-slate-400";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-100
        via-blue-50
        to-indigo-100
        dark:from-slate-950
        dark:via-slate-900
        dark:to-slate-950
      "
    >
      <Sidebar />

      <div className="md:ml-[320px] min-h-screen">
        <Navbar />

        <main
          className="
            mt-20
            px-6
            sm:px-8
            lg:px-10
            py-8
            w-full
            max-w-[2000px]
            mx-auto
          "
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-5
              mb-7
            "
          >
            <div>
              <p
                className="
                  text-xs
                  sm:text-sm
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-blue-600
                  dark:text-blue-400
                "
              >
                Account Management
              </p>

              <h1
                className="
                  mt-2
                  text-3xl
                  sm:text-4xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                My Profile
              </h1>

              <p
                className={`
                  ${muted}
                  mt-2
                  text-sm
                  sm:text-base
                `}
              >
                Manage your identity, account
                information and security settings.
              </p>
            </div>

            <button
              onClick={openEditModal}
              className="
                self-start
                lg:self-auto
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                hover:from-blue-700
                hover:to-indigo-700
                text-white
                font-semibold
                shadow-lg
                shadow-blue-500/20
                hover:shadow-xl
                transition-all
              "
            >
              <FaEdit />
              Edit Profile
            </button>
          </div>

          {/* =================================================
              PROFILE HERO
          ================================================= */}

          <section
            className={`
              ${glassCard}
              rounded-3xl
              overflow-hidden
              mb-7
            `}
          >
            {/* COVER */}

            <div
              className="
                relative
                h-32
                sm:h-40
                overflow-hidden
                bg-gradient-to-r
                from-blue-600
                via-indigo-600
                to-purple-600
              "
            >
              <div
                className="
                  absolute
                  -top-20
                  right-10
                  w-64
                  h-64
                  rounded-full
                  bg-white/10
                  blur-2xl
                "
              />

              <div
                className="
                  absolute
                  -bottom-24
                  left-20
                  w-72
                  h-72
                  rounded-full
                  bg-cyan-300/20
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  top-8
                  right-1/3
                  w-24
                  h-24
                  rounded-full
                  border
                  border-white/10
                "
              />
            </div>

            {/* PROFILE INFORMATION */}

            <div className="px-5 sm:px-8 lg:px-10">
              <div
                className="
                  relative
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-6
                  pb-7
                "
              >
                {/* LEFT SIDE */}

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    gap-5
                  "
                >
                  {/* PROFILE PHOTO */}

                  <div
                    className="
                      relative
                      -mt-14
                      sm:-mt-16
                      shrink-0
                    "
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile"
                        className="
                          w-28
                          h-28
                          sm:w-32
                          sm:h-32
                          rounded-full
                          object-cover
                          border-[6px]
                          border-white
                          dark:border-slate-900
                          shadow-2xl
                          bg-slate-100
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-28
                          h-28
                          sm:w-32
                          sm:h-32
                          rounded-full
                          border-[6px]
                          border-white
                          dark:border-slate-900
                          bg-gradient-to-br
                          from-slate-100
                          to-slate-200
                          dark:from-slate-700
                          dark:to-slate-800
                          shadow-2xl
                          flex
                          items-center
                          justify-center
                          text-5xl
                        "
                      >
                        👤
                      </div>
                    )}
                  </div>

                  {/* USER DETAILS */}

                  <div className="pt-1 sm:pt-5">
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2.5
                      "
                    >
                      <h2
                        className="
                          text-2xl
                          sm:text-3xl
                          font-extrabold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        {user?.full_name || "User"}
                      </h2>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-2.5
                          py-1
                          rounded-full
                          bg-emerald-100
                          dark:bg-emerald-900/30
                          text-emerald-700
                          dark:text-emerald-300
                          text-xs
                          font-bold
                        "
                      >
                        <FaCheckCircle />
                        {user?.status || "Active"}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1
                        font-medium
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {user?.role || "User"}
                    </p>

                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:flex-wrap
                        gap-x-5
                        gap-y-2
                        mt-3
                        text-sm
                      "
                    >
                      <span
                        className={`
                          ${muted}
                          flex
                          items-center
                          gap-2
                        `}
                      >
                        <FaEnvelope className="text-blue-500" />

                        <span className="break-all">
                          {user?.email || "No email"}
                        </span>
                      </span>

                      <span
                        className={`
                          ${muted}
                          flex
                          items-center
                          gap-2
                        `}
                      >
                        <FaBuilding className="text-orange-500" />

                        {user?.department_name ||
                          "Not Assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PHOTO BUTTONS */}

                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                    lg:self-end
                  "
                >
                  <input
                    id="profile-photo"
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                  />

                  <label
                    htmlFor="profile-photo"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      py-2.5
                      rounded-xl
                      border
                      border-slate-300
                      dark:border-slate-600
                      bg-white/80
                      dark:bg-slate-800/80
                      backdrop-blur
                      text-slate-700
                      dark:text-slate-200
                      font-semibold
                      cursor-pointer
                      hover:bg-white
                      dark:hover:bg-slate-700
                      transition
                    "
                  >
                    <FaCamera />
                    Change Photo
                  </label>

                  {photo && (
                    <button
                      onClick={uploadPhoto}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-5
                        py-2.5
                        rounded-xl
                        bg-emerald-600
                        hover:bg-emerald-700
                        text-white
                        font-semibold
                        shadow-lg
                        transition
                      "
                    >
                      <FaSave />
                      Save Photo
                    </button>
                  )}
                </div>
              </div>

              {/* PROFILE COMPLETION */}

              <div
                className="
                  mb-7
                  rounded-2xl
                  border
                  border-slate-200/80
                  dark:border-slate-700
                  bg-slate-50/70
                  dark:bg-slate-800/60
                  backdrop-blur
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    mb-3
                  "
                >
                  <div>
                    <p
                      className="
                        font-bold
                        text-slate-800
                        dark:text-white
                      "
                    >
                      Profile Completion
                    </p>

                    <p
                      className={`
                        text-xs
                        sm:text-sm
                        ${muted}
                        mt-1
                      `}
                    >
                      Complete your profile information.
                    </p>
                  </div>

                  <span
                    className="
                      text-lg
                      font-extrabold
                      text-blue-600
                      dark:text-blue-400
                    "
                  >
                    {profileCompletion}%
                  </span>
                </div>

                <div
                  className="
                    h-2.5
                    w-full
                    rounded-full
                    bg-slate-200
                    dark:bg-slate-700
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-blue-500
                      via-indigo-500
                      to-purple-500
                      transition-all
                      duration-700
                    "
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              INFORMATION + SECURITY
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-3
              gap-6
              mb-7
            "
          >
            {/* PERSONAL INFORMATION */}

            <section
              className={`
                xl:col-span-2
                ${glassCard}
                rounded-3xl
                p-6
                sm:p-7
              `}
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  mb-6
                "
              >
                <div>
                  <h3
                    className="
                      text-xl
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Personal Information
                  </h3>

                  <p
                    className={`
                      ${muted}
                      text-sm
                      mt-1
                    `}
                  >
                    Your account identity and organizational details.
                  </p>
                </div>

                <div
                  className="
                    w-11
                    h-11
                    shrink-0
                    rounded-xl
                    bg-blue-100
                    dark:bg-blue-900/30
                    flex
                    items-center
                    justify-center
                    text-blue-600
                  "
                >
                  <FaUser />
                </div>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >
                {/* NAME */}

                <div
                  className="
                    rounded-2xl
                    p-5
                    bg-white/60
                    dark:bg-slate-800/50
                    backdrop-blur
                    border
                    border-slate-200/80
                    dark:border-slate-700
                    hover:-translate-y-0.5
                    hover:shadow-md
                    transition
                  "
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaUser className="text-blue-600" />

                    <span className={`text-sm ${muted}`}>
                      Full Name
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 dark:text-white">
                    {user?.full_name || "-"}
                  </p>
                </div>

                {/* EMAIL */}

                <div
                  className="
                    rounded-2xl
                    p-5
                    bg-white/60
                    dark:bg-slate-800/50
                    backdrop-blur
                    border
                    border-slate-200/80
                    dark:border-slate-700
                    hover:-translate-y-0.5
                    hover:shadow-md
                    transition
                  "
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaEnvelope className="text-emerald-600" />

                    <span className={`text-sm ${muted}`}>
                      Email Address
                    </span>
                  </div>

                  <p
                    className="
                      font-bold
                      text-slate-800
                      dark:text-white
                      break-all
                    "
                  >
                    {user?.email || "-"}
                  </p>
                </div>

                {/* ROLE */}

                <div
                  className="
                    rounded-2xl
                    p-5
                    bg-white/60
                    dark:bg-slate-800/50
                    backdrop-blur
                    border
                    border-slate-200/80
                    dark:border-slate-700
                    hover:-translate-y-0.5
                    hover:shadow-md
                    transition
                  "
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaUserShield className="text-purple-600" />

                    <span className={`text-sm ${muted}`}>
                      Role
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 dark:text-white">
                    {user?.role || "-"}
                  </p>
                </div>

                {/* DEPARTMENT */}

                <div
                  className="
                    rounded-2xl
                    p-5
                    bg-white/60
                    dark:bg-slate-800/50
                    backdrop-blur
                    border
                    border-slate-200/80
                    dark:border-slate-700
                    hover:-translate-y-0.5
                    hover:shadow-md
                    transition
                  "
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaBuilding className="text-orange-500" />

                    <span className={`text-sm ${muted}`}>
                      Department
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 dark:text-white">
                    {user?.department_name ||
                      "Not Assigned"}
                  </p>
                </div>
              </div>
            </section>

            {/* ACCOUNT SECURITY */}

            <section
              className={`
                ${glassCard}
                rounded-3xl
                p-6
                sm:p-7
              `}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="
                    w-12
                    h-12
                    shrink-0
                    rounded-2xl
                    bg-purple-100
                    dark:bg-purple-900/30
                    flex
                    items-center
                    justify-center
                    text-purple-600
                  "
                >
                  <FaShieldAlt />
                </div>

                <div>
                  <h3
                    className="
                      text-xl
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Account Security
                  </h3>

                  <p className={`text-sm ${muted}`}>
                    Keep your account secure.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* PASSWORD */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-4
                    rounded-2xl
                    bg-white/60
                    dark:bg-slate-800/50
                    border
                    border-slate-200/70
                    dark:border-slate-700
                  "
                >
                  <div className="flex items-center gap-3">
                    <FaLock className="text-blue-600" />

                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        Password
                      </p>

                      <p className={`text-xs ${muted}`}>
                        Protected
                      </p>
                    </div>
                  </div>

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      bg-emerald-100
                      dark:bg-emerald-900/30
                      text-emerald-700
                      dark:text-emerald-300
                    "
                  >
                    Secure
                  </span>
                </div>

                {/* TWO FACTOR */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-4
                    rounded-2xl
                    bg-white/60
                    dark:bg-slate-800/50
                    border
                    border-slate-200/70
                    dark:border-slate-700
                  "
                >
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-purple-600" />

                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        Two-Factor Authentication
                      </p>

                      <p className={`text-xs ${muted}`}>
                        Additional protection
                      </p>
                    </div>
                  </div>

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      bg-amber-100
                      dark:bg-amber-900/30
                      text-amber-700
                      dark:text-amber-300
                    "
                  >
                    Not Enabled
                  </span>
                </div>

                {/* CHANGE PASSWORD */}

                <button
                  onClick={() =>
                    navigate("/change-password")
                  }
                  className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-3
                    rounded-xl
                    bg-slate-900
                    dark:bg-white
                    text-white
                    dark:text-slate-900
                    font-semibold
                    hover:opacity-90
                    transition
                  "
                >
                  <FaLock />
                  Change Password
                </button>
              </div>
            </section>
          </div>

          {/* =================================================
              DEPARTMENT OVERVIEW
          ================================================= */}

          <section
            className={`
              ${glassCard}
              rounded-3xl
              p-6
              sm:p-7
              mb-7
            `}
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                mb-6
              "
            >
              <div>
                <h3
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Department Overview
                </h3>

                <p className={`text-sm ${muted} mt-1`}>
                  Quick access to your AssetFlow operations.
                </p>
              </div>

              <FaChartLine className="text-blue-600 text-2xl" />
            </div>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-4
              "
            >
              {/* ASSETS */}

              <div
                className="
                  group
                  p-5
                  rounded-2xl
                  bg-blue-50/70
                  dark:bg-blue-900/20
                  backdrop-blur
                  border
                  border-blue-100
                  dark:border-blue-900/40
                  hover:-translate-y-1
                  hover:shadow-lg
                  transition-all
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-blue-100
                      dark:bg-blue-900/40
                      flex
                      items-center
                      justify-center
                      text-blue-600
                    "
                  >
                    <FaBoxes />
                  </div>

                  <FaArrowRight
                    className="
                      text-blue-400
                      group-hover:translate-x-1
                      transition
                    "
                  />
                </div>

                <p className={`mt-4 text-sm ${muted}`}>
                  Department Assets
                </p>

                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  View Assets
                </p>
              </div>

              {/* BOOKINGS */}

              <div
                className="
                  group
                  p-5
                  rounded-2xl
                  bg-purple-50/70
                  dark:bg-purple-900/20
                  backdrop-blur
                  border
                  border-purple-100
                  dark:border-purple-900/40
                  hover:-translate-y-1
                  hover:shadow-lg
                  transition-all
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-purple-100
                      dark:bg-purple-900/40
                      flex
                      items-center
                      justify-center
                      text-purple-600
                    "
                  >
                    <FaCalendarAlt />
                  </div>

                  <FaArrowRight
                    className="
                      text-purple-400
                      group-hover:translate-x-1
                      transition
                    "
                  />
                </div>

                <p className={`mt-4 text-sm ${muted}`}>
                  Resource Bookings
                </p>

                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  View Bookings
                </p>
              </div>

              {/* MAINTENANCE */}

              <div
                className="
                  group
                  p-5
                  rounded-2xl
                  bg-orange-50/70
                  dark:bg-orange-900/20
                  backdrop-blur
                  border
                  border-orange-100
                  dark:border-orange-900/40
                  hover:-translate-y-1
                  hover:shadow-lg
                  transition-all
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-orange-100
                      dark:bg-orange-900/40
                      flex
                      items-center
                      justify-center
                      text-orange-600
                    "
                  >
                    <FaTools />
                  </div>

                  <FaArrowRight
                    className="
                      text-orange-400
                      group-hover:translate-x-1
                      transition
                    "
                  />
                </div>

                <p className={`mt-4 text-sm ${muted}`}>
                  Maintenance
                </p>

                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  View Requests
                </p>
              </div>

              {/* REPORTS */}

              <div
                className="
                  group
                  p-5
                  rounded-2xl
                  bg-emerald-50/70
                  dark:bg-emerald-900/20
                  backdrop-blur
                  border
                  border-emerald-100
                  dark:border-emerald-900/40
                  hover:-translate-y-1
                  hover:shadow-lg
                  transition-all
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-emerald-100
                      dark:bg-emerald-900/40
                      flex
                      items-center
                      justify-center
                      text-emerald-600
                    "
                  >
                    <FaChartLine />
                  </div>

                  <FaArrowRight
                    className="
                      text-emerald-400
                      group-hover:translate-x-1
                      transition
                    "
                  />
                </div>

                <p className={`mt-4 text-sm ${muted}`}>
                  Analytics & Reports
                </p>

                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  View Reports
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              ACCOUNT STATUS
          ================================================= */}

          <section
            className={`
              ${glassCard}
              rounded-3xl
              p-6
              sm:p-7
            `}
          >
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-5
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-emerald-100
                    dark:bg-emerald-900/30
                    flex
                    items-center
                    justify-center
                    text-emerald-600
                  "
                >
                  <FaCheckCircle />
                </div>

                <div>
                  <h3
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Account Status
                  </h3>

                  <p className={`text-sm ${muted}`}>
                    Your AssetFlow account is currently active.
                  </p>
                </div>
              </div>

              <span
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-full
                  bg-emerald-100
                  dark:bg-emerald-900/30
                  text-emerald-700
                  dark:text-emerald-300
                  font-bold
                  text-sm
                "
              >
                <span
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-emerald-500
                    animate-pulse
                  "
                />

                Active Account
              </span>
            </div>
          </section>
        </main>
      </div>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEditModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            p-4
            bg-slate-950/60
            backdrop-blur-md
          "
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-3xl
              bg-white/95
              dark:bg-slate-900/95
              backdrop-blur-xl
              border
              border-white/50
              dark:border-slate-700
              shadow-2xl
              overflow-hidden
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                border-slate-200
                dark:border-slate-700
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Edit Profile
                </h2>

                <p className={`text-sm mt-1 ${muted}`}>
                  Update your account information.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-slate-500
                  hover:bg-slate-100
                  dark:hover:bg-slate-800
                  transition
                "
              >
                <FaTimes />
              </button>
            </div>

            {/* BODY */}

            <div className="p-6 space-y-5">
              {/* FULL NAME */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    dark:text-slate-300
                    mb-2
                  "
                >
                  Full Name
                </label>

                <div className="relative">
                  <FaUser
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleEditChange}
                    className="
                      w-full
                      pl-11
                      pr-4
                      py-3
                      rounded-xl
                      border
                      border-slate-300
                      dark:border-slate-600
                      bg-slate-50
                      dark:bg-slate-800
                      text-slate-900
                      dark:text-white
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                      focus:border-blue-500
                    "
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    dark:text-slate-300
                    mb-2
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
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="
                      w-full
                      pl-11
                      pr-4
                      py-3
                      rounded-xl
                      border
                      border-slate-300
                      dark:border-slate-600
                      bg-slate-50
                      dark:bg-slate-800
                      text-slate-900
                      dark:text-white
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                      focus:border-blue-500
                    "
                  />
                </div>
              </div>

              {/* ROLE */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    dark:text-slate-300
                    mb-2
                  "
                >
                  Role
                </label>

                <input
                  value={user?.role || ""}
                  disabled
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-100
                    dark:bg-slate-800
                    text-slate-500
                    dark:text-slate-400
                    cursor-not-allowed
                  "
                />

                <p className="text-xs text-slate-400 mt-2">
                  Your role is controlled by the administrator.
                </p>
              </div>

              {/* DEPARTMENT */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    dark:text-slate-300
                    mb-2
                  "
                >
                  Department
                </label>

                <input
                  value={
                    user?.department_name ||
                    "Not Assigned"
                  }
                  disabled
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-100
                    dark:bg-slate-800
                    text-slate-500
                    dark:text-slate-400
                    cursor-not-allowed
                  "
                />

                <p className="text-xs text-slate-400 mt-2">
                  Department assignment is managed by the administrator.
                </p>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
                px-6
                py-5
                border-t
                border-slate-200
                dark:border-slate-700
              "
            >
              <button
                onClick={() =>
                  setShowEditModal(false)
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-600
                  text-slate-700
                  dark:text-slate-200
                  font-semibold
                  hover:bg-slate-50
                  dark:hover:bg-slate-800
                  transition
                "
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-semibold
                  shadow-lg
                  shadow-blue-500/20
                  transition
                "
              >
                <FaSave />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;