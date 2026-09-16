import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function AssetGrowthChart({ assets }) {
  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(
      2026,
      index,
      1
    ).toLocaleString("default", {
      month: "short",
    });

    const count = assets.filter((asset) => {
      if (!asset.purchase_date) return false;

      const date = new Date(asset.purchase_date);

      return date.getMonth() === index;
    }).length;

    return {
      month,
      assets: count,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
          {payload[0].value}
        </p>

        <p className="text-xs text-slate-400">
          New Assets
        </p>
      </div>
    );
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyData}
          margin={{
            top: 15,
            right: 15,
            left: -15,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient
              id="assetGrowthGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#3b82f6"
                stopOpacity={0.4}
              />

              <stop
                offset="95%"
                stopColor="#3b82f6"
                stopOpacity={0.03}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 7"
            vertical={false}
            stroke="#94a3b8"
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
            content={<CustomTooltip />}
            cursor={{
              stroke: "#3b82f6",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="assets"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#assetGrowthGradient)"
            dot={{
              r: 4,
              fill: "#2563eb",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              stroke: "#ffffff",
              strokeWidth: 3,
            }}
            animationDuration={1400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AssetGrowthChart;