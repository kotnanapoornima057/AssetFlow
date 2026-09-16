import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBox,
  FaCheckCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaTools,
  FaExchangeAlt,
  FaBuilding,
  FaUsers,
  FaCalendarCheck,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";

import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CommandPalette from "../components/CommandPalette";

import StatsCard from "../components/StatsCard";
import AssetStatusChart from "../components/AssetStatusChart";
import AssetGrowthChart from "../components/AssetGrowthChart";
import CategoryChart from "../components/CategoryChart";
import LocationChart from "../components/LocationChart";
import DashboardCharts from "../components/DashboardCharts";
import NotificationsPanel from "../components/NotificationsPanel";
import AssetHealth from "../components/AssetHealth";

function Dashboard() {
  const navigate = useNavigate();

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const role = storedUser?.role
    ?.toLowerCase()
    ?.trim()
    ?.replace(/_/g, " ");

  /* =====================================================
     ROLE CHECKS
  ===================================================== */

  const isAdmin = role === "admin";

  const isAssetManager =
    role === "asset manager" ||
    role === "assetmanager";

  const isDepartmentHead =
    role === "department head" ||
    role === "departmenthead";

  const isEmployee =
    role === "employee" ||
    role === "user";

  /* =====================================================
     ROLE PERMISSIONS
  ===================================================== */

  const permissions = {
    canManageAssets:
      isAdmin || isAssetManager,

    canViewUsers:
      isAdmin || isDepartmentHead,

    canManageDepartments:
      isAdmin,

    canManageMaintenance:
      isAdmin ||
      isAssetManager ||
      isDepartmentHead,

    canManageTransfers:
      isAdmin ||
      isAssetManager,

    canBookResources: true,

    canViewAnalytics:
      isAdmin ||
      isAssetManager ||
      isDepartmentHead,

    canViewSystemSummary:
      isAdmin ||
      isAssetManager,

    canViewEmployees:
      isAdmin ||
      isDepartmentHead,

    canViewDepartments:
      isAdmin ||
      isDepartmentHead,

    canRegisterAsset:
      isAdmin ||
      isAssetManager,
  };

  /* =====================================================
     STATE
  ===================================================== */

  const [activities, setActivities] = useState([]);
  const [assets, setAssets] = useState([]);

  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    allocatedAssets: 0,
    overdueAssets: 0,
    pendingTransfers: 0,
    totalDepartments: 0,
    totalUsers: 0,
    pendingMaintenance: 0,
    maintenanceToday: 0,
    upcomingBookings: 0,
    overdueDetails: [],
    upcomingReturns: [],
  });

  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    loadStats();
    loadActivities();
    loadAssets();

    api
      .get("/bookings/check-reminders")
      .catch(() => {});
  }, []);

  /* =====================================================
     LOAD STATS
  ===================================================== */

  const loadStats = async () => {
    try {
      const res = await api.get("/dashboard");

      console.log("Dashboard API response:", res.data);

      const data = res.data || {};

      setStats((prev) => ({
        ...prev,
        ...data,

        overdueDetails: Array.isArray(
          data.overdueDetails
        )
          ? data.overdueDetails
          : [],

        upcomingReturns: Array.isArray(
          data.upcomingReturns
        )
          ? data.upcomingReturns
          : [],
      }));
    } catch (err) {
      console.error(
        "Dashboard stats error:",
        err
      );
    }
  };

  /* =====================================================
     LOAD ACTIVITIES
     
     IMPORTANT:
     API response is:
     
     {
       success: true,
       activities: [...]
     }

     Therefore we MUST use:
     
     res.data.activities
  ===================================================== */

  const loadActivities = async () => {
    try {
      const res = await api.get(
        "/dashboard/recent-activities"
      );

      console.log(
        "Recent activities API response:",
        res.data
      );

      const activityData =
        res.data?.activities;

      if (Array.isArray(activityData)) {
        setActivities(activityData);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error(
        "Activities error:",
        err
      );

      setActivities([]);
    }
  };

  /* =====================================================
     LOAD ASSETS
     
     API response is already:
     
     [
       {...},
       {...}
     ]
  ===================================================== */

  const loadAssets = async () => {
    try {
      const res = await api.get("/assets");

      console.log(
        "Assets API response:",
        res.data
      );

      if (Array.isArray(res.data)) {
        setAssets(res.data);
      } else {
        setAssets([]);
      }
    } catch (err) {
      console.error(
        "Assets error:",
        err
      );

      setAssets([]);
    }
  };

  /* =====================================================
     TOTAL ASSET VALUE
  ===================================================== */

  const totalValue = useMemo(() => {
    if (!Array.isArray(assets)) {
      return 0;
    }

    return assets.reduce(
      (sum, asset) =>
        sum +
        Number(
          asset?.purchase_cost || 0
        ),
      0
    );
  }, [assets]);

  /* =====================================================
     UI STYLES
  ===================================================== */

  const glass =
    "backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-slate-700 rounded-3xl shadow-xl";

  const sectionTitle =
    "text-3xl font-bold text-slate-800 dark:text-white";

  const muted =
    "text-slate-500 dark:text-slate-400";

  /* =====================================================
     ROLE BASED DASHBOARD CARDS
  ===================================================== */

  const dashboardCards = [
    {
      title: "Total Assets",
      value: stats.totalAssets,
      icon: <FaBox />,
      color:
        "bg-gradient-to-r from-blue-600 to-blue-400",
      change: 12,
      navigateTo: "/assets",
      visible: true,
    },

    {
      title: "Available Assets",
      value: stats.availableAssets,
      icon: <FaCheckCircle />,
      color:
        "bg-gradient-to-r from-green-600 to-green-400",
      change: 8,
      navigateTo: "/assets",
      state: {
        status: "Available",
      },
      visible: true,
    },

    {
      title: "Allocated Assets",
      value: stats.allocatedAssets,
      icon: <FaClipboardList />,
      color:
        "bg-gradient-to-r from-yellow-500 to-amber-300",
      change: 2,
      navigateTo: "/allocations",
      visible: true,
    },

    {
      title: "Overdue Assets",
      value: stats.overdueAssets,
      icon: <FaExclamationTriangle />,
      color:
        "bg-gradient-to-r from-red-600 to-pink-400",
      change: 4,
      navigateTo: "/allocations",
      visible:
        isAdmin ||
        isAssetManager ||
        isDepartmentHead,
    },

    {
      title: "Maintenance Today",
      value: stats.maintenanceToday,
      icon: <FaTools />,
      color:
        "bg-gradient-to-r from-orange-600 to-amber-400",
      change: 3,
      navigateTo: "/maintenance",
      visible:
        permissions.canManageMaintenance,
    },

    {
      title: "Pending Transfers",
      value: stats.pendingTransfers,
      icon: <FaExchangeAlt />,
      color:
        "bg-gradient-to-r from-cyan-600 to-sky-400",
      change: 6,
      navigateTo: "/transfers",
      visible:
        permissions.canManageTransfers,
    },

    {
      title: "Departments",
      value: stats.totalDepartments,
      icon: <FaBuilding />,
      color:
        "bg-gradient-to-r from-indigo-600 to-violet-400",
      change: 1,
      navigateTo: "/departments",
      visible:
        permissions.canViewDepartments,
    },

    {
      title: "Employees",
      value: stats.totalUsers,
      icon: <FaUsers />,
      color:
        "bg-gradient-to-r from-purple-600 to-fuchsia-400",
      change: 5,
      navigateTo: "/users",
      visible:
        permissions.canViewUsers,
    },

    {
      title: "Upcoming Bookings",
      value: stats.upcomingBookings,
      icon: <FaCalendarCheck />,
      color:
        "bg-gradient-to-r from-pink-600 to-rose-400",
      change: 4,
      navigateTo: "/bookings",
      visible: true,
    },

    {
      title: "Pending Maintenance",
      value: stats.pendingMaintenance,
      icon: <FaClock />,
      color:
        "bg-gradient-to-r from-slate-700 to-gray-500",
      change: 1,
      navigateTo: "/maintenance",
      visible:
        permissions.canManageMaintenance,
    },
  ];

  const visibleDashboardCards =
    dashboardCards.filter(
      (card) => card.visible
    );

  /* =====================================================
     ACTIVITY LABEL
  ===================================================== */

  const getActionLabel = (action) => {
    switch (action) {
      case "CREATE_ASSET":
        return "➕ Asset Created";

      case "UPDATE_ASSET":
        return "✏️ Asset Updated";

      case "DELETE_ASSET":
        return "🗑️ Asset Deleted";

      case "ALLOCATE_ASSET":
        return "📦 Asset Allocated";

      case "RETURN_ASSET":
        return "📥 Asset Returned";

      case "TRANSFER_REQUEST":
        return "🔄 Transfer Requested";

      case "TRANSFER_APPROVED":
        return "✅ Transfer Approved";

      case "BOOK_RESOURCE":
        return "📅 Resource Booked";

      case "BOOKING_CANCELLED":
        return "❌ Booking Cancelled";

      case "MAINTENANCE_REQUEST":
        return "🛠 Maintenance Requested";

      case "MAINTENANCE_APPROVED":
        return "✔ Maintenance Approved";

      case "AUDIT_CREATED":
        return "📋 Audit Created";

      case "AUDIT_COMPLETED":
        return "✅ Audit Completed";

      case "LOGIN":
        return "🔐 User Login";

      default:
        return action
          ? action.replaceAll("_", " ")
          : "Activity";
    }
  };

  /* =====================================================
     ROLE BASED HERO TEXT
  ===================================================== */

  const getHeroDescription = () => {
    if (isAdmin) {
      return "Monitor assets, departments, users, maintenance requests, bookings, transfers and analytics from one intelligent dashboard.";
    }

    if (isAssetManager) {
      return "Monitor assets, allocations, maintenance, transfers and operational activities across AssetFlow.";
    }

    if (isDepartmentHead) {
      return "Monitor your department's assets, employees, bookings, maintenance requests and operational activities.";
    }

    if (isEmployee) {
      return "View your assigned assets, bookings, maintenance requests and important account activities.";
    }

    return "Monitor your AssetFlow activities and important enterprise resources from one intelligent dashboard.";
  };

  /* =====================================================
     QUICK ACTIONS
  ===================================================== */

  const quickActions = [
    {
      title: "📦 Register Asset",
      description:
        "Add and manage enterprise assets.",
      navigateTo: "/assets",
      visible:
        permissions.canRegisterAsset,
      className:
        "from-blue-600 to-indigo-700",
      textClass:
        "text-blue-100",
    },

    {
      title: "📅 Book Resource",
      description:
        "Reserve meeting rooms and shared resources.",
      navigateTo: "/bookings",
      visible:
        permissions.canBookResources,
      className:
        "from-emerald-500 to-green-700",
      textClass:
        "text-green-100",
    },

    {
      title: "🛠 Raise Maintenance",
      description:
        "Report damaged assets instantly.",
      navigateTo: "/maintenance",
      visible:
        permissions.canManageMaintenance,
      className:
        "from-orange-500 to-red-600",
      textClass:
        "text-orange-100",
    },
  ];

  const visibleQuickActions =
    quickActions.filter(
      (action) => action.visible
    );

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-all duration-500">

      <Sidebar />

      <div className="flex-1 md:ml-72">

        <Navbar />

        <CommandPalette />

        <div className="max-w-[1800px] mx-auto p-4 md:p-8">

          {/* =================================================
              HERO
          ================================================= */}

          <div
            className={`${glass} overflow-hidden relative p-8 md:p-10 mb-8`}
          >

            <div className="absolute -top-24 -right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

            <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">

              <div>

                <p className="uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  Enterprise Asset Management
                </p>

                <h1
                  className={`${sectionTitle} text-4xl md:text-5xl mt-3`}
                >
                  Dashboard
                </h1>

                <p className={`${muted} mt-4 text-lg max-w-2xl`}>
                  {getHeroDescription()}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-5">

                {/* TOTAL ASSETS */}

                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/20">

                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Total Assets
                  </div>

                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {stats.totalAssets}
                  </div>

                </div>

                {/* EMPLOYEES */}

                {permissions.canViewEmployees && (
                  <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/20">

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Employees
                    </div>

                    <div className="text-3xl font-bold text-purple-600 mt-2">
                      {stats.totalUsers}
                    </div>

                  </div>
                )}

                {/* DEPARTMENTS */}

                {permissions.canViewDepartments && (
                  <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/20">

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Departments
                    </div>

                    <div className="text-3xl font-bold text-indigo-600 mt-2">
                      {stats.totalDepartments}
                    </div>

                  </div>
                )}

                {/* ASSET VALUE */}

                {(isAdmin || isAssetManager) && (
                  <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/20">

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Asset Value
                    </div>

                    <div className="text-2xl font-bold text-green-600 mt-2">
                      ₹{" "}
                      {totalValue.toLocaleString()}
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          {visibleQuickActions.length > 0 && (
            <div
              className={`grid grid-cols-1 ${
                visibleQuickActions.length === 1
                  ? "md:grid-cols-1"
                  : visibleQuickActions.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
              } gap-6 mb-8`}
            >

              {visibleQuickActions.map(
                (action) => (
                  <button
                    key={action.title}
                    onClick={() =>
                      navigate(
                        action.navigateTo
                      )
                    }
                    className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r ${action.className} p-8 text-left text-white shadow-2xl hover:scale-[1.03] transition duration-300`}
                  >

                    <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl"></div>

                    <div className="relative">

                      <h2 className="text-2xl font-bold">
                        {action.title}
                      </h2>

                      <p
                        className={`mt-3 ${action.textClass}`}
                      >
                        {action.description}
                      </p>

                    </div>

                  </button>
                )
              )}

            </div>
          )}

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">

            {visibleDashboardCards.map(
              (card, index) => (

                <div
                  key={index}
                  className="transition duration-300 hover:scale-[1.03]"
                >

                  <StatsCard
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    color={card.color}
                    change={card.change}
                    navigateTo={card.navigateTo}
                    state={card.state}
                  />

                </div>

              )
            )}

          </div>

          {/* =================================================
              ANALYTICS
          ================================================= */}

          {permissions.canViewAnalytics && (
            <>
              <h2
                className={`${sectionTitle} mb-6`}
              >
                Analytics Overview
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

                <div
                  className={`${glass} p-6`}
                >

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
                    Asset Status Distribution
                  </h3>

                  <AssetStatusChart
                    assets={assets}
                  />

                </div>

                <div
                  className={`${glass} p-6`}
                >

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
                    Asset Growth
                  </h3>

                  <AssetGrowthChart
                    assets={assets}
                  />

                </div>

              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

                <div
                  className={`${glass} p-6`}
                >

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
                    Assets by Category
                  </h3>

                  <CategoryChart
                    assets={assets}
                  />

                </div>

                <div
                  className={`${glass} p-6`}
                >

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
                    Assets by Location
                  </h3>

                  <LocationChart
                    assets={assets}
                  />

                </div>

              </div>

              {/* ADVANCED ANALYTICS */}

              <div
                className={`${glass} p-6 mb-8`}
              >

                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
                  Advanced Dashboard Analytics
                </h3>

                <DashboardCharts />

              </div>

              {/* ASSET HEALTH */}

              <div
                className={`${glass} p-6 mb-8`}
              >

                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                  💚 Asset Health
                </h2>

                <AssetHealth
                  stats={stats}
                />

              </div>
            </>
          )}

          {/* =================================================
              NOTIFICATIONS & SYSTEM SUMMARY
          ================================================= */}

          <div
            className={`grid grid-cols-1 ${
              permissions.canViewSystemSummary
                ? "xl:grid-cols-2"
                : "xl:grid-cols-1"
            } gap-6 mb-8`}
          >

            {/* NOTIFICATIONS */}

            <div
              className={`${glass} p-6`}
            >

              <NotificationsPanel />

            </div>

            {/* SYSTEM SUMMARY */}

            {permissions.canViewSystemSummary && (
              <div
                className={`${glass} p-6`}
              >

                <div className="flex justify-between items-center mb-6">

                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    📊 System Summary
                  </h2>

                  <span className="text-green-600 font-semibold">
                    Live
                  </span>

                </div>

                <div className="space-y-5">

                  <div className="flex justify-between">

                    <span className="text-slate-600 dark:text-slate-300">
                      Total Assets
                    </span>

                    <span className="font-bold text-blue-600">
                      {stats.totalAssets}
                    </span>

                  </div>

                  {permissions.canViewEmployees && (
                    <div className="flex justify-between">

                      <span className="text-slate-600 dark:text-slate-300">
                        Employees
                      </span>

                      <span className="font-bold text-purple-600">
                        {stats.totalUsers}
                      </span>

                    </div>
                  )}

                  {permissions.canViewDepartments && (
                    <div className="flex justify-between">

                      <span className="text-slate-600 dark:text-slate-300">
                        Departments
                      </span>

                      <span className="font-bold text-indigo-600">
                        {stats.totalDepartments}
                      </span>

                    </div>
                  )}

                  <div className="flex justify-between">

                    <span className="text-slate-600 dark:text-slate-300">
                      Upcoming Bookings
                    </span>

                    <span className="font-bold text-green-600">
                      {stats.upcomingBookings}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-600 dark:text-slate-300">
                      Pending Maintenance
                    </span>

                    <span className="font-bold text-orange-600">
                      {stats.pendingMaintenance}
                    </span>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              EXECUTIVE SUMMARY
          ================================================= */}

          {(isAdmin || isAssetManager) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

              {/* TOTAL ASSET VALUE */}

              <div
                className={`${glass} p-6`}
              >

                <div className="flex items-center gap-4">

                  <FaMoneyBillWave className="text-4xl text-green-600" />

                  <div>

                    <p className="text-slate-500 dark:text-slate-400">
                      Total Asset Value
                    </p>

                    <h2 className="text-3xl font-bold text-green-600">
                      ₹{" "}
                      {totalValue.toLocaleString()}
                    </h2>

                  </div>

                </div>

              </div>

              {/* ALLOCATED */}

              <div
                className={`${glass} p-6`}
              >

                <p className="text-slate-500 dark:text-slate-400">
                  Assets Allocated
                </p>

                <h2 className="text-3xl font-bold text-blue-600 mt-3">
                  {stats.allocatedAssets}
                </h2>

              </div>

              {/* DEPARTMENTS */}

              <div
                className={`${glass} p-6`}
              >

                <p className="text-slate-500 dark:text-slate-400">
                  Departments
                </p>

                <h2 className="text-3xl font-bold text-purple-600 mt-3">
                  {stats.totalDepartments}
                </h2>

              </div>

              {/* EMPLOYEES */}

              <div
                className={`${glass} p-6`}
              >

                <p className="text-slate-500 dark:text-slate-400">
                  Employees
                </p>

                <h2 className="text-3xl font-bold text-pink-600 mt-3">
                  {stats.totalUsers}
                </h2>

              </div>

            </div>
          )}

          {/* =================================================
              RECENT ACTIVITY & UPCOMING RETURNS
          ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

            {/* RECENT ACTIVITY */}

            <div
              className={`${glass} p-6`}
            >

              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
                📋 Recent Activity
              </h2>

              {!Array.isArray(activities) ||
              activities.length === 0 ? (

                <p className="text-gray-500 dark:text-gray-400">
                  No recent activities.
                </p>

              ) : (

                <div className="space-y-4 max-h-[500px] overflow-y-auto">

                  {activities.map(
                    (item, index) => (

                      <div
                        key={
                          item.activity_id ||
                          item.id ||
                          index
                        }
                        className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4 border-l-4 border-blue-500"
                      >

                        <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                          {getActionLabel(
                            item.action
                          )}
                        </h3>

                        <p className="mt-2 text-slate-700 dark:text-slate-300">
                          {item.description ||
                            "No description available."}
                        </p>

                        <p className="text-xs mt-2 text-gray-500">
                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleString()
                            : "Unknown date"}
                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

            {/* UPCOMING RETURNS */}

            <div
              className={`${glass} p-6`}
            >

              <h2 className="text-xl font-bold text-orange-600 mb-5">
                🟡 Upcoming Returns
              </h2>

              {!Array.isArray(
                stats.upcomingReturns
              ) ||
              stats.upcomingReturns.length === 0 ? (

                <p className="text-gray-500 dark:text-gray-400">
                  No upcoming returns.
                </p>

              ) : (

                <div className="overflow-x-auto">

                  <table className="data-table w-full">

                    <thead>

                      <tr>

                        <th>Asset</th>

                        <th>Employee</th>

                        <th>Return Date</th>

                      </tr>

                    </thead>

                    <tbody>

                      {stats.upcomingReturns.map(
                        (item, index) => (

                          <tr
                            key={
                              item.allocation_id ||
                              index
                            }
                          >

                            <td>

                              <div className="font-semibold text-slate-800 dark:text-white">
                                {item.asset_name}
                              </div>

                              <div className="text-xs text-gray-500">
                                {item.asset_tag}
                              </div>

                            </td>

                            <td className="dark:text-slate-300">
                              {item.full_name}
                            </td>

                            <td className="dark:text-slate-300">
                              {item.expected_return
                                ? new Date(
                                    item.expected_return
                                  ).toLocaleDateString()
                                : "-"}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              OVERDUE RETURNS
          ================================================= */}

          {(isAdmin ||
            isAssetManager ||
            isDepartmentHead) && (
            <div
              className={`${glass} p-6 mb-10`}
            >

              <h2 className="text-xl font-bold text-red-600 mb-5">
                🔴 Overdue Returns
              </h2>

              {!Array.isArray(
                stats.overdueDetails
              ) ||
              stats.overdueDetails.length === 0 ? (

                <p className="text-gray-500 dark:text-gray-400">
                  No overdue returns.
                </p>

              ) : (

                <div className="overflow-x-auto">

                  <table className="data-table w-full">

                    <thead>

                      <tr>

                        <th>Asset</th>

                        <th>Employee</th>

                        <th>Due Date</th>

                      </tr>

                    </thead>

                    <tbody>

                      {stats.overdueDetails.map(
                        (item, index) => (

                          <tr
                            key={
                              item.allocation_id ||
                              index
                            }
                          >

                            <td>

                              <div className="font-semibold text-slate-800 dark:text-white">
                                {item.asset_name}
                              </div>

                              <div className="text-xs text-gray-500">
                                {item.asset_tag}
                              </div>

                            </td>

                            <td className="dark:text-slate-300">
                              {item.full_name}
                            </td>

                            <td className="font-bold text-red-600">
                              {item.return_date
                                ? new Date(
                                    item.return_date
                                  ).toLocaleDateString()
                                : "-"}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;