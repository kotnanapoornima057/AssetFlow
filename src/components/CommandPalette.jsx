import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  FaBox,
  FaUsers,
  FaBuilding,
  FaTools,
  FaCalendarAlt,
  FaExchangeAlt,
} from "react-icons/fa";

import SearchResult from "./SearchResult";

function CommandPalette() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [results, setResults] = useState({
    assets: [],
    users: [],
    departments: [],
    categories: [],
  });

  //---------------------------------------------------
  // Static Module List
  //---------------------------------------------------

  const items = [
    {
      title: "Assets",
      subtitle: "Manage Company Assets",
      icon: <FaBox />,
      path: "/assets",
    },
    {
      title: "Employees",
      subtitle: "Employee Directory",
      icon: <FaUsers />,
      path: "/users",
    },
    {
      title: "Departments",
      subtitle: "Department Management",
      icon: <FaBuilding />,
      path: "/departments",
    },
    {
      title: "Maintenance",
      subtitle: "Maintenance Requests",
      icon: <FaTools />,
      path: "/maintenance",
    },
    {
      title: "Bookings",
      subtitle: "Meeting Rooms & Resources",
      icon: <FaCalendarAlt />,
      path: "/bookings",
    },
    {
      title: "Transfers",
      subtitle: "Transfer Requests",
      icon: <FaExchangeAlt />,
      path: "/transfers",
    },
  ];

  //---------------------------------------------------
  // Search Modules
  //---------------------------------------------------

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  //---------------------------------------------------
  // Global Backend Search
  //---------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults({
          assets: [],
          users: [],
          departments: [],
          categories: [],
        });
        return;
      }

      try {
        const res = await api.get(`/search?query=${query}`);
        setResults(res.data);
      } catch (err) {
        console.log(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  //---------------------------------------------------
  // Keyboard Shortcut
  //---------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  //---------------------------------------------------
  // Navigate
  //---------------------------------------------------

  const openPage = (path) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-28 z-[9999]"
      onClick={() => {
        setOpen(false);
        setQuery("");
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[700px] max-w-[95%] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Box */}

        <div className="border-b p-5">
          <input
            autoFocus
            placeholder="Search anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full outline-none text-lg"
          />
        </div>

        {/* Results */}

        <div className="max-h-[500px] overflow-y-auto">

          {/* Modules */}

          <div className="p-2">
            <p className="text-xs text-gray-400 px-3 py-2 uppercase">
              Modules
            </p>

            {filteredItems.map((item) => (
              <SearchResult
                key={item.title}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onClick={() => openPage(item.path)}
              />
            ))}
          </div>

          {/* Assets */}

          {results.assets.length > 0 && (
            <>
              <p className="text-xs text-gray-400 px-5 pt-4 uppercase">
                Assets
              </p>

              {results.assets.map((asset) => (
                <SearchResult
                  key={asset.asset_id}
                  icon={<FaBox />}
                  title={asset.asset_name}
                  subtitle={`${asset.asset_tag} • ${asset.status}`}
                  onClick={() =>
                    openPage(`/assets?id=${asset.asset_id}`)
                  }
                />
              ))}
            </>
          )}

          {/* Users */}

          {results.users.length > 0 && (
            <>
              <p className="text-xs text-gray-400 px-5 pt-4 uppercase">
                Employees
              </p>

              {results.users.map((user) => (
                <SearchResult
                  key={user.user_id}
                  icon={<FaUsers />}
                  title={user.full_name}
                  subtitle={user.role}
                  onClick={() => openPage("/users")}
                />
              ))}
            </>
          )}

          {/* Departments */}

          {results.departments.length > 0 && (
            <>
              <p className="text-xs text-gray-400 px-5 pt-4 uppercase">
                Departments
              </p>

              {results.departments.map((dept) => (
                <SearchResult
                  key={dept.department_id}
                  icon={<FaBuilding />}
                  title={dept.department_name}
                  subtitle="Department"
                  onClick={() => openPage("/departments")}
                />
              ))}
            </>
          )}

          {/* Categories */}

          {results.categories.length > 0 && (
            <>
              <p className="text-xs text-gray-400 px-5 pt-4 uppercase">
                Categories
              </p>

              {results.categories.map((cat) => (
                <SearchResult
                  key={cat.category_id}
                  icon={<FaBox />}
                  title={cat.category_name}
                  subtitle="Asset Category"
                  onClick={() => openPage("/categories")}
                />
              ))}
            </>
          )}

          {filteredItems.length === 0 &&
            results.assets.length === 0 &&
            results.users.length === 0 &&
            results.departments.length === 0 &&
            results.categories.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No results found
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;