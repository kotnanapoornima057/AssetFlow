import { useNavigate } from "react-router-dom";
import AnimatedNumber from "./AnimatedNumber";

function DashboardCard({
  title,
  value,
  type,
  navigateTo,
  state,
}) {
  const navigate = useNavigate();

  return (
    <div
    className="w-full cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
    onClick={() => navigateTo && navigate(navigateTo,{state})}
    >
      <div className={`dashboard-card ${type}`}>
        <h3>{title}</h3>

        <h1>
            <AnimatedNumber value={value} />
          </h1>
      </div>
    </div>
  );
}

export default DashboardCard;