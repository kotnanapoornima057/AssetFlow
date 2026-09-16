function ProgressBar({ title, value, color }) {
  return (
    <div className="mb-7">

      <div className="flex justify-between mb-2">

        <h3 className="font-semibold">
          {title}
        </h3>

        <span className="font-bold">
          {value}%
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4">

        <div
          className={`${color} h-4 rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />

      </div>

    </div>
  );
}

function AssetHealth({ stats }) {

  const total = stats.totalAssets || 1;

  const healthy = Math.round(
    (stats.availableAssets / total) * 100
  );

  const maintenance = Math.round(
    (stats.pendingMaintenance / total) * 100
  );

  const critical = Math.round(
    (stats.overdueAssets / total) * 100
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-8">
        Asset Health
      </h2>

      <ProgressBar
        title="Healthy Assets"
        value={healthy}
        color="bg-green-500"
      />

      <ProgressBar
        title="Maintenance Due"
        value={maintenance}
        color="bg-yellow-500"
      />

      <ProgressBar
        title="Critical Assets"
        value={critical}
        color="bg-red-500"
      />

    </div>
  );
}

export default AssetHealth;