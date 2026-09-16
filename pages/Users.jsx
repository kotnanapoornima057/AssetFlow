import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserTie,
  FaUserTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Employee",
    status: "Active",
    department_id: "",
  });

  const glass =
    "rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
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
    loadUsers();
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveUser = async () => {
    try {
      if (!form.full_name || !form.email) {
        alert("Full name and email are required.");
        return;
      }

      if (!editingId && !form.password) {
        alert("Password is required.");
        return;
      }

      if (editingId) {
        await api.put(`/users/${editingId}`, form);
      } else {
        await api.post("/users", form);
      }

      cancelEdit();
      loadUsers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error saving user"
      );
    }
  };

  const editUser = (user) => {
    setEditingId(user.user_id);

    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "Employee",
      status: user.status || "Active",
      department_id: user.department_id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      full_name: "",
      email: "",
      password: "",
      role: "Employee",
      status: "Active",
      department_id: "",
    });
  };

  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      alert(
        "Cannot delete this user — they have allocations, maintenance requests, or activity history linked to them. Consider setting their status to 'Inactive' instead."
      );
    }
  };

  /* ================= STATISTICS ================= */

  const totalUsers = useMemo(
    () => users.length,
    [users]
  );

  const activeUsers = useMemo(
    () =>
      users.filter(
        (u) => u.status === "Active"
      ).length,
    [users]
  );

  const departmentHeads = useMemo(
    () =>
      users.filter(
        (u) => u.role === "Department Head"
      ).length,
    [users]
  );

  const inactiveUsers = useMemo(
    () =>
      users.filter(
        (u) => u.status === "Inactive"
      ).length,
    [users]
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <div className="flex-1 min-w-0 xl:ml-72">

        <Navbar />

        <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-20">

          {/* ================= HERO ================= */}

          <div
            className={`${glass} relative overflow-hidden p-8 lg:p-10 mb-8`}
          >

            {/* Decorative Background */}

            <div className="absolute -top-24 -right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col 2xl:flex-row justify-between items-start gap-8">

              {/* LEFT SIDE */}

              <div className="flex-1">

                <p className="uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 font-semibold">

                  Enterprise Asset Management

                </p>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-3">

                  Employee Directory

                </h1>

                <p className={`${muted} mt-4 text-lg max-w-2xl`}>

                  Manage employees, department assignments,
                  roles and account status from one centralized
                  administration dashboard.

                </p>

              </div>

              {/* STATISTICS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full 2xl:w-auto 2xl:min-w-[760px]">

                {/* TOTAL */}

                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-white/20">

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total Users
                    </p>

                    <FaUsers className="text-blue-500" />

                  </div>

                  <h2 className="text-3xl font-bold text-blue-600 mt-2">
                    {totalUsers}
                  </h2>

                </div>

                {/* ACTIVE */}

                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-white/20">

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Active
                    </p>

                    <FaUserCheck className="text-green-500" />

                  </div>

                  <h2 className="text-3xl font-bold text-green-600 mt-2">
                    {activeUsers}
                  </h2>

                </div>

                {/* HEADS */}

                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-white/20">

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Heads
                    </p>

                    <FaUserTie className="text-indigo-500" />

                  </div>

                  <h2 className="text-3xl font-bold text-indigo-600 mt-2">
                    {departmentHeads}
                  </h2>

                </div>

                {/* INACTIVE */}

                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-white/20">

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Inactive
                    </p>

                    <FaUserTimes className="text-orange-500" />

                  </div>

                  <h2 className="text-3xl font-bold text-orange-600 mt-2">
                    {inactiveUsers}
                  </h2>

                </div>

              </div>

            </div>

          </div>

          {/* ================= USER FORM ================= */}

          <div className={`${glass} p-8 mb-8`}>

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">

                  {editingId
                    ? "Edit User"
                    : "Add User"}

                </h2>

                <p className={`${muted} mt-2`}>

                  {editingId
                    ? "Update employee information, role and account status."
                    : "Create a new employee account and assign their role."}

                </p>

              </div>

              <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-4xl shadow-xl">

                {editingId ? (
                  <FaUsers />
                ) : (
                  <FaUserPlus />
                )}

              </div>

            </div>

            {/* FORM */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {/* FULL NAME */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Full Name
                </label>

                <input
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
                  placeholder="Enter full name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Email
                </label>

                <input
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
                  placeholder="Enter email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />

              </div>

              {/* PASSWORD */}

              {!editingId && (

                <div>

                  <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                    Password
                  </label>

                  <input
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
                    placeholder="Enter password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                  />

                </div>

              )}

              {/* DEPARTMENT */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Department
                </label>

                <select
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
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
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

              </div>

              {/* ROLE */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Role
                </label>

                <select
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
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >

                  <option>Employee</option>
                  <option>Department Head</option>
                  <option>Asset Manager</option>
                  <option>Admin</option>

                </select>

              </div>

              {/* STATUS */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Status
                </label>

                <select
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
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >

                  <option>Active</option>
                  <option>Inactive</option>

                </select>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={saveUser}
                className="
                  px-8
                  py-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-700
                  text-white
                  font-bold
                  shadow-lg
                  hover:scale-105
                  transition
                "
              >

                {editingId
                  ? "Update User"
                  : "Add User"}

              </button>

              {editingId && (

                <button
                  onClick={cancelEdit}
                  className="
                    px-8
                    py-3
                    rounded-2xl
                    bg-slate-200
                    dark:bg-slate-700
                    text-slate-800
                    dark:text-white
                    font-semibold
                    hover:bg-slate-300
                    dark:hover:bg-slate-600
                    transition
                  "
                >
                  Cancel
                </button>

              )}

            </div>

          </div>

          {/* ================= USERS TABLE ================= */}

          <div className={`${glass} overflow-hidden`}>

            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700">

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Employee Directory
              </h2>

              <p className={`${muted} mt-2`}>
                View and manage all registered employees.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-[1000px] w-full">

                <thead className="bg-slate-100 dark:bg-slate-800">

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Department
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.map((u) => (

                    <tr
                      key={u.user_id}
                      className="
                        border-b
                        border-slate-200
                        dark:border-slate-700
                        hover:bg-slate-50
                        dark:hover:bg-slate-800/40
                        transition
                      "
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold">

                            {u.full_name
                              ?.charAt(0)
                              ?.toUpperCase()}

                          </div>

                          <span className="font-semibold text-slate-900 dark:text-white">
                            {u.full_name}
                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-5 text-slate-700 dark:text-slate-300">
                        {u.email}
                      </td>

                      <td className="px-6 py-5 text-slate-700 dark:text-slate-300">
                        {u.department_name || "-"}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-bold
                            ${
                              u.role === "Admin"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : u.role === "Department Head"
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : u.role === "Asset Manager"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }
                          `}
                        >
                          {u.role}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-bold
                            ${
                              u.status === "Active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            }
                          `}
                        >
                          {u.status}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex flex-wrap justify-center gap-2">

                          <button
                            onClick={() => editUser(u)}
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-orange-500
                              hover:bg-orange-600
                              text-white
                              font-semibold
                              transition
                            "
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteUser(u.user_id)
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

          {/* ================= EMPTY STATE ================= */}

          {users.length === 0 && (

            <div className={`${glass} mt-8 p-12 text-center`}>

              <div className="flex justify-center mb-6">

                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl text-slate-500 dark:text-slate-300">

                  <FaUsers />

                </div>

              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                No Users Found
              </h2>

              <p className={`${muted} mt-3 text-lg`}>
                Add an employee to see them in the directory.
              </p>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default Users;