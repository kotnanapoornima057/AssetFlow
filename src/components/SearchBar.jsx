import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import api from "../services/api";

function SearchBar() {
  const navigate = useNavigate();

  const wrapperRef = useRef(null);

  const [query, setQuery] = useState("");

  const [showResults, setShowResults] = useState(false);

  const [results, setResults] = useState({
    assets: [],
    users: [],
    departments: [],
    categories: [],
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  // Search
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
        const res = await api.get(
          `/search?query=${encodeURIComponent(query)}`
        );

        setResults(res.data);

        setShowResults(true);
      } catch (err) {
        console.log(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const openPage = (page) => {
    setQuery("");
    setShowResults(false);
    navigate(page);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
    >
      <div className="relative">

        <FaSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={query}
          placeholder="Search assets, users, departments..."
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="
            w-full
            h-11
            rounded-full
            border
            border-gray-300
            bg-gray-50
            pl-11
            pr-4
            text-sm
            outline-none
            transition-all
            duration-200
            focus:bg-white
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-100
          "
        />
      </div>

      {showResults && query && (
        <div
          className="
            absolute
            top-14
            left-0
            w-full
            bg-white
            rounded-xl
            shadow-2xl
            border
            overflow-hidden
            max-h-96
            overflow-y-auto
            z-50
          "
        >
          {results.assets.length > 0 && (
            <>
              <div className="bg-gray-100 px-4 py-2 font-semibold">
                Assets
              </div>

              {results.assets.map((asset) => (
                <div
                  key={asset.asset_id}
                  onClick={() => openPage("/assets")}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                >
                  📦 {asset.asset_name} ({asset.asset_tag})
                </div>
              ))}
            </>
          )}

          {results.users.length > 0 && (
            <>
              <div className="bg-gray-100 px-4 py-2 font-semibold">
                Users
              </div>

              {results.users.map((user) => (
                <div
                  key={user.user_id}
                  onClick={() => openPage("/users")}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                >
                  👤 {user.full_name}
                </div>
              ))}
            </>
          )}

          {results.departments.length > 0 && (
            <>
              <div className="bg-gray-100 px-4 py-2 font-semibold">
                Departments
              </div>

              {results.departments.map((dept) => (
                <div
                  key={dept.department_id}
                  onClick={() => openPage("/departments")}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                >
                  🏢 {dept.department_name}
                </div>
              ))}
            </>
          )}

          {results.categories.length > 0 && (
            <>
              <div className="bg-gray-100 px-4 py-2 font-semibold">
                Categories
              </div>

              {results.categories.map((cat) => (
                <div
                  key={cat.category_id}
                  onClick={() => openPage("/categories")}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                >
                  🏷️ {cat.category_name}
                </div>
              ))}
            </>
          )}

          {results.assets.length === 0 &&
            results.users.length === 0 &&
            results.departments.length === 0 &&
            results.categories.length === 0 && (
              <div className="p-5 text-center text-gray-500">
                No matching results found
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;