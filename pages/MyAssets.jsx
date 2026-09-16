import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MyAssets() {
  const [allocations, setAllocations] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const loadMyAllocations = async () => {
    try {
      const res = await api.get(`/allocations/my/${currentUser?.user_id}`);
      setAllocations(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadMyAllocations();
  }, []);

  const statusBadge = (status) => {
    switch (status) {
      case "Allocated":
        return "badge badge-blue";
      case "Returned":
        return "badge badge-green";
      default:
        return "badge badge-gray";
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="w-full md:ml-64">
        <Navbar />

        <div className="p-8">
          <h1 className="page-title">My Allocated Assets</h1>
          <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Allocated Date</th>
                <th>Expected Return</th>
                <th>Returned Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {allocations.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No assets currently allocated to you.
                  </td>
                </tr>
              )}

              {allocations.map((al) => (
                <tr key={al.allocation_id}>
                  <td>
                    {al.asset_name} ({al.asset_tag})
                  </td>
                  <td>
                    {al.allocated_date
                      ? new Date(al.allocated_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {al.expected_return
                      ? new Date(al.expected_return).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {al.returned_date
                      ? new Date(al.returned_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <span className={statusBadge(al.allocation_status)}>
                      {al.allocation_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAssets;