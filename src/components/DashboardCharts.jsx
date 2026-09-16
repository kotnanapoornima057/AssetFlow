import { useEffect, useState } from "react";
import api from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

function DashboardCharts() {
  const [chart, setChart] = useState({
    statusData: [],
    categoryData: [],
    maintenanceData: [],
  });

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      const res = await api.get(
        "/dashboard/chart-data"
      );

      setChart(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const tooltipStyle = {
    borderRadius: "16px",
    border: "1px solid rgba(148,163,184,0.25)",
    backgroundColor: "rgba(255,255,255,0.95)",
    boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
  };

  return (
    <div className="space-y-6">

      {/* ================= ROW 1 ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* STATUS */}

        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 p-5">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              📦 Assets by Status
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Current distribution of enterprise assets.
            </p>
          </div>

          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={chart.statusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                  cornerRadius={10}
                  stroke="none"
                  animationDuration={1200}
                >
                  {chart.statusData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                />

              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CATEGORY */}

        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 p-5">

          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              🗂️ Assets by Category
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Asset distribution across categories.
            </p>
          </div>

          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chart.categoryData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 7"
                  vertical={false}
                  opacity={0.2}
                />

                <XAxis
                  dataKey="category_name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                />

                <Bar
                  dataKey="count"
                  radius={[12, 12, 5, 5]}
                  barSize={38}
                  animationDuration={1000}
                >
                  {chart.categoryData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.category_name}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ================= MAINTENANCE ================= */}

      <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 p-5">

        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            🛠️ Monthly Maintenance Trend
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintenance activity over time.
          </p>
        </div>

        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chart.maintenanceData}
              margin={{
                top: 10,
                right: 15,
                left: -15,
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
                    stopColor="#8b5cf6"
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="100%"
                    stopColor="#8b5cf6"
                    stopOpacity={0.03}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 7"
                vertical={false}
                opacity={0.2}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <Tooltip
                contentStyle={tooltipStyle}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#maintenanceGradient)"
                dot={{
                  r: 4,
                  fill: "#8b5cf6",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                }}
                animationDuration={1300}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}

export default DashboardCharts;