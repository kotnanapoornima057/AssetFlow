import { useEffect, useState } from "react";
import api from "../services/api";
import { FaBell } from "react-icons/fa";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications/latest");
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      loadNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const icon = (type) => {
  switch ((type || "").toLowerCase()) {

    case "asset":
      return "📦";

    case "maintenance":
      return "🛠";

    case "booking":
      return "📅";

    case "transfer":
      return "🔄";

    case "audit":
      return "📋";

    default:
      return "🔔";
  }
};

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <FaBell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}

      </button>

      {open && (

        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border z-50">

          <div className="p-4 border-b font-bold text-lg">
            Notifications
          </div>

          <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 ? (

              <div className="p-6 text-center text-gray-500">
                No notifications
              </div>

            ) : (

              notifications.map((n) => (

                <div
                  key={n.notification_id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !n.is_read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => markRead(n.notification_id)}
                >

                  <div className="flex justify-between">

                    <div className="font-semibold">

                      {icon(n.notification_type)} {n.title}

                    </div>

                    {!n.is_read && (
                      <span className="text-xs bg-red-500 text-white rounded-full px-2">
                        NEW
                      </span>
                    )}

                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    {n.message}
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default NotificationBell;