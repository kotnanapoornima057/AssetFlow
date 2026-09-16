import { useEffect, useState } from "react";

function SystemOverview() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const hour = time.getHours();

  let greeting = "Welcome";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  return (
    <div className="form-panel mb-6">

      <div className="flex flex-col lg:flex-row justify-between gap-6">

        <div>
          <h2 className="text-2xl font-bold text-blue-700">
            {greeting}, {user.full_name || "User"} 👋
          </h2>

          <p className="text-gray-500 mt-2">
            Enterprise Asset & Resource Management System
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">

          <div>
            <p className="text-sm text-gray-500">
              Current Time
            </p>

            <h3 className="font-bold text-lg">
              {time.toLocaleTimeString()}
            </h3>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Current Date
            </p>

            <h3 className="font-bold text-lg">
              {time.toLocaleDateString()}
            </h3>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Logged In As
            </p>

            <h3 className="font-semibold">
              {user.role || "Employee"}
            </h3>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              System Status
            </p>

            <span className="badge badge-green">
              ● Online
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SystemOverview;