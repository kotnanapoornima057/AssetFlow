import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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
  "#64748b",
];

function AssetStatusChart({ assets }) {
  const statusData = Object.values(
    assets.reduce((acc, asset) => {
      const status = asset.status || "Unknown";

      if (!acc[status]) {
        acc[status] = {
          name: status,
          value: 0,
        };
      }

      acc[status].value++;

      return acc;
    }, {})
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0];

    return (
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {item.name}
        </p>

        <p className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
          {item.value}
        </p>

        <p className="text-xs text-slate-400">
          {item.value === 1 ? "Asset" : "Assets"}
        </p>
      </div>
    );
  };

  return (
    <div className="relative h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={78}
            outerRadius={118}
            paddingAngle={4}
            cornerRadius={12}
            stroke="none"
            animationDuration={1200}
          >
            {statusData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              paddingTop: "12px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center information */}
      <div className="pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 flex flex-col items-center">
        <span className="text-4xl font-extrabold text-slate-800 dark:text-white">
          {assets.length}
        </span>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Total Assets
        </span>
      </div>
    </div>
  );
}

export default AssetStatusChart;