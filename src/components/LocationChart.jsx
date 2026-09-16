import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#f43f5e",
];

function LocationChart({ assets }) {
  const locationData = Object.values(
    assets.reduce((acc, asset) => {
      const location =
        asset.location || "Unknown";

      if (!acc[location]) {
        acc[location] = {
          location,
          total: 0,
        };
      }

      acc[location].total++;

      return acc;
    }, {})
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {payload[0].payload.location}
        </p>

        <p className="mt-1 text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
          {payload[0].value}
        </p>

        <p className="text-xs text-slate-400">
          Assets
        </p>
      </div>
    );
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={locationData}
          margin={{
            top: 15,
            right: 15,
            left: -15,
            bottom: 15,
          }}
        >
          <defs>
            <linearGradient
              id="locationBarGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#22d3ee"
              />

              <stop
                offset="100%"
                stopColor="#2563eb"
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
            dataKey="location"
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
            content={<CustomTooltip />}
            cursor={{
              fill: "rgba(6,182,212,0.06)",
            }}
          />

          <Bar
            dataKey="total"
            radius={[12, 12, 5, 5]}
            barSize={38}
            animationDuration={1100}
          >
            {locationData.map((entry, index) => (
              <Cell
                key={entry.location}
                fill={
                  COLORS[index % COLORS.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LocationChart;