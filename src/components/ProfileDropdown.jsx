import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCog,
  FaKey,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";

function ProfileDropdown({ user, profilePhoto, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const fullName = user?.full_name || "User";
  const email = user?.email || "";

  const role =
    user?.role ||
    user?.designation ||
    "Department Head";

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(fullName);

  return (
    <div className="relative">
      {/* PROFILE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          px-2
          py-1.5
          hover:bg-slate-100
          dark:hover:bg-slate-800
          transition
        "
      >
        {/* PROFILE PHOTO */}
        <div
          className="
            w-11
            h-11
            rounded-full
            overflow-hidden
            border-2
            border-blue-500
            flex
            items-center
            justify-center
            flex-shrink-0
            bg-gradient-to-br
            from-blue-500
            to-purple-600
          "
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-white font-bold text-sm">
              {initials}
            </span>
          )}
        </div>

        {/* NAME */}
        <div className="hidden sm:block text-left">
          <p className="font-semibold text-slate-800 dark:text-white">
            {fullName}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {role}
          </p>
        </div>

        <FaChevronDown
          className={`
            text-slate-600
            dark:text-slate-300
            text-sm
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute
            right-0
            top-14
            w-80
            bg-white
            dark:bg-slate-900
            rounded-2xl
            shadow-2xl
            border
            border-slate-200
            dark:border-slate-700
            overflow-hidden
            z-50
          "
        >
          {/* HEADER */}
          <div
            className="
              px-5
              py-5
              bg-gradient-to-r
              from-blue-600
              to-purple-600
              text-white
            "
          >
            <div className="flex items-center gap-3">

              {/* DROPDOWN PROFILE PHOTO */}
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  overflow-hidden
                  border-2
                  border-white
                  flex
                  items-center
                  justify-center
                  bg-white/20
                  flex-shrink-0
                "
              >
               {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling.style.display = "flex";
                }}
              />
            ) : null}

            <span
              className={`text-white font-bold text-sm ${
                profilePhoto ? "hidden" : "flex"
              } items-center justify-center w-full h-full`}
            >
              {initials}
            </span>
              </div>

              <div className="min-w-0">
                <p className="font-bold text-lg truncate">
                  {fullName}
                </p>

                <p className="text-sm text-blue-100 truncate">
                  {email}
                </p>
              </div>

            </div>
          </div>

          {/* MY PROFILE */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-5
              py-4
              text-left
              text-slate-700
              dark:text-slate-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition
            "
          >
            <FaUser />
            <span>My Profile</span>
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-5
              py-4
              text-left
              text-slate-700
              dark:text-slate-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition
            "
          >
            <FaCog />
            <span>Settings</span>
          </button>

          {/* CHANGE PASSWORD */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/change-password");
            }}
            className="
              w-full
              flex
              items-center
              gap-4
              px-5
              py-4
              text-left
              text-slate-700
              dark:text-slate-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition
            "
          >
            <FaKey />
            <span>Change Password</span>
          </button>

          {/* DIVIDER */}
          <div className="border-t border-slate-200 dark:border-slate-700" />

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="
              w-full
              flex
              items-center
              gap-4
              px-5
              py-4
              text-left
              text-red-600
              dark:text-red-400
              hover:bg-red-50
              dark:hover:bg-red-950/30
              transition
            "
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;