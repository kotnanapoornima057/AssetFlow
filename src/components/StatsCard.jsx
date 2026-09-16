import { useNavigate } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import AnimatedNumber from "./AnimatedNumber";

function StatsCard({
  title,
  value,
  icon,
  color,
  change,
  navigateTo,
  state,
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigateTo && navigate(navigateTo, { state })}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        bg-white
        border
        border-slate-200
        shadow-md
        hover:shadow-2xl
        hover:-translate-y-2
        transition-all
        duration-300
        cursor-pointer
      "
    >
      {/* Top Accent */}
      <div className={`h-2 ${color}`} />

      <div className="p-8 min-h-[210px] flex flex-col justify-between">

        {/* Top Section */}

        <div className="flex justify-between items-start gap-4">

          <div className="flex-1">

            <p className="text-sm text-slate-500 font-medium">
              {title}
            </p>

            <h2 className="mt-4 text-5xl font-bold text-slate-800">
              <AnimatedNumber value={value} />
            </h2>

          </div>

          <div
            className={`
              ${color}
              w-18
              h-18
              min-w-[72px]
              min-h-[72px]
              rounded-2xl
              flex
              items-center
              justify-center
              text-white
              text-3xl
              shadow-lg
              transition-transform
              duration-300
              group-hover:scale-110
              group-hover:rotate-6
            `}
          >
            {icon}
          </div>

        </div>

        {/* Bottom */}

        <div className="flex items-center justify-between pt-8 border-t border-slate-100">

          <div className="flex items-center gap-2 text-green-600 font-semibold">

            <FaArrowUp />

            <span>{change}%</span>

          </div>

          <span className="text-sm text-slate-400">
            This month
          </span>

        </div>

      </div>
    </div>
  );
}

export default StatsCard;