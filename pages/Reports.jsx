import { useEffect, useState } from "react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { exportReportPDF } from "../utils/exportPDF";
import { exportReportExcel } from "../utils/exportExcel";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useTheme } from "../context/ThemeContext";

/* =========================================================
   MODERN CHART COLORS
========================================================= */

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
];

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function ModernTooltip({ active, payload, label, valueLabel = "Assets" }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className="
        min-w-[150px]
        rounded-2xl
        border
        border-white/40
        bg-white/95
        dark:bg-slate-900/95
        backdrop-blur-xl
        px-4
        py-3
        shadow-2xl
      "
    >
      {label && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}

      <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
        {payload[0].value}
      </p>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {valueLabel}
      </p>
    </div>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports() {
  const { darkMode } = useTheme();

  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await api.get("/reports");
      setReport(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const exportCSV = () => {
    if (!report) return;

    let csv = "AssetFlow Report\n\n";

    csv += "Summary\n";
    csv += `Total Assets,${report.totalAssets}\n`;
    csv += `Available Assets,${report.availableAssets}\n`;
    csv += `Allocated Assets,${report.allocatedAssets}\n`;
    csv += `Maintenance Requests,${report.maintenanceAssets}\n`;
    csv += `Bookings,${report.bookings}\n\n`;

    csv += "Category,Total Assets\n";

    report.categoryWise.forEach((c) => {
      csv += `${c.category_name},${c.total}\n`;
    });

    csv += "\nDepartment,Allocated Assets\n";

    report.departmentWise.forEach((d) => {
      csv += `${d.department_name},${d.total_allocations}\n`;
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `AssetFlow_Report_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     COMMON STYLES
  ========================================================= */

  const glass =
    "rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  const chartCard =
    "group rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-300 p-5 sm:p-7 overflow-hidden";

  /* =========================================================
     MODERN CHART SETTINGS
  ========================================================= */

  const gridColor = darkMode
    ? "rgba(148,163,184,0.10)"
    : "rgba(148,163,184,0.18)";

  const tickColor = darkMode
    ? "#94a3b8"
    : "#64748b";

  const tooltipCursor = darkMode
    ? "rgba(99,102,241,0.08)"
    : "rgba(99,102,241,0.05)";

  /* =========================================================
     LOADING
  ========================================================= */

  if (!report) {
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

          <div className="mt-24 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className={`${glass} p-10 text-center`}>
              <div className="flex justify-center mb-5">
                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-blue-100
                    dark:bg-blue-900/30
                    flex
                    items-center
                    justify-center
                    text-3xl
                  "
                >
                  📊
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Loading Reports...
              </h2>

              <p className={`${muted} mt-2`}>
                Please wait while your analytics are being loaded.
              </p>
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
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN
      ===================================================== */}

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
          {/* =================================================
              HERO
          ================================================= */}

          <div
            className="
              rounded-3xl
              bg-white/80
              dark:bg-slate-900/70
              backdrop-blur-xl
              border
              border-white/50
              dark:border-slate-700/60
              shadow-xl
              relative
              overflow-hidden
              mb-8
              px-6
              py-8
              sm:px-8
              sm:py-10
              lg:px-12
            "
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
              {/* LEFT */}

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
                  Reports & Analytics
                </h1>

                <p
                  className={`${muted} mt-4 text-sm sm:text-base lg:text-lg max-w-2xl`}
                >
                  Analyze your enterprise assets, maintenance activity,
                  bookings and department-wise allocations.
                </p>
              </div>

              {/* EXPORT BUTTONS */}

              <div
                className="
                  flex
                  flex-wrap
                  gap-3
                  w-full
                  xl:w-auto
                "
              >
                <button
                  onClick={() => exportReportPDF(report)}
                  className="
                    flex-1
                    sm:flex-none
                    px-5
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-red-600
                    to-rose-600
                    hover:scale-105
                    text-white
                    font-bold
                    shadow-lg
                    transition
                  "
                >
                  📄 PDF
                </button>

                <button
                  onClick={() => exportReportExcel(report)}
                  className="
                    flex-1
                    sm:flex-none
                    px-5
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-emerald-600
                    to-green-600
                    hover:scale-105
                    text-white
                    font-bold
                    shadow-lg
                    transition
                  "
                >
                  📊 Excel
                </button>

                <button
                  onClick={exportCSV}
                  className="
                    flex-1
                    sm:flex-none
                    px-5
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    hover:scale-105
                    text-white
                    font-bold
                    shadow-lg
                    transition
                  "
                >
                  📑 CSV
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
              mb-8
            "
          >
            {/* Total Assets */}

            <div
              className="
                rounded-3xl
                bg-white/80
                dark:bg-slate-900/70
                backdrop-blur-xl
                border
                border-white/50
                dark:border-slate-700/60
                shadow-xl
                p-6
                relative
                overflow-hidden
                hover:-translate-y-1
                transition
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

              <p className={muted}>
                Total Assets
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-extrabold
                  text-blue-600
                "
              >
                {report.totalAssets}
              </h2>

              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Registered enterprise assets
              </p>
            </div>

            {/* Available */}

            <div
              className="
                rounded-3xl
                bg-white/80
                dark:bg-slate-900/70
                backdrop-blur-xl
                border
                border-white/50
                dark:border-slate-700/60
                shadow-xl
                p-6
                relative
                overflow-hidden
                hover:-translate-y-1
                transition
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

              <p className={muted}>
                Available
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-extrabold
                  text-green-600
                "
              >
                {report.availableAssets}
              </h2>

              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Assets ready for allocation
              </p>
            </div>

            {/* Allocated */}

            <div
              className="
                rounded-3xl
                bg-white/80
                dark:bg-slate-900/70
                backdrop-blur-xl
                border
                border-white/50
                dark:border-slate-700/60
                shadow-xl
                p-6
                relative
                overflow-hidden
                hover:-translate-y-1
                transition
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
                  bg-orange-500/10
                "
              />

              <p className={muted}>
                Allocated
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-extrabold
                  text-orange-500
                "
              >
                {report.allocatedAssets}
              </h2>

              <p className="mt-2 text-sm text-orange-500">
                Currently allocated assets
              </p>
            </div>

            {/* Maintenance */}

            <div
              className="
                rounded-3xl
                bg-white/80
                dark:bg-slate-900/70
                backdrop-blur-xl
                border
                border-white/50
                dark:border-slate-700/60
                shadow-xl
                p-6
                relative
                overflow-hidden
                hover:-translate-y-1
                transition
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

              <p className={muted}>
                Maintenance Requests
              </p>

              <h2
                className="
                  mt-3
                  text-4xl
                  font-extrabold
                  text-red-600
                "
              >
                {report.maintenanceAssets}
              </h2>

              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Assets requiring attention
              </p>
            </div>
          </div>

          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* =================================================
                STEP 6 — CATEGORY CHART
            ================================================= */}

            <div className={chartCard}>
              <div className="mb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Assets by Category
                    </h3>

                    <p className={`${muted} mt-1 text-sm`}>
                      Distribution of assets across categories.
                    </p>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-indigo-100
                      dark:bg-indigo-900/30
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

              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.categoryWise}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="reportCategoryGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#818cf8"
                        />

                        <stop
                          offset="100%"
                          stopColor="#4f46e5"
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 6"
                      vertical={false}
                      stroke={gridColor}
                    />

                    <XAxis
                      dataKey="category_name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      content={
                        <ModernTooltip valueLabel="Assets" />
                      }
                      cursor={{
                        fill: tooltipCursor,
                      }}
                    />

                    <Bar
                      dataKey="total"
                      radius={[12, 12, 5, 5]}
                      barSize={42}
                      fill="url(#reportCategoryGradient)"
                      animationDuration={1200}
                    >
                      {report.categoryWise.map((item, index) => (
                        <Cell
                          key={item.category_name}
                          fill={
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* =================================================
                STEP 7 — STATUS CHART
            ================================================= */}

            <div className={chartCard}>
              <div className="mb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Asset Status
                    </h3>

                    <p className={`${muted} mt-1 text-sm`}>
                      Current status distribution of assets.
                    </p>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-blue-100
                      dark:bg-blue-900/30
                      flex
                      items-center
                      justify-center
                      text-xl
                    "
                  >
                    📊
                  </div>
                </div>
              </div>

              <div className="relative h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.statusWise}
                      dataKey="total"
                      nameKey="status"
                      cx="50%"
                      cy="45%"
                      innerRadius={72}
                      outerRadius={108}
                      paddingAngle={5}
                      cornerRadius={10}
                      stroke="none"
                      animationDuration={1200}
                    >
                      {report.statusWise.map((item, index) => (
                        <Cell
                          key={item.status}
                          fill={
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      content={
                        <ModernTooltip valueLabel="Assets" />
                      }
                      cursor={false}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center information */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                    pb-8
                  "
                >
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {report.totalAssets}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Total Assets
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                STEP 8 — BOOKING HOURS
            ================================================= */}

            <div className={chartCard}>
              <div className="mb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Peak Booking Hours
                    </h3>

                    <p className={`${muted} mt-1 text-sm`}>
                      Booking activity by hour.
                    </p>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-violet-100
                      dark:bg-violet-900/30
                      flex
                      items-center
                      justify-center
                      text-xl
                    "
                  >
                    🕐
                  </div>
                </div>
              </div>

              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.bookingHeatmap}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="bookingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#a78bfa"
                        />

                        <stop
                          offset="100%"
                          stopColor="#7c3aed"
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 6"
                      vertical={false}
                      stroke={gridColor}
                    />

                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      content={
                        <ModernTooltip valueLabel="Bookings" />
                      }
                      cursor={{
                        fill: "rgba(124,58,237,0.06)",
                      }}
                    />

                    <Bar
                      dataKey="total"
                      fill="url(#bookingGradient)"
                      radius={[12, 12, 5, 5]}
                      barSize={36}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* =================================================
                RETIREMENT
            ================================================= */}

            <div className={chartCard}>
              <div className="mb-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Assets Nearing Retirement
                </h3>

                <p className={`${muted} mt-1 text-sm`}>
                  Assets that may require replacement soon.
                </p>
              </div>

              {report.nearingRetirement.length === 0 ? (
                <div
                  className="
                    py-16
                    text-center
                    rounded-2xl
                    bg-slate-50
                    dark:bg-slate-800/60
                  "
                >
                  <div className="text-4xl mb-3">
                    ✅
                  </div>

                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No assets are nearing retirement.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr
                        className="
                          border-b
                          border-slate-200
                          dark:border-slate-700
                          text-left
                        "
                      >
                        <th className="py-3 px-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                          Tag
                        </th>

                        <th className="py-3 px-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                          Name
                        </th>

                        <th className="py-3 px-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                          Purchase
                        </th>

                        <th className="py-3 px-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                          Age
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.nearingRetirement.map((asset) => (
                        <tr
                          key={asset.asset_tag}
                          className="
                            border-b
                            border-slate-200
                            dark:border-slate-700
                            hover:bg-slate-50
                            dark:hover:bg-slate-800/50
                            transition
                          "
                        >
                          <td className="py-4 px-3">
                            <span
                              className="
                                px-3
                                py-1.5
                                rounded-xl
                                bg-blue-100
                                dark:bg-blue-900/40
                                text-blue-700
                                dark:text-blue-300
                                font-bold
                                text-sm
                              "
                            >
                              {asset.asset_tag}
                            </span>
                          </td>

                          <td className="py-4 px-3 font-semibold text-slate-900 dark:text-white">
                            {asset.asset_name}
                          </td>

                          <td className="py-4 px-3 text-slate-600 dark:text-slate-400">
                            {new Date(
                              asset.purchase_date
                            ).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-3">
                            <span
                              className="
                                inline-flex
                                px-3
                                py-1
                                rounded-full
                                bg-orange-100
                                dark:bg-orange-900/30
                                text-orange-700
                                dark:text-orange-300
                                font-semibold
                              "
                            >
                              {asset.age_years} years
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* =================================================
                STEP 9 — DEPARTMENT ALLOCATION
            ================================================= */}

            <div className={chartCard}>
              <div className="mb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Department-wise Allocation
                    </h3>

                    <p className={`${muted} mt-1 text-sm`}>
                      Asset allocation across departments.
                    </p>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-emerald-100
                      dark:bg-emerald-900/30
                      flex
                      items-center
                      justify-center
                      text-xl
                    "
                  >
                    🏢
                  </div>
                </div>
              </div>

              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.departmentWise}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="departmentGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#34d399"
                        />

                        <stop
                          offset="100%"
                          stopColor="#059669"
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 6"
                      vertical={false}
                      stroke={gridColor}
                    />

                    <XAxis
                      dataKey="department_name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      content={
                        <ModernTooltip valueLabel="Allocated Assets" />
                      }
                      cursor={{
                        fill: "rgba(16,185,129,0.06)",
                      }}
                    />

                    <Bar
                      dataKey="total_allocations"
                      fill="url(#departmentGradient)"
                      radius={[12, 12, 5, 5]}
                      barSize={42}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* =================================================
                STEP 10 — MAINTENANCE FREQUENCY
            ================================================= */}

            <div className={chartCard}>
              <div className="mb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Maintenance Frequency by Category
                    </h3>

                    <p className={`${muted} mt-1 text-sm`}>
                      Maintenance requests grouped by category.
                    </p>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-orange-100
                      dark:bg-orange-900/30
                      flex
                      items-center
                      justify-center
                      text-xl
                    "
                  >
                    🛠️
                  </div>
                </div>
              </div>

              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.maintenanceByCategory}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="maintenanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#fbbf24"
                        />

                        <stop
                          offset="100%"
                          stopColor="#ea580c"
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 6"
                      vertical={false}
                      stroke={gridColor}
                    />

                    <XAxis
                      dataKey="category_name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: tickColor,
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      content={
                        <ModernTooltip valueLabel="Maintenance Requests" />
                      }
                      cursor={{
                        fill: "rgba(234,88,12,0.06)",
                      }}
                    />

                    <Bar
                      dataKey="total_requests"
                      fill="url(#maintenanceGradient)"
                      radius={[12, 12, 5, 5]}
                      barSize={42}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* =================================================
              CATEGORY BREAKDOWN
          ================================================= */}

          <div className={`${glass} mt-8 overflow-hidden`}>
            <div
              className="
                px-5
                sm:px-8
                py-6
                border-b
                border-slate-200
                dark:border-slate-700
              "
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Category Breakdown
              </h2>

              <p className={`${muted} mt-2`}>
                Overview of assets grouped by category.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead
                    className="
                      bg-slate-100
                      dark:bg-slate-800
                    "
                  >
                    <tr className="text-left">
                      <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300">
                        Category
                      </th>

                      <th className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300">
                        Total Assets
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.categoryWise.map((item) => (
                      <tr
                        key={item.category_name}
                        className="
                          border-b
                          border-slate-200
                          dark:border-slate-700
                          hover:bg-slate-50
                          dark:hover:bg-slate-800/50
                          transition
                        "
                      >
                        <td className="px-5 py-4">
                          <span
                            className="
                              inline-flex
                              px-3
                              py-1.5
                              rounded-xl
                              bg-violet-100
                              dark:bg-violet-900/30
                              text-violet-700
                              dark:text-violet-300
                              font-semibold
                              text-sm
                            "
                          >
                            {item.category_name}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className="
                              inline-flex
                              px-3
                              py-1.5
                              rounded-xl
                              bg-blue-100
                              dark:bg-blue-900/40
                              text-blue-700
                              dark:text-blue-300
                              font-bold
                            "
                          >
                            {item.total}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* =================================================
              EXPORT SECTION
          ================================================= */}

          <div className={`${glass} mt-8 p-6 sm:p-8`}>
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
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Export Reports
                </h3>

                <p className={`${muted} mt-2`}>
                  Download your AssetFlow analytics for further use.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => exportReportPDF(report)}
                  className="
                    px-6
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-red-600
                    to-rose-600
                    hover:scale-105
                    text-white
                    font-bold
                    shadow-lg
                    transition
                  "
                >
                  📄 Export PDF
                </button>

                <button
                  onClick={() => exportReportExcel(report)}
                  className="
                    px-6
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-emerald-600
                    to-green-600
                    hover:scale-105
                    text-white
                    font-bold
                    shadow-lg
                    transition
                  "
                >
                  📊 Export Excel
                </button>

                <button
                  onClick={exportCSV}
                  className="
                    px-6
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    hover:scale-105
                    text-white
                    font-bold
                    shadow-lg
                    transition
                  "
                >
                  📑 Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;