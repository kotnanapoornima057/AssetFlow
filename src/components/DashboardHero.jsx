import { FaBoxOpen, FaClipboardCheck, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function DashboardHero() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white shadow-2xl">

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5"></div>

      <div className="relative p-10">

        <div className="flex flex-col lg:flex-row justify-between gap-8">

          <div>

            <h1 className="text-4xl font-bold">

              {greeting}, {user.full_name || "User"} 👋

            </h1>

            <p className="mt-3 text-blue-100 text-lg">

              Welcome back to <b>AssetFlow ERP</b>

            </p>

            <p className="mt-2 text-blue-200">

              Manage Assets • Track Maintenance • Schedule Audits • Monitor Reports

            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={() => navigate("/assets")}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center gap-2"
              >
                <FaBoxOpen />
                Register Asset
              </button>

              <button
                onClick={() => navigate("/audits")}
                className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center gap-2"
              >
                <FaClipboardCheck />
                Audits
              </button>

            </div>

          </div>

          <div className="flex flex-col justify-between">

            <div className="text-right">

              <p className="text-blue-200">

                Today

              </p>

              <h2 className="text-3xl font-bold">

                {today}

              </h2>

            </div>

            <div className="mt-8 bg-white/10 backdrop-blur rounded-2xl p-5">

              <p className="text-sm opacity-80">

                Logged in as

              </p>

              <h3 className="text-2xl font-bold mt-2">

                {user.role}

              </h3>

              <button
                onClick={() => navigate("/profile")}
                className="mt-5 flex items-center gap-2 text-sm hover:underline"
              >
                View Profile

                <FaArrowRight />

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DashboardHero;