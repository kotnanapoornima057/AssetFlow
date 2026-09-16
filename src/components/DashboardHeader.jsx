import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

function DashboardHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();

  let greeting = "Hello";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-3xl p-8 text-white shadow-xl mb-8">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold">
            {greeting}, {user.full_name || "Admin"} 👋
          </h1>

          <p className="opacity-90 mt-2 text-lg">
            Enterprise Asset & Resource Management System
          </p>

        </div>

        <div className="text-right">

          <div className="text-5xl mb-3">
            {hour < 18 ? <FaSun /> : <FaMoon />}
          </div>

          <h2 className="text-2xl font-bold">
            {time.toLocaleTimeString()}
          </h2>

          <p>
            {time.toLocaleDateString()}
          </p>

        </div>

      </div>

    </div>
  );
}

export default DashboardHeader;