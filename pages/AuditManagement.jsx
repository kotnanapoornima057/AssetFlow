import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AuditManagement() {
  const navigate = useNavigate();

  const [audits, setAudits] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    audit_name: "",
    department_id: "",
    start_date: "",
    end_date: "",
    auditor_name: "",
    auditor_id: "",
  });

  const loadAudits = async () => {
    try {
      const res = await api.get("/audits");
      setAudits(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadAudits();
    loadDepartments();

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setForm((prev) => ({
        ...prev,
        auditor_name: user.full_name,
        auditor_id: user.user_id,
      }));
    }
  }, []);

  const createAudit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/audits", form);

      alert("Audit Cycle Created");

      setForm((prev) => ({
        ...prev,
        audit_name: "",
        department_id: "",
        start_date: "",
        end_date: "",
      }));

      loadAudits();

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="w-full md:ml-64">
        <Navbar />

        <div className="p-8">

          <h1 className="text-3xl font-bold mb-8">
            Asset Audit Cycles
          </h1>

          {/* Create Audit */}

          <div className="bg-white rounded-xl shadow p-6 mb-8">

            <h2 className="text-xl font-semibold mb-5">
              Create Audit Cycle
            </h2>

            <form
              onSubmit={createAudit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              <input
                type="text"
                placeholder="Audit Name"
                className="border rounded-lg p-3"
                value={form.audit_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    audit_name: e.target.value,
                  })
                }
                required
              />

              <select
                className="border rounded-lg p-3"
                value={form.department_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    department_id: e.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select Department
                </option>

                {departments.map((d) => (
                  <option
                    key={d.department_id}
                    value={d.department_id}
                  >
                    {d.department_name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border rounded-lg p-3"
                value={form.start_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    start_date: e.target.value,
                  })
                }
                required
              />

              <input
                type="date"
                className="border rounded-lg p-3"
                value={form.end_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    end_date: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                className="border rounded-lg p-3 bg-gray-100"
                value={form.auditor_name}
                readOnly
              />

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Audit
              </button>

            </form>

          </div>

          {/* Audit List */}

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-semibold mb-5">
              Audit Cycles
            </h2>

            <table className="w-full border-collapse">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">
                    Audit
                  </th>

                  <th className="text-left">
                    Department
                  </th>

                  <th className="text-left">
                    Auditor
                  </th>

                  <th className="text-left">
                    Start
                  </th>

                  <th className="text-left">
                    End
                  </th>

                  <th className="text-left">
                    Status
                  </th>

                  <th className="text-left">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {audits.map((audit) => (

                  <tr
                    key={audit.audit_id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="py-3">
                      {audit.audit_name}
                    </td>

                    <td>
                      {audit.department_name}
                    </td>

                    <td>
                      {audit.auditor_full_name ||
                        audit.auditor_name}
                    </td>

                    <td>
                      {new Date(
                        audit.start_date
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {new Date(
                        audit.end_date
                      ).toLocaleDateString()}
                    </td>

                    <td>

                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          audit.status === "Open"
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {audit.status}
                      </span>

                    </td>

                    <td>

                      <button
                        onClick={() =>
                          navigate(
                            `/audit-items/${audit.audit_id}`
                          )
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        View
                      </button>

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

export default AuditManagement;