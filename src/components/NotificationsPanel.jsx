import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

function NotificationsPanel() {

  const notifications = [

    {
      title: "HP Laptop allocated",
      time: "2 mins ago",
      color: "text-green-600",
      icon: <FaCheckCircle />,
    },

    {
      title: "Meeting Room booked",
      time: "10 mins ago",
      color: "text-blue-600",
      icon: <FaBell />,
    },

    {
      title: "Dell Laptop overdue",
      time: "1 hour ago",
      color: "text-red-600",
      icon: <FaExclamationTriangle />,
    },

    {
      title: "Transfer Request Pending",
      time: "2 hours ago",
      color: "text-orange-500",
      icon: <FaBell />,
    },

  ];

  return (

    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-xl font-bold mb-6">
        🔔 Notifications
      </h2>

      <div className="space-y-4">

        {notifications.map((item, index) => (

          <div
            key={index}
            className="flex items-center gap-4 border-b pb-4 last:border-none"
          >

            <div className={`text-2xl ${item.color}`}>
              {item.icon}
            </div>

            <div>

              <p className="font-semibold">
                {item.title}
              </p>

              <p className="text-gray-500 text-sm">
                {item.time}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default NotificationsPanel;