import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaBuilding,
  FaPlusCircle,
  FaUsers,
  FaSearch,
} from "react-icons/fa";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [parentId, setParentId] = useState("");
  const [headId, setHeadId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  /* ================= LOAD ================= */

  const loadDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadUsers();
  }, []);

  /* ================= UI ================= */

  const glass =
    "rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  /* ================= STATS ================= */

  const totalDepartments = useMemo(
    () => departments.length,
    [departments]
  );

  const activeDepartments = useMemo(
    () =>
      departments.filter(
        (d) => (d.status || "Active") === "Active"
      ).length,
    [departments]
  );

  const inactiveDepartments = useMemo(
    () =>
      departments.filter(
        (d) => d.status === "Inactive"
      ).length,
    [departments]
  );

  const totalHeads = useMemo(
    () =>
      departments.filter(
        (d) => d.department_head_name
      ).length,
    [departments]
  );

  /* ================= FILTER ================= */

  const filteredDepartments = departments.filter((dep) => {
    return (
      dep.department_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (dep.department_head_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  /* ================= FORM ================= */

  const startEdit = (dep) => {
    setEditingId(dep.department_id);
    setName(dep.department_name);
    setStatus(dep.status || "Active");
    setParentId(dep.parent_department_id || "");
    setHeadId(dep.department_head_id || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setStatus("Active");
    setParentId("");
    setHeadId("");
  };

  const saveDepartment = async () => {
    if (!name.trim()) return;

    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, {
          department_name: name,
          status,
          parent_department_id: parentId || null,
          department_head_id: headId || null,
        });
      } else {
        await api.post("/departments", {
          department_name: name,
          parent_department_id: parentId || null,
          department_head_id: headId || null,
        });
      }

      cancelEdit();
      loadDepartments();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error saving department."
      );
    }
  };

  const deleteDepartment = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this department?"
      )
    )
      return;

    try {
      await api.delete(`/departments/${id}`);
      loadDepartments();
    } catch (err) {
      alert(
        "Cannot delete this department because it has related employees, assets or audits."
      );
    }
  };

  const statusBadge = (status) => {
    return status === "Active"
      ? "bg-green-600"
      : "bg-slate-600";
  };

  const availableParents = departments.filter(
    (d) => d.department_id !== editingId
  );

  const potentialHeads = users.filter(
    (u) =>
      u.role === "Department Head" ||
      u.role === "Admin"
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      <Sidebar />

      <div className="flex-1 md:ml-72">

        <Navbar />

        <div
          className="
            mt-24
            max-w-[1800px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            pb-8
          "
        >

          {/* ================= HERO ================= */}

          <div
            className={`${glass} relative overflow-hidden mb-8 px-6 py-8 sm:px-8 sm:py-10 lg:px-12`}
          >

            <div className="absolute -top-20 -right-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

            <div className="absolute -bottom-20 -left-16 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">

              <div>

                <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold">
                  Enterprise Asset Management
                </p>

                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">

                  Department Management

                </h1>

                <p className={`${muted} mt-4 max-w-2xl text-sm sm:text-base lg:text-lg`}>

                  Organize departments, assign department heads,
                  build organization hierarchy and manage
                  department information from one place.

                </p>

              </div>

                            {/* RIGHT STATS */}

              <div
                className="
                  grid
                  grid-cols-2
                  lg:grid-cols-2
                  gap-4
                  w-full
                  xl:w-auto
                "
              >

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-blue-600">
                    {totalDepartments}
                  </h2>

                </div>

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Active
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-green-600">
                    {activeDepartments}
                  </h2>

                </div>

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Inactive
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-red-600">
                    {inactiveDepartments}
                  </h2>

                </div>

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Heads
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-indigo-600">
                    {totalHeads}
                  </h2>

                </div>

              </div>

            </div>

          </div>

          {/* ================= CREATE DEPARTMENT ================= */}

          <div className={`${glass} p-6 sm:p-8 mb-8`}>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">

              <div>

                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">

                  🏢 {editingId ? "Update Department" : "Create Department"}

                </h2>

                <p className={`${muted} mt-2`}>
                  Create organizational departments and assign department heads.
                </p>

              </div>

              <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-4xl shadow-xl">

                <FaBuilding />

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Department Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Department Name"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Parent Department
                </label>

                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    No Parent Department
                  </option>

                  {availableParents.map((d) => (

                    <option
                      key={d.department_id}
                      value={d.department_id}
                    >
                      {d.department_name}
                    </option>

                  ))}

                </select>

              </div>

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Department Head
                </label>

                <select
                  value={headId}
                  onChange={(e) => setHeadId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    No Department Head
                  </option>

                  {potentialHeads.map((u) => (

                    <option
                      key={u.user_id}
                      value={u.user_id}
                    >
                      {u.full_name} ({u.role})
                    </option>

                  ))}

                </select>

              </div>

              {editingId && (

                <div>

                  <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              )}

            </div>

            <p className={`${muted} text-sm mt-4`}>
              Only users with the <strong>Department Head</strong> or
              <strong> Admin</strong> role can be assigned.
            </p>

            <div className="flex gap-4 mt-8">

              <button
                onClick={saveDepartment}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-xl hover:scale-105 transition"
              >
                {editingId ? "Update Department" : "Create Department"}
              </button>

              {editingId && (

                <button
                  onClick={cancelEdit}
                  className="px-8 py-3 rounded-2xl bg-slate-600 hover:bg-slate-700 text-white font-bold transition"
                >
                  Cancel
                </button>

              )}

            </div>

          </div>
                    {/* ================= SEARCH ================= */}

          <div className={`${glass} p-6 mb-8`}>

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center">

                <FaSearch className="text-blue-600 text-xl" />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Search Departments
                </h2>

                <p className={muted}>
                  Search by department name or department head.
                </p>

              </div>

            </div>

            <input
              type="text"
              placeholder="Search department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                rounded-2xl
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-white
                px-5
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>

          {/* ================= TABLE ================= */}

          <div className={`${glass} overflow-hidden`}>

            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Departments
                </h2>

                <p className={`${muted} mt-2`}>
                  Manage all departments across the organization.
                </p>

              </div>

              <span className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold">

                {filteredDepartments.length} Departments

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead className="bg-slate-100 dark:bg-slate-800">

                  <tr className="text-left text-sm uppercase font-bold">

                    <th className="px-6 py-5">ID</th>
                    <th className="px-6 py-5">Department</th>
                    <th className="px-6 py-5">Parent</th>
                    <th className="px-6 py-5">Department Head</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredDepartments.map((dep) => (

                    <tr
                      key={dep.department_id}
                      className="
                        border-b
                        border-slate-200
                        dark:border-slate-700
                        hover:bg-slate-50
                        dark:hover:bg-slate-800/40
                        transition
                      "
                    >

                      <td className="px-6 py-5 font-semibold text-blue-600">
                        {dep.department_id}
                      </td>

                      <td className="px-6 py-5 font-semibold text-slate-900 dark:text-white">
                        {dep.department_name}
                      </td>

                      <td className="px-6 py-5 text-slate-600 dark:text-slate-300">
                        {dep.parent_department_name || "-"}
                      </td>

                      <td className="px-6 py-5 text-slate-600 dark:text-slate-300">
                        {dep.department_head_name || "-"}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white ${statusBadge(
                            dep.status || "Active"
                          )}`}
                        >
                          {dep.status || "Active"}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex justify-center gap-3">

                          <button
                            onClick={() => startEdit(dep)}
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-yellow-500
                              hover:bg-yellow-600
                              text-white
                              font-semibold
                              transition
                            "
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteDepartment(dep.department_id)
                            }
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-red-600
                              hover:bg-red-700
                              text-white
                              font-semibold
                              transition
                            "
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
                  </div>

      </div>

    </div>

  );
}

export default Departments;