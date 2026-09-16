import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaSun, FaMoon } from "react-icons/fa";

import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";

import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropdown";

function Navbar() {
  const navigate = useNavigate();

  const { toggle } = useSidebar();
  const { darkMode, toggleTheme } = useTheme();

  // ============================================================
  // USER STATE
  // ============================================================

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      return null;
    }
  });

  // ============================================================
  // LOAD USER AGAIN WHEN PROFILE PHOTO CHANGES
  // ============================================================

  useEffect(() => {
    const updateUser = () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        setUser(storedUser);
      } catch (error) {
        console.error(
          "Error loading user from localStorage:",
          error
        );
      }
    };

    // Custom event from Profile page
    window.addEventListener(
      "profileUpdated",
      updateUser
    );

    // Storage event
    window.addEventListener(
      "storage",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        updateUser
      );

      window.removeEventListener(
        "storage",
        updateUser
      );
    };
  }, []);

  // ============================================================
  // PROFILE PHOTO URL
  // ============================================================

  const getProfilePhotoUrl = () => {
    const photo = user?.profile_photo;

    if (!photo) {
      return null;
    }

    // Already complete URL
    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://")
    ) {
      return photo;
    }

    // If database contains /uploads/profiles/filename
    if (photo.startsWith("/uploads/profiles/")) {
      return `http://localhost:5000${photo}`;
    }

    // Your AssetFlow backend stores profile photos here
    return `http://localhost:5000/uploads/profiles/${photo}`;
  };

  const profilePhoto = getProfilePhotoUrl();

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <header
      className="
        sticky
        top-0
        z-40
        bg-white
        dark:bg-slate-950
        border-b
        border-slate-200
        dark:border-slate-800
      "
    >

      {/* ======================================================
          MAIN NAVBAR
      ====================================================== */}

      <div
        className="
          min-h-[84px]
          px-6
          flex
          items-center
          justify-between
          gap-4
        "
      >

        {/* ====================================================
            LEFT
        ==================================================== */}

        <div
          className="
            flex
            items-center
            gap-4
            flex-shrink-0
          "
        >

          {/* MOBILE MENU */}
          <button
            onClick={toggle}
            className="
              xl:hidden
              flex
              items-center
              justify-center
              w-11
              h-11
              rounded-xl
              bg-slate-100
              dark:bg-slate-800
              hover:bg-blue-100
              dark:hover:bg-slate-700
              transition
            "
          >
            <FaBars
              size={22}
              className="
                text-slate-700
                dark:text-white
              "
            />
          </button>

          {/* WELCOME TEXT */}
          <div>
            <h2
              className="
                text-2xl
                font-bold
                text-slate-800
                dark:text-white
              "
            >
              Welcome,

              <span
                className="
                  text-blue-600
                  ml-2
                "
              >
                {user?.full_name || "User"}
              </span>
            </h2>

            <p
              className="
                text-sm
                text-slate-500
                dark:text-slate-300
              "
            >
              Enterprise Asset Management
            </p>
          </div>
        </div>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div
          className="
            hidden
            lg:flex
            flex-1
            justify-center
            px-8
          "
        >
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        {/* ====================================================
            RIGHT
        ==================================================== */}

        <div
          className="
            flex
            items-center
            gap-3
            flex-shrink-0
          "
        >

          {/* THEME BUTTON */}
          <button
            onClick={toggleTheme}
            className="
              w-11
              h-11
              rounded-full
              bg-slate-100
              dark:bg-slate-700
              hover:bg-blue-100
              dark:hover:bg-slate-600
              transition
              flex
              items-center
              justify-center
            "
          >
            {darkMode ? (
              <FaSun
                className="
                  text-yellow-400
                  text-lg
                "
              />
            ) : (
              <FaMoon
                className="
                  text-slate-700
                  dark:text-white
                  text-lg
                "
              />
            )}
          </button>

          {/* NOTIFICATION */}
          <div
            className="
              w-11
              h-11
              rounded-full
              bg-slate-100
              dark:bg-slate-700
              hover:bg-blue-100
              dark:hover:bg-slate-600
              transition
              flex
              items-center
              justify-center
            "
          >
            <NotificationBell />
          </div>

          {/* ==================================================
              PROFILE DROPDOWN
          ================================================== */}

          <ProfileDropdown
            user={user}
            profilePhoto={profilePhoto}
            onLogout={handleLogout}
          />

        </div>
      </div>

      {/* ======================================================
          MOBILE SEARCH
      ====================================================== */}

      <div
        className="
          lg:hidden
          px-6
          pb-4
        "
      >
        <SearchBar />
      </div>

    </header>
  );
}

export default Navbar;