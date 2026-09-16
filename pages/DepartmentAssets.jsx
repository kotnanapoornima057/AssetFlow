import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DepartmentAssets() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const loadDeptAllocations = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/allocations/department/${currentUser?.department_id}`
      );

      setAllocations(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.department_id) {
      loadDeptAllocations();
    } else {
      setLoading(false);
    }
  }, []);

  // =========================
  // STATISTICS
  // =========================

  const totalAssets = allocations.length;

  const activeAssets = useMemo(() => {
    return allocations.filter(
      (al) =>
        al.allocation_status?.toLowerCase() === "allocated"
    ).length;
  }, [allocations]);

  const returnedAssets = useMemo(() => {
    return allocations.filter(
      (al) =>
        al.allocation_status?.toLowerCase() === "returned"
    ).length;
  }, [allocations]);

  const pendingReturns = useMemo(() => {
    const today = new Date();

    return allocations.filter((al) => {
      if (
        al.allocation_status?.toLowerCase() !== "allocated" ||
        !al.expected_return
      ) {
        return false;
      }

      return new Date(al.expected_return) < today;
    }).length;
  }, [allocations]);

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "allocated":
        return {
          wrapper:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          dot: "bg-blue-500",
        };

      case "returned":
        return {
          wrapper:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
          dot: "bg-green-500",
        };

      default:
        return {
          wrapper:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          dot: "bg-slate-500",
        };
    }
  };

  // =========================
  // DATE FORMATTER
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // COMMON STYLES
  // =========================

  const glass =
    "rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        className="
          flex
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

        <div className="flex-1 md:ml-72">
          <Navbar />

          <main
            className="
              mt-24
              max-w-[1800px]
              mx-auto
              px-4
              sm:px-6
              lg:px-8
              pb-10
            "
          >
            <div className={`${glass} p-10 text-center`}>
              <div
                className="
                  mx-auto
                  w-16
                  h-16
                  rounded-2xl
                  bg-blue-100
                  dark:bg-blue-900/30
                  flex
                  items-center
                  justify-center
                  text-3xl
                  mb-5
                "
              >
                🏢
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Loading Department Assets...
              </h2>

              <p className={`${muted} mt-2`}>
                Please wait while your department assets are being loaded.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        flex
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
      {/* ================= SIDEBAR ================= */}

      <Sidebar />

      {/* ================= MAIN ================= */}

      <div className="flex-1 md:ml-72">
        <Navbar />

        <main
          className="
            mt-24
            max-w-[1800px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            pb-10
          "
        >
          {/* ================= HERO ================= */}

          <section
            className="
              relative
              overflow-hidden
              rounded-3xl
              bg-white
              dark:bg-slate-900
              border
              border-slate-200
              dark:border-slate-700
              shadow-xl
              px-6
              py-8
              sm:px-8
              sm:py-10
              lg:px-12
              mb-8
            "
          >
            {/* Background decoration */}

            <div
              className="
                absolute
                -top-24
                -right-20
                w-72
                h-72
                bg-blue-500/20
                rounded-full
                blur-3xl
              "
            />

            <div
              className="
                absolute
                -bottom-24
                -left-20
                w-72
                h-72
                bg-cyan-500/20
                rounded-full
                blur-3xl
              "
            />

            <div className="relative z-10">
              <div
                className="
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-6
                "
              >
                <div>
                  <p
                    className="
                      uppercase
                      tracking-[0.25em]
                      text-xs
                      sm:text-sm
                      text-blue-600
                      dark:text-blue-400
                      font-semibold
                    "
                  >
                    Department Management
                  </p>

                  <h1
                    className="
                      mt-3
                      text-3xl
                      sm:text-4xl
                      lg:text-5xl
                      font-extrabold
                      text-slate-900
                      dark:text-white
                      leading-tight
                    "
                  >
                    Department Assets
                  </h1>

                  <p
                    className={`${muted} mt-4 text-sm sm:text-base lg:text-lg max-w-2xl`}
                  >
                    View and monitor assets currently allocated within
                    your department.
                  </p>
                </div>

                {/* Department Badge */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    px-5
                    py-4
                    rounded-2xl
                    bg-blue-50
                    dark:bg-blue-900/20
                    border
                    border-blue-100
                    dark:border-blue-900/40
                  "
                >
                  <div
                    className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-blue-600
                      flex
                      items-center
                      justify-center
                      text-white
                      text-xl
                      shadow-lg
                    "
                  >
                    🏢
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Department
                    </p>

                    <p className="font-bold text-slate-900 dark:text-white">
                      Department #{currentUser?.department_id || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= STATISTICS ================= */}

          <section
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
              mb-8
            "
          >
            {/* Total */}

            <div
              className="
                rounded-3xl
                bg-white
                dark:bg-slate-900
                border
                border-slate-200
                dark:border-slate-700
                shadow-xl
                p-6
                relative
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  -right-8
                  -top-8
                  w-24
                  h-24
                  rounded-full
                  bg-blue-500/10
                "
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className={muted}>
                    Total Allocations
                  </p>

                  <h2
                    className="
                      mt-3
                      text-4xl
                      font-extrabold
                      text-blue-600
                    "
                  >
                    {totalAssets}
                  </h2>

                  <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    Department asset records
                  </p>
                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-blue-100
                    dark:bg-blue-900/30
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  📦
                </div>
              </div>
            </div>

            {/* Active */}

            <div
              className="
                rounded-3xl
                bg-white
                dark:bg-slate-900
                border
                border-slate-200
                dark:border-slate-700
                shadow-xl
                p-6
                relative
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  -right-8
                  -top-8
                  w-24
                  h-24
                  rounded-full
                  bg-green-500/10
                "
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className={muted}>
                    Active Assets
                  </p>

                  <h2
                    className="
                      mt-3
                      text-4xl
                      font-extrabold
                      text-green-600
                    "
                  >
                    {activeAssets}
                  </h2>

                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Currently allocated
                  </p>
                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-green-100
                    dark:bg-green-900/30
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  ✅
                </div>
              </div>
            </div>

            {/* Returned */}

            <div
              className="
                rounded-3xl
                bg-white
                dark:bg-slate-900
                border
                border-slate-200
                dark:border-slate-700
                shadow-xl
                p-6
                relative
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  -right-8
                  -top-8
                  w-24
                  h-24
                  rounded-full
                  bg-violet-500/10
                "
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className={muted}>
                    Returned
                  </p>

                  <h2
                    className="
                      mt-3
                      text-4xl
                      font-extrabold
                      text-violet-600
                    "
                  >
                    {returnedAssets}
                  </h2>

                  <p className="mt-2 text-sm text-violet-600 dark:text-violet-400">
                    Completed allocations
                  </p>
                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-violet-100
                    dark:bg-violet-900/30
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  ↩️
                </div>
              </div>
            </div>

            {/* Overdue */}

            <div
              className="
                rounded-3xl
                bg-white
                dark:bg-slate-900
                border
                border-slate-200
                dark:border-slate-700
                shadow-xl
                p-6
                relative
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  -right-8
                  -top-8
                  w-24
                  h-24
                  rounded-full
                  bg-red-500/10
                "
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className={muted}>
                    Overdue Returns
                  </p>

                  <h2
                    className="
                      mt-3
                      text-4xl
                      font-extrabold
                      text-red-600
                    "
                  >
                    {pendingReturns}
                  </h2>

                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Requires attention
                  </p>
                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-red-100
                    dark:bg-red-900/30
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  ⚠️
                </div>
              </div>
            </div>
          </section>

          {/* ================= ASSET TABLE ================= */}

          <section className={glass}>
            {/* Header */}

            <div
              className="
                px-6
                sm:px-8
                py-6
                border-b
                border-slate-200
                dark:border-slate-700
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >
                <div>
                  <h2
                    className="
                      text-2xl
                      sm:text-3xl
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Allocated Assets
                  </h2>

                  <p className={`${muted} mt-2`}>
                    Assets assigned to employees within your department.
                  </p>
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    bg-blue-50
                    dark:bg-blue-900/20
                    text-blue-700
                    dark:text-blue-300
                    font-semibold
                    text-sm
                  "
                >
                  📦 {totalAssets} Records
                </div>
              </div>
            </div>

            {/* Empty State */}

            {allocations.length === 0 ? (
              <div className="p-8 sm:p-12">
                <div
                  className="
                    rounded-3xl
                    bg-slate-50
                    dark:bg-slate-800/60
                    border
                    border-slate-200
                    dark:border-slate-700
                    py-16
                    px-6
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      w-20
                      h-20
                      rounded-3xl
                      bg-blue-100
                      dark:bg-blue-900/30
                      flex
                      items-center
                      justify-center
                      text-4xl
                      mb-5
                    "
                  >
                    📦
                  </div>

                  <h3
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    No Department Assets
                  </h3>

                  <p
                    className={`${muted} mt-2 max-w-md mx-auto`}
                  >
                    There are currently no assets allocated within your
                    department.
                  </p>

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      mt-5
                      px-4
                      py-2
                      rounded-xl
                      bg-green-100
                      dark:bg-green-900/30
                      text-green-700
                      dark:text-green-300
                      font-semibold
                      text-sm
                    "
                  >
                    ✓ All Clear
                  </div>
                </div>
              </div>
            ) : (
              /* Table */

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr
                        className="
                          bg-slate-100
                          dark:bg-slate-800
                          text-left
                        "
                      >
                        <th
                          className="
                            px-5
                            py-4
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-600
                            dark:text-slate-300
                            rounded-l-2xl
                          "
                        >
                          Asset
                        </th>

                        <th
                          className="
                            px-5
                            py-4
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          Allocated To
                        </th>

                        <th
                          className="
                            px-5
                            py-4
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          Allocated Date
                        </th>

                        <th
                          className="
                            px-5
                            py-4
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          Expected Return
                        </th>

                        <th
                          className="
                            px-5
                            py-4
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-600
                            dark:text-slate-300
                            rounded-r-2xl
                          "
                        >
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {allocations.map((al) => {
                        const statusStyle = getStatusStyle(
                          al.allocation_status
                        );

                        return (
                          <tr
                            key={al.allocation_id}
                            className="
                              border-b
                              border-slate-200
                              dark:border-slate-700
                              hover:bg-slate-50
                              dark:hover:bg-slate-800/50
                              transition
                            "
                          >
                            {/* Asset */}

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-4">
                                <div
                                  className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-blue-100
                                    dark:bg-blue-900/30
                                    flex
                                    items-center
                                    justify-center
                                    text-xl
                                  "
                                >
                                  💻
                                </div>

                                <div>
                                  <p
                                    className="
                                      font-bold
                                      text-slate-900
                                      dark:text-white
                                    "
                                  >
                                    {al.asset_name}
                                  </p>

                                  <span
                                    className="
                                      inline-flex
                                      mt-1
                                      px-2.5
                                      py-1
                                      rounded-lg
                                      bg-slate-100
                                      dark:bg-slate-800
                                      text-slate-600
                                      dark:text-slate-300
                                      text-xs
                                      font-semibold
                                    "
                                  >
                                    {al.asset_tag}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Employee */}

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="
                                    w-10
                                    h-10
                                    rounded-full
                                    bg-gradient-to-br
                                    from-blue-500
                                    to-indigo-600
                                    flex
                                    items-center
                                    justify-center
                                    text-white
                                    font-bold
                                  "
                                >
                                  {al.full_name
                                    ? al.full_name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "?"}
                                </div>

                                <span
                                  className="
                                    font-semibold
                                    text-slate-800
                                    dark:text-slate-200
                                  "
                                >
                                  {al.full_name || "-"}
                                </span>
                              </div>
                            </td>

                            {/* Allocated Date */}

                            <td
                              className="
                                px-5
                                py-5
                                text-slate-600
                                dark:text-slate-400
                                font-medium
                              "
                            >
                              {formatDate(al.allocated_date)}
                            </td>

                            {/* Expected Return */}

                            <td className="px-5 py-5">
                              <span
                                className="
                                  text-slate-700
                                  dark:text-slate-300
                                  font-medium
                                "
                              >
                                {formatDate(al.expected_return)}
                              </span>
                            </td>

                            {/* Status */}

                            <td className="px-5 py-5">
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-3
                                  py-1.5
                                  rounded-full
                                  text-sm
                                  font-bold
                                  ${statusStyle.wrapper}
                                `}
                              >
                                <span
                                  className={`
                                    w-2
                                    h-2
                                    rounded-full
                                    ${statusStyle.dot}
                                  `}
                                />

                                {al.allocation_status || "Unknown"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default DepartmentAssets;