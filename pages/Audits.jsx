import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaClipboardCheck,
  FaSearch,
} from "react-icons/fa";

function Audits() {
  const [audits, setAudits] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedAudit, setSelectedAudit] = useState(null);

  const [items, setItems] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [showDiscrepancies, setShowDiscrepancies] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [form, setForm] = useState({
    audit_name: "",
    department_id: "",
    start_date: "",
    end_date: "",
    auditor_name: "",
  });

  /* ================= LOAD DATA ================= */

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
  }, []);

  /* ================= UI ================= */

  const glass =
    "rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  /* ================= STATS ================= */

  const totalAudits = useMemo(() => audits.length, [audits]);

  const openAudits = useMemo(
    () => audits.filter((a) => a.status === "Open").length,
    [audits]
  );

  const closedAudits = useMemo(
    () => audits.filter((a) => a.status === "Closed").length,
    [audits]
  );

  const totalDepartments = useMemo(() => {
    return [
      ...new Set(
        audits
          .map((a) => a.department_name)
          .filter(Boolean)
      ),
    ].length;
  }, [audits]);

  /* ================= FILTER ================= */

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.audit_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (audit.auditor_name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      audit.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "" ||
      audit.department_name === departmentFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDepartment
    );
  });

  /* ================= FORM ================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createAudit = async () => {
    if (
      !form.audit_name ||
      !form.start_date ||
      !form.end_date
    ) {
      alert(
        "Audit name, start date and end date are required."
      );
      return;
    }

    try {
      await api.post("/audits", form);

      setForm({
        audit_name: "",
        department_id: "",
        start_date: "",
        end_date: "",
        auditor_name: "",
      });

      loadAudits();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error creating audit."
      );
    }
  };

  /* ================= OPEN AUDIT ================= */

  const openAudit = async (audit) => {
    setSelectedAudit(audit);
    setShowDiscrepancies(false);

    try {
      const res = await api.get(
        `/audits/${audit.audit_id}/items`
      );

      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateItemStatus = async (
    itemId,
    verification_status,
    remarks
  ) => {
    try {
      await api.put(`/audits/items/${itemId}`, {
        verification_status,
        remarks,
      });

      const updated = await api.get(
        `/audits/${selectedAudit.audit_id}/items`
      );

      setItems(updated.data);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error updating item."
      );
    }
  };

  const viewDiscrepancies = async () => {
    try {
      const res = await api.get(
        `/audits/${selectedAudit.audit_id}/discrepancies`
      );

      setDiscrepancies(res.data);
      setShowDiscrepancies(true);
    } catch (err) {
      console.log(err);
    }
  };

  const closeAuditCycle = async () => {
    if (
      !window.confirm(
        "Closing this audit will lock it and update asset statuses. Continue?"
      )
    )
      return;

    try {
      await api.put(
        `/audits/${selectedAudit.audit_id}/close`
      );

      alert("Audit closed successfully.");

      loadAudits();
      setSelectedAudit(null);
      setItems([]);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error closing audit."
      );
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-600";
      case "Missing":
        return "bg-red-600";
      case "Damaged":
        return "bg-orange-600";
      case "Open":
        return "bg-blue-600";
      case "Closed":
        return "bg-slate-700";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      <Sidebar />

      <div className="flex-1 md:ml-72">

        <Navbar />

        <div className="mt-24 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">

          {/* ================= HERO ================= */}

<div
  className={`${glass} relative overflow-hidden mb-8 px-6 py-8 sm:px-8 sm:py-10 lg:px-12`}
>
  {/* Background Blobs */}

  <div className="absolute -top-20 -right-16 w-60 h-60 sm:w-72 sm:h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

  <div className="absolute -bottom-20 -left-16 w-60 h-60 sm:w-72 sm:h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>

  <div
    className="
      relative
      z-10
      flex
      flex-col
      xl:flex-row
      justify-between
      items-start
      xl:items-center
      gap-8
    "
  >

    {/* LEFT */}

    <div className="w-full xl:w-auto">

      <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold">
        Enterprise Asset Management
      </p>

      <h1
        className="
          mt-3
          text-3xl
          sm:text-4xl
          lg:text-5xl
          font-extrabold
          text-slate-900
          dark:text-white
          leading-tight
        "
      >
        Asset Audit Cycles
      </h1>

      <p
        className={`${muted} mt-4 text-sm sm:text-base lg:text-lg max-w-2xl`}
      >
        Plan, execute and manage enterprise audit cycles while
        tracking verification, discrepancies and audit history
        in one centralized dashboard.
      </p>

    </div>

    {/* RIGHT */}

    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-2
        lg:grid-cols-4
        xl:grid-cols-2
        gap-4
        w-full
        xl:w-auto
      "
    >

      <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Total Audits
        </p>

        <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-blue-600">
          {totalAudits}
        </h2>

      </div>

      <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Open
        </p>

        <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-green-600">
          {openAudits}
        </h2>

      </div>

      <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Closed
        </p>

        <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-red-600">
          {closedAudits}
        </h2>

      </div>

      <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Departments
        </p>

        <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-indigo-600">
          {totalDepartments}
        </h2>

      </div>

    </div>

  </div>

</div>

          {/* ================= CREATE AUDIT ================= */}

          <div className={`${glass} p-5 sm:p-8 mb-8`}>

            {/* Header */}

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-6
                mb-8
              "
            >

              <div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  📋 Create Audit Cycle
                </h2>

                <p className={`${muted} mt-2`}>
                  Schedule a new audit cycle for a department or for the
                  entire organization.
                </p>

              </div>

              <div
                className="
                  hidden
                  lg:flex
                  items-center
                  justify-center
                  w-20
                  h-20
                  rounded-3xl
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-700
                  text-white
                  text-4xl
                  shadow-xl
                "
              >
                <FaClipboardCheck />
              </div>

            </div>

            {/* FORM */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
              "
            >

              {/* Audit Name */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Audit Cycle Name
                </label>

                <input
                  name="audit_name"
                  value={form.audit_name}
                  onChange={handleChange}
                  placeholder="Quarterly IT Audit"
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

              {/* Department */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Department
                </label>

                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
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
                >

                  <option value="">All Departments</option>

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

              {/* Auditor */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Auditor Name
                </label>

                <input
                  name="auditor_name"
                  value={form.auditor_name}
                  onChange={handleChange}
                  placeholder="John Smith"
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

                            {/* Start Date */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Start Date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
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

              {/* End Date */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  End Date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
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

            </div>

            {/* Button */}

            <div className="mt-8">

              <button
                onClick={createAudit}
                className="
                  px-8
                  py-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-700
                  text-white
                  font-bold
                  shadow-xl
                  hover:scale-105
                  transition
                "
              >
                Create Audit Cycle
              </button>

            </div>

          </div>

                    {/* ================= SEARCH & FILTER ================= */}

          <div className={`${glass} p-6 mb-8`}>

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center">
                <FaSearch className="text-blue-600 text-xl" />
              </div>

              <div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Search & Filters
                </h2>

                <p className={muted}>
                  Quickly locate audit cycles.
                </p>

              </div>

            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-5
              "
            >

              {/* Search */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Search
                </label>

                <input
                  type="text"
                  placeholder="Audit Name / Auditor"
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

              {/* Status */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                >

                  <option value="">All Status</option>
                  <option>Open</option>
                  <option>Closed</option>

                </select>

              </div>

              {/* Department */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Department
                </label>

                <select
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(e.target.value)
                  }
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
                >

                  <option value="">All Departments</option>

                  {departments.map((d) => (

                    <option
                      key={d.department_id}
                      value={d.department_name}
                    >
                      {d.department_name}
                    </option>

                  ))}

                </select>

              </div>

            </div>

          </div>

          {/* ================= AUDIT TABLE ================= */}

          <div className={`${glass} overflow-hidden`}>

            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Audit Cycles
                </h2>

                <p className={`${muted} mt-2`}>
                  Manage all scheduled audit cycles.
                </p>

              </div>

              <span className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold">
                {filteredAudits.length} Audits
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-100 dark:bg-slate-800">

                  <tr>

                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Audit Name</th>
                    <th className="px-6 py-4 text-left">Department</th>
                    <th className="px-6 py-4 text-left">Start Date</th>
                    <th className="px-6 py-4 text-left">End Date</th>
                    <th className="px-6 py-4 text-left">Auditor</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAudits.map((a) => (

                    <tr
                      key={a.audit_id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >

                      <td className="px-6 py-5">{a.audit_id}</td>

                      <td className="px-6 py-5 font-semibold">
                        {a.audit_name}
                      </td>

                      <td className="px-6 py-5">
                        {a.department_name || "All"}
                      </td>

                      <td className="px-6 py-5">
                        {a.start_date?.substring(0, 10)}
                      </td>

                      <td className="px-6 py-5">
                        {a.end_date?.substring(0, 10)}
                      </td>

                      <td className="px-6 py-5">
                        {a.auditor_name}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-bold ${statusBadge(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-center">

                        <button
                          onClick={() => openAudit(a)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Open
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* ================= SELECTED AUDIT ================= */}

{selectedAudit && (

  <div className={`${glass} p-6 mt-8`}>

    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

      <div>

        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          {selectedAudit.audit_name}
        </h2>

        <p className={`${muted} mt-2`}>
          Audit ID #{selectedAudit.audit_id}
        </p>

      </div>

      <div className="flex flex-wrap gap-3">

        <button
          onClick={viewDiscrepancies}
          className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
        >
          View Discrepancies
        </button>

        {selectedAudit.status !== "Closed" && (

          <button
            onClick={closeAuditCycle}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            Close Audit
          </button>

        )}

      </div>

    </div>

    {!showDiscrepancies && (

      <div className={`${glass} overflow-hidden`}>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="bg-slate-100 dark:bg-slate-800">

              <tr>

                <th className="px-6 py-4 text-left">
                  Asset Tag
                </th>

                <th className="px-6 py-4 text-left">
                  Asset Name
                </th>

                <th className="px-6 py-4 text-left">
                  Status
                </th>

                <th className="px-6 py-4 text-left">
                  Remarks
                </th>

                <th className="px-6 py-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {items.map((item) => (

                <tr
                  key={item.audit_item_id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >

                  <td className="px-6 py-5 font-semibold text-blue-600">
                    {item.asset_tag}
                  </td>

                  <td className="px-6 py-5 text-slate-900 dark:text-white">
                    {item.asset_name}
                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white ${statusBadge(
                        item.verification_status
                      )}`}
                    >
                      {item.verification_status}
                    </span>

                  </td>

                  <td className="px-6 py-5">
                    {item.remarks || "-"}
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex flex-wrap justify-center gap-2">

                      <button
                        disabled={selectedAudit.status === "Closed"}
                        onClick={() =>
                          updateItemStatus(
                            item.audit_item_id,
                            "Verified",
                            ""
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white"
                      >
                        Verified
                      </button>

                      <button
                        disabled={selectedAudit.status === "Closed"}
                        onClick={() => {
                          const remarks = prompt(
                            "Remarks for Missing:"
                          );

                          if (remarks !== null) {
                            updateItemStatus(
                              item.audit_item_id,
                              "Missing",
                              remarks
                            );
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white"
                      >
                        Missing
                      </button>

                      <button
                        disabled={selectedAudit.status === "Closed"}
                        onClick={() => {
                          const remarks = prompt(
                            "Remarks for Damaged:"
                          );

                          if (remarks !== null) {
                            updateItemStatus(
                              item.audit_item_id,
                              "Damaged",
                              remarks
                            );
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white"
                      >
                        Damaged
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    )}

        {showDiscrepancies && (

      <div className={`${glass} p-6`}>

        <div className="flex items-center justify-between mb-6">

          <div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Discrepancy Report
            </h3>

            <p className={`${muted} mt-1`}>
              Missing and damaged assets detected during this audit.
            </p>

          </div>

          <button
            onClick={() => setShowDiscrepancies(false)}
            className="px-5 py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold transition"
          >
            Back to Items
          </button>

        </div>

        {discrepancies.length === 0 ? (

          <div className="text-center py-14">

            <div className="text-6xl mb-5">
              ✅
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              No Discrepancies Found
            </h3>

            <p className={`${muted} mt-2`}>
              Every audited asset has been verified successfully.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-slate-100 dark:bg-slate-800">

                <tr>

                  <th className="px-6 py-4 text-left">
                    Asset Tag
                  </th>

                  <th className="px-6 py-4 text-left">
                    Asset Name
                  </th>

                  <th className="px-6 py-4 text-left">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {discrepancies.map((d) => (

                  <tr
                    key={d.audit_item_id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >

                    <td className="px-6 py-5 font-semibold text-blue-600">
                      {d.asset_tag}
                    </td>

                    <td className="px-6 py-5 text-slate-900 dark:text-white">
                      {d.asset_name}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white ${
                          d.verification_status === "Missing"
                            ? "bg-red-600"
                            : "bg-orange-500"
                        }`}
                      >
                        {d.verification_status}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-slate-600 dark:text-slate-300">
                      {d.remarks || "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    )}

  </div>

)}

        </div>

      </div>

    </div>

  );

}

export default Audits;