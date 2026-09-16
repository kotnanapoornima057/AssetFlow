import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaHistory,
  FaUser,
  FaClock,
  FaClipboardList,
} from "react-icons/fa";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { useTheme } from "../context/ThemeContext";

function ActivityLogs() {
  const { darkMode } = useTheme();

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get("/activity");

      // Keep newest activities first
      setLogs(
        [...res.data].sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= STYLES ================= */

  const glass =
    "rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  /* ================= FILTER ================= */

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        String(log.user_name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(log.action || "")
          .toLowerCase()
          .includes(searchText) ||
        String(log.description || "")
          .toLowerCase()
          .includes(searchText);

      const matchesAction =
        !actionFilter ||
        log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const actions = [
    ...new Set(
      logs
        .map((log) => log.action)
        .filter(Boolean)
    ),
  ];

  /* ================= STATISTICS ================= */

  const uniqueUsers = new Set(
    logs
      .map((log) => log.user_name)
      .filter(Boolean)
  ).size;

  const uniqueActions = new Set(
    logs
      .map((log) => log.action)
      .filter(Boolean)
  ).size;

  const todayLogs = logs.filter((log) => {
    const logDate = new Date(log.created_at);
    const today = new Date();

    return (
      logDate.toDateString() === today.toDateString()
    );
  }).length;

  /* ================= ACTION STYLE ================= */

  const getActionStyle = (action) => {
    const value = String(action || "").toLowerCase();

    if (
      value.includes("create") ||
      value.includes("add") ||
      value.includes("register")
    ) {
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-300",
      };
    }

    if (
      value.includes("update") ||
      value.includes("edit")
    ) {
      return {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-300",
      };
    }

    if (value.includes("delete")) {
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
      };
    }

    if (
      value.includes("allocate") ||
      value.includes("transfer")
    ) {
      return {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-300",
      };
    }

    if (
      value.includes("maintenance") ||
      value.includes("repair")
    ) {
      return {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-700 dark:text-orange-300",
      };
    }

    return {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
    };
  };

  /* ================= DATE ================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= LOADING ================= */

  if (!logs) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

        <Sidebar />

        <div className="flex-1 md:ml-72">

          <Navbar />

          <div className="mt-24 p-8">
            <div className={`${glass} p-10 text-center`}>
              <FaHistory className="mx-auto text-4xl text-blue-600 mb-4" />

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Loading Activity Logs...
              </h2>
            </div>
          </div>

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

      <Sidebar />

      <div className="flex-1 md:ml-72">

        <Navbar />

        <div
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

          <div
            className={`
              ${glass}
              relative
              overflow-hidden
              mb-8
              px-6
              py-8
              sm:px-8
              sm:py-10
              lg:px-12
            `}
          >

            {/* Background blobs */}

            <div
              className="
                absolute
                -top-20
                -right-16
                w-60
                h-60
                sm:w-72
                sm:h-72
                bg-blue-500/20
                rounded-full
                blur-3xl
              "
            />

            <div
              className="
                absolute
                -bottom-20
                -left-16
                w-60
                h-60
                sm:w-72
                sm:h-72
                bg-cyan-500/20
                rounded-full
                blur-3xl
              "
            />

            <div
              className="
                relative
                z-10
                flex
                flex-col
                xl:flex-row
                justify-between
                items-start
                xl:items-center
                gap-8
              "
            >

              {/* Left */}

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
                  Enterprise Asset Management
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
                  Activity Logs
                </h1>

                <p
                  className={`
                    ${muted}
                    mt-4
                    text-sm
                    sm:text-base
                    lg:text-lg
                    max-w-2xl
                  `}
                >
                  Track and monitor important activities performed
                  across the AssetFlow system.
                </p>

              </div>

              {/* Icon */}

              <div
                className="
                  hidden
                  lg:flex
                  items-center
                  justify-center
                  w-24
                  h-24
                  rounded-3xl
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-700
                  text-white
                  text-4xl
                  shadow-xl
                "
              >
                <FaHistory />
              </div>

            </div>

          </div>

          {/* ================= STATISTICS ================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4
              gap-5
              mb-8
            "
          >

            {/* Total Logs */}

            <div className={`${glass} p-6`}>

              <div className="flex items-center justify-between">

                <div>

                  <p className={muted}>
                    Total Activities
                  </p>

                  <h2
                    className="
                      mt-2
                      text-3xl
                      font-bold
                      text-blue-600
                    "
                  >
                    {logs.length}
                  </h2>

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
                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  <FaHistory />
                </div>

              </div>

            </div>

            {/* Today */}

            <div className={`${glass} p-6`}>

              <div className="flex items-center justify-between">

                <div>

                  <p className={muted}>
                    Today's Activities
                  </p>

                  <h2
                    className="
                      mt-2
                      text-3xl
                      font-bold
                      text-green-600
                    "
                  >
                    {todayLogs}
                  </h2>

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
                    text-green-600
                  "
                >
                  <FaClock />
                </div>

              </div>

            </div>

            {/* Users */}

            <div className={`${glass} p-6`}>

              <div className="flex items-center justify-between">

                <div>

                  <p className={muted}>
                    Active Users
                  </p>

                  <h2
                    className="
                      mt-2
                      text-3xl
                      font-bold
                      text-purple-600
                    "
                  >
                    {uniqueUsers}
                  </h2>

                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-purple-100
                    dark:bg-purple-900/30
                    flex
                    items-center
                    justify-center
                    text-purple-600
                  "
                >
                  <FaUser />
                </div>

              </div>

            </div>

            {/* Action Types */}

            <div className={`${glass} p-6`}>

              <div className="flex items-center justify-between">

                <div>

                  <p className={muted}>
                    Action Types
                  </p>

                  <h2
                    className="
                      mt-2
                      text-3xl
                      font-bold
                      text-orange-600
                    "
                  >
                    {uniqueActions}
                  </h2>

                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-orange-100
                    dark:bg-orange-900/30
                    flex
                    items-center
                    justify-center
                    text-orange-600
                  "
                >
                  <FaClipboardList />
                </div>

              </div>

            </div>

          </div>

          {/* ================= SEARCH & FILTER ================= */}

          <div className={`${glass} p-5 sm:p-8 mb-8`}>

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                gap-3
                mb-6
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-blue-100
                  dark:bg-slate-800
                  flex
                  items-center
                  justify-center
                "
              >
                <FaSearch
                  className="
                    text-blue-600
                    dark:text-blue-400
                    text-xl
                  "
                />
              </div>

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
                  Search & Filters
                </h2>

                <p className={`${muted} mt-1`}>
                  Quickly find activities from the system logs.
                </p>

              </div>

            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
              "
            >

              {/* Search */}

              <div>

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search user, action or description..."
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-800
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    px-5
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>

              {/* Action */}

              <div>

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Action
                </label>

                <select
                  value={actionFilter}
                  onChange={(e) =>
                    setActionFilter(e.target.value)
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-800
                    text-slate-900
                    dark:text-white
                    px-5
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                >

                  <option value="">
                    All Actions
                  </option>

                  {actions.map((action) => (
                    <option
                      key={action}
                      value={action}
                    >
                      {action}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* Active filters */}

            {(search || actionFilter) && (

              <div className="mt-6 flex flex-wrap gap-3">

                {search && (
                  <span
                    className="
                      px-4
                      py-2
                      rounded-full
                      bg-blue-100
                      dark:bg-blue-900
                      text-blue-700
                      dark:text-blue-300
                      text-sm
                    "
                  >
                    Search: {search}
                  </span>
                )}

                {actionFilter && (
                  <span
                    className="
                      px-4
                      py-2
                      rounded-full
                      bg-purple-100
                      dark:bg-purple-900
                      text-purple-700
                      dark:text-purple-300
                      text-sm
                    "
                  >
                    Action: {actionFilter}
                  </span>
                )}

                <button
                  onClick={() => {
                    setSearch("");
                    setActionFilter("");
                  }}
                  className="
                    px-4
                    py-2
                    rounded-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    text-sm
                    transition
                  "
                >
                  Clear Filters
                </button>

              </div>

            )}

          </div>

          {/* ================= ACTIVITY LOGS ================= */}

          <div className={`${glass} overflow-hidden`}>

            {/* Header */}

            <div
              className="
                px-5
                sm:px-8
                py-6
                border-b
                border-slate-200
                dark:border-slate-700
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
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
                  System Activity
                </h2>

                <p className={`${muted} mt-2`}>
                  Monitor recent actions performed in AssetFlow.
                </p>

              </div>

              <span
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-blue-100
                  dark:bg-slate-800
                  text-blue-700
                  dark:text-blue-300
                  font-semibold
                  w-fit
                "
              >
                {filteredLogs.length} Activities
              </span>

            </div>

            {/* ================= DESKTOP TABLE ================= */}

            <div className="hidden xl:block overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead
                  className="
                    bg-slate-100
                    dark:bg-slate-800
                  "
                >

                  <tr
                    className="
                      text-left
                      text-sm
                      font-bold
                      uppercase
                      tracking-wide
                    "
                  >

                    <th className="px-6 py-5">
                      User
                    </th>

                    <th className="px-6 py-5">
                      Action
                    </th>

                    <th className="px-6 py-5">
                      Description
                    </th>

                    <th className="px-6 py-5">
                      Date & Time
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredLogs.map((log) => {

                    const actionStyle =
                      getActionStyle(log.action);

                    return (
                      <tr
                        key={log.log_id}
                        className="
                          border-b
                          border-slate-200
                          dark:border-slate-700
                          hover:bg-slate-50
                          dark:hover:bg-slate-800/40
                          transition
                        "
                      >

                        {/* User */}

                        <td className="px-6 py-6">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                w-10
                                h-10
                                rounded-xl
                                bg-blue-100
                                dark:bg-blue-900/30
                                flex
                                items-center
                                justify-center
                                text-blue-600
                                dark:text-blue-400
                              "
                            >
                              <FaUser />
                            </div>

                            <div>

                              <p
                                className="
                                  font-semibold
                                  text-slate-900
                                  dark:text-white
                                "
                              >
                                {log.user_name || "Unknown User"}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                User Activity
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Action */}

                        <td className="px-6 py-6">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1.5
                              rounded-xl
                              font-bold
                              text-sm
                              ${actionStyle.bg}
                              ${actionStyle.text}
                            `}
                          >
                            {log.action || "-"}
                          </span>

                        </td>

                        {/* Description */}

                        <td
                          className="
                            px-6
                            py-6
                            max-w-xl
                            text-slate-700
                            dark:text-slate-300
                          "
                        >
                          {log.description || "-"}
                        </td>

                        {/* Date */}

                        <td className="px-6 py-6">

                          <div className="flex items-center gap-2">

                            <FaClock
                              className="
                                text-slate-400
                              "
                            />

                            <span
                              className="
                                text-sm
                                font-medium
                                text-slate-700
                                dark:text-slate-300
                              "
                            >
                              {formatDate(log.created_at)}
                            </span>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

            {/* ================= MOBILE / TABLET ================= */}

            <div
              className="
                xl:hidden
                p-5
                space-y-5
              "
            >

              {filteredLogs.map((log) => {

                const actionStyle =
                  getActionStyle(log.action);

                return (
                  <div
                    key={log.log_id}
                    className="
                      rounded-3xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-white
                      dark:bg-slate-900
                      shadow-lg
                      p-5
                    "
                  >

                    {/* Header */}

                    <div className="flex items-start gap-4">

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
                          text-blue-600
                          dark:text-blue-400
                          flex-shrink-0
                        "
                      >
                        <FaUser />
                      </div>

                      <div className="flex-1">

                        <h3
                          className="
                            text-lg
                            font-bold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          {log.user_name || "Unknown User"}
                        </h3>

                        <span
                          className={`
                            inline-flex
                            mt-2
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-bold
                            ${actionStyle.bg}
                            ${actionStyle.text}
                          `}
                        >
                          {log.action || "-"}
                        </span>

                      </div>

                    </div>

                    {/* Description */}

                    <div className="mt-5">

                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                        Description
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-700
                          dark:text-slate-300
                        "
                      >
                        {log.description || "-"}
                      </p>

                    </div>

                    {/* Date */}

                    <div
                      className="
                        mt-5
                        pt-4
                        border-t
                        border-slate-200
                        dark:border-slate-700
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >

                      <FaClock />

                      <span>
                        {formatDate(log.created_at)}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* ================= EMPTY STATE ================= */}

            {filteredLogs.length === 0 && (

              <div className="p-12 text-center">

                <div
                  className="
                    mx-auto
                    w-20
                    h-20
                    rounded-full
                    bg-slate-200
                    dark:bg-slate-800
                    flex
                    items-center
                    justify-center
                    text-3xl
                    text-slate-500
                  "
                >
                  <FaHistory />
                </div>

                <h3
                  className="
                    mt-5
                    text-2xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  No Activity Found
                </h3>

                <p className={`${muted} mt-2`}>
                  Try changing your search or filters.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default ActivityLogs;