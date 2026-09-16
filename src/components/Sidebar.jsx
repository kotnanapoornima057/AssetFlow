import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBoxes,
  FaUsers,
  FaBuilding,
  FaTools,
  FaClipboardList,
  FaCalendarCheck,
  FaExchangeAlt,
  FaHistory,
  FaChartBar,
  FaClipboardCheck,
  FaTimes,
  FaLayerGroup,
} from "react-icons/fa";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";

function Sidebar() {
  const location = useLocation();
  const { isOpen, close } = useSidebar();
  const { darkMode } = useTheme();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const sections = [
    {
      title: "MAIN",
      links: [
        { to: "/dashboard", label: "Dashboard", icon: <FaHome />, roles: null },
      ],
    },

    {
      title: "ASSET MANAGEMENT",
      links: [
        { to: "/assets", label: "Assets", icon: <FaBoxes />, roles: null },
        {
          to: "/allocations",
          label: "Allocations",
          icon: <FaExchangeAlt />,
          roles: ["Admin", "Asset Manager"],
        },
        {
          to: "/transfers",
          label: "Transfers",
          icon: <FaExchangeAlt />,
          roles: ["Admin", "Asset Manager"],
        },
        {
          to: "/audits",
          label: "Audits",
          icon: <FaClipboardCheck />,
          roles: ["Admin", "Asset Manager"],
        },
        {
          to: "/my-assets",
          label: "My Assets",
          icon: <FaBoxes />,
          roles: ["Employee"],
        },
        {
          to: "/department-assets",
          label: "Department Assets",
          icon: <FaBuilding />,
          roles: ["Department Head"],
        },
      ],
    },

    {
      title: "ADMINISTRATION",
      links: [
        {
          to: "/departments",
          label: "Departments",
          icon: <FaBuilding />,
          roles: ["Admin"],
        },
        {
          to: "/categories",
          label: "Categories",
          icon: <FaClipboardList />,
          roles: ["Admin", "Asset Manager"],
        },
        {
          to: "/users",
          label: "Users",
          icon: <FaUsers />,
          roles: ["Admin"],
        },
      ],
    },

    {
      title: "OPERATIONS",
      links: [
        {
          to: "/bookings",
          label: "Bookings",
          icon: <FaCalendarCheck />,
          roles: null,
        },
        {
          to: "/maintenance",
          label: "Maintenance",
          icon: <FaTools />,
          roles: null,
        },
      ],
    },

    {
      title: "ANALYTICS",
      links: [
        {
          to: "/reports",
          label: "Reports",
          icon: <FaChartBar />,
          roles: null,
        },
        {
          to: "/activity",
          label: "Activity Logs",
          icon: <FaHistory />,
          roles: null,
        },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
          <div
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 xl:hidden"
          />
        )}

      <aside
      className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      xl:translate-x-0`}
        style={{
          background: darkMode
            ? "linear-gradient(180deg,#020617,#0f172a,#1e293b)"
            : "linear-gradient(180deg,#0f172a,#1e3a8a,#2563eb)",
        }}
      >
        {/* Header */}

        <div className="px-6 py-7 border-b border-white/10 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl text-white">
              <FaLayerGroup />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-white tracking-wide">
                AssetFlow
              </h1>

              <p className="text-xs text-slate-300">
                Enterprise Asset Management
              </p>

            </div>

          </div>

          <button
            onClick={close}
            className="xl:hidden text-white text-xl"
          >
            <FaTimes />
          </button>

        </div>

        {/* User */}

        <div className="px-6 py-5 border-b border-white/10">

          <div className="flex items-center gap-3">

            {user?.profile_photo ? (
              <img
                src={`http://localhost:5000/uploads/profiles/${user.profile_photo}`}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl text-white">
                {user?.full_name?.charAt(0)}
              </div>
            )}

            <div>

              <div className="font-semibold text-white">
                {user?.full_name}
              </div>

              <div className="text-xs text-slate-300">
                {role}
              </div>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <div className="overflow-y-auto h-[calc(100vh-170px)] px-3 py-4">

          {sections.map((section) => {

            const visible = section.links.filter(
              (link) => !link.roles || link.roles.includes(role)
            );

            if (visible.length === 0) return null;

            return (
              <div
                key={section.title}
                className="mb-7"
              >

                <h3 className="text-xs uppercase tracking-widest text-slate-300 px-3 mb-2">
                  {section.title}
                </h3>

                {visible.map((link) => {

                  const active = location.pathname === link.to;

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={close}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl mb-1 transition-all duration-300
                      ${
                        active
                          ? "bg-white text-blue-700 shadow-lg font-semibold"
                          : "text-slate-200 hover:bg-white/10 hover:translate-x-1"
                      }`}
                    >
                      <span className="text-lg">
                        {link.icon}
                      </span>

                      {link.label}

                    </Link>
                  );

                })}

              </div>
            );

          })}

        </div>

      </aside>
    </>
  );
}

export default Sidebar;