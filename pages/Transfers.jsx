import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowRight,
  FaSearch,
} from "react-icons/fa";

import {
  confirmDelete,
  successAlert,
  errorAlert,
} from "../utils/alerts";

function Transfers() {
  const [transfers, setTransfers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const glass =
    "rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  /* ================= LOAD DATA ================= */

  const loadTransfers = async () => {
    try {
      const res = await api.get("/transfers");
      setTransfers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  /* ================= STATS ================= */

  const totalTransfers = useMemo(
    () => transfers.length,
    [transfers]
  );

  const requestedCount = useMemo(
    () =>
      transfers.filter(
        (t) => t.status === "Requested"
      ).length,
    [transfers]
  );

  const approvedCount = useMemo(
    () =>
      transfers.filter(
        (t) => t.status === "Approved"
      ).length,
    [transfers]
  );

  const rejectedCount = useMemo(
    () =>
      transfers.filter(
        (t) => t.status === "Rejected"
      ).length,
    [transfers]
  );

  /* ================= ACTIONS ================= */

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/transfers/${id}`, {
        status,
        approved_by: currentUser?.user_id,
      });

      successAlert(
        `Transfer ${status.toLowerCase()} successfully`
      );

      loadTransfers();
    } catch (err) {
      errorAlert(
        err.response?.data?.message ||
          "Error updating transfer"
      );
    }
  };

  const deleteTransfer = async (id) => {
    const result = await confirmDelete(
      "Transfer Request"
    );

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/transfers/${id}`);

      successAlert(
        "Transfer request removed successfully"
      );

      loadTransfers();
    } catch (err) {
      errorAlert(
        err.response?.data?.message ||
          "Error removing transfer"
      );
    }
  };

  const badgeColor = (status) => {
    switch (status) {
      case "Requested":
        return "bg-yellow-500";

      case "Approved":
        return "bg-green-600";

      case "Rejected":
        return "bg-red-600";

      default:
        return "bg-slate-500";
    }
  };

  /* ================= FILTER ================= */

  const filteredTransfers = transfers.filter(
    (transfer) => {
      const matchesSearch =
        transfer.asset_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        transfer.asset_tag
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        transfer.from_user_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        transfer.to_user_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "" ||
        transfer.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
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
                  Transfer Requests
                </h1>

                <p
                  className={`${muted} mt-4 text-sm sm:text-base lg:text-lg max-w-2xl`}
                >
                  Review, approve, reject and monitor every asset
                  transfer request from one modern enterprise dashboard.
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

                {/* Total */}

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total Requests
                  </p>

                  <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-blue-600">
                    {totalTransfers}
                  </h2>

                </div>

                {/* Pending */}

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pending
                  </p>

                  <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-yellow-500">
                    {requestedCount}
                  </h2>

                </div>

                {/* Approved */}

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Approved
                  </p>

                  <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-green-600">
                    {approvedCount}
                  </h2>

                </div>

                {/* Rejected */}

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Rejected
                  </p>

                  <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-red-600">
                    {rejectedCount}
                  </h2>

                </div>

              </div>

            </div>

          </div>

          {/* ================= SEARCH & FILTERS ================= */}

          <div className={`${glass} p-5 sm:p-8 mb-8`}>

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                gap-3
                mb-6
              "
            >

              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-slate-800 flex items-center justify-center">

                <FaSearch className="text-blue-600 dark:text-blue-400 text-xl" />

              </div>

              <div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Search & Filters
                </h2>

                <p className={`${muted} mt-1`}>
                  Quickly find transfer requests.
                </p>

              </div>

            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
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
                  placeholder="Search Asset / User..."
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
                    placeholder:text-slate-400
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
                  <option>Requested</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>

              </div>

            </div>

            {(search || statusFilter) && (

              <div className="mt-6 flex flex-wrap gap-3">

                {search && (

                  <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">
                    Search : {search}
                  </span>

                )}

                {statusFilter && (

                  <span className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm">
                    {statusFilter}
                  </span>

                )}

                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                  }}
                  className="
                    px-4
                    py-2
                    rounded-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    text-sm
                    transition
                  "
                >
                  Clear Filters
                </button>

              </div>

            )}

          </div>

          {/* ================= TRANSFERS TABLE ================= */}

          <div className={`${glass} overflow-hidden`}>

            <div className="px-5 sm:px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Transfer Requests
                </h2>

                <p className={`${muted} mt-2`}>
                  Manage all enterprise asset transfer requests.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <span className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold">

                  {filteredTransfers.length} Requests

                </span>

              </div>

            </div>

            {/* ================= DESKTOP TABLE ================= */}

            <div className="hidden xl:block overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead className="bg-slate-100 dark:bg-slate-800">

                  <tr className="text-left text-sm font-bold uppercase tracking-wide">

                    <th className="px-6 py-5">ID</th>

                    <th className="px-6 py-5">Asset</th>

                    <th className="px-6 py-5">Current Holder</th>

                    <th className="px-6 py-5">Transfer To</th>

                    <th className="px-6 py-5">Requested By</th>

                    <th className="px-6 py-5">Status</th>

                    <th className="px-6 py-5">Requested At</th>

                    <th className="px-6 py-5 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                                    {filteredTransfers.length > 0 ? (

                    filteredTransfers.map((transfer) => (

                      <tr
                        key={transfer.transfer_id}
                        className="
                          border-b
                          border-slate-200
                          dark:border-slate-700
                          hover:bg-slate-50
                          dark:hover:bg-slate-800/40
                          transition
                        "
                      >

                        {/* ID */}

                        <td className="px-6 py-6 font-semibold">
                          {transfer.transfer_id}
                        </td>

                        {/* Asset */}

                        <td className="px-6 py-6">

                          <div className="font-semibold text-slate-900 dark:text-white">
                            {transfer.asset_name}
                          </div>

                          <div className="text-xs text-blue-600 font-semibold mt-1">
                            {transfer.asset_tag}
                          </div>

                        </td>

                        {/* Current Holder */}

                        <td className="px-6 py-6">

                          <div className="font-medium text-slate-900 dark:text-white">

                            {transfer.from_user_name || "-"}

                          </div>

                        </td>

                        {/* Transfer To */}

                        <td className="px-6 py-6">

                          <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">

                            <FaArrowRight className="text-blue-600" />

                            {transfer.to_user_name}

                          </div>

                        </td>

                        {/* Requested By */}

                        <td className="px-6 py-6">

                          <span className="font-medium text-slate-900 dark:text-white">

                            {transfer.requested_by_name}

                          </span>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-6">

                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white ${badgeColor(
                              transfer.status
                            )}`}
                          >
                            {transfer.status}
                          </span>

                        </td>

                        {/* Requested At */}

                        <td className="px-6 py-6 whitespace-nowrap">

                          <span className="text-slate-700 dark:text-slate-300">

                            {new Date(
                              transfer.requested_at
                            ).toLocaleString()}

                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-6">

                          <div className="flex flex-wrap justify-center gap-2">

                            {transfer.status === "Requested" ? (

                              <>

                                <button
                                  onClick={() =>
                                    updateStatus(
                                      transfer.transfer_id,
                                      "Approved"
                                    )
                                  }
                                  className="
                                    px-4
                                    py-2
                                    rounded-xl
                                    bg-green-600
                                    hover:bg-green-700
                                    text-white
                                    font-medium
                                    transition
                                  "
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() =>
                                    updateStatus(
                                      transfer.transfer_id,
                                      "Rejected"
                                    )
                                  }
                                  className="
                                    px-4
                                    py-2
                                    rounded-xl
                                    bg-red-600
                                    hover:bg-red-700
                                    text-white
                                    font-medium
                                    transition
                                  "
                                >
                                  Reject
                                </button>

                              </>

                            ) : (

                              <button
                                onClick={() =>
                                  deleteTransfer(
                                    transfer.transfer_id
                                  )
                                }
                                className="
                                  px-4
                                  py-2
                                  rounded-xl
                                  bg-slate-700
                                  hover:bg-slate-800
                                  dark:bg-slate-600
                                  dark:hover:bg-slate-500
                                  text-white
                                  font-medium
                                  transition
                                "
                              >
                                Remove
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                                        <tr>

                      <td
                        colSpan={8}
                        className="py-20 text-center"
                      >

                        <div className="flex flex-col items-center gap-4">

                          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">

                            <FaExchangeAlt className="text-3xl text-slate-500" />

                          </div>

                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">

                            No Transfer Requests

                          </h3>

                          <p className={`${muted} max-w-md`}>

                            No transfer requests match the current filters.

                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* ================= MOBILE CARDS ================= */}

            <div className="xl:hidden p-5 space-y-5">

              {filteredTransfers.length > 0 ? (

                filteredTransfers.map((transfer) => (

                  <div
                    key={transfer.transfer_id}
                    className="
                      rounded-3xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-white
                      dark:bg-slate-900
                      shadow-lg
                      p-5
                    "
                  >

                    <div className="flex justify-between items-start">

                      <div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">

                          {transfer.asset_name}

                        </h3>

                        <p className="text-blue-600 font-semibold mt-1">

                          {transfer.asset_tag}

                        </p>

                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold text-white ${badgeColor(
                          transfer.status
                        )}`}
                      >
                        {transfer.status}
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5 text-sm">

                      <div>

                        <p className="text-slate-500">
                          Current Holder
                        </p>

                        <p className="font-semibold dark:text-white">

                          {transfer.from_user_name || "-"}

                        </p>

                      </div>

                      <div>

                        <p className="text-slate-500">
                          Transfer To
                        </p>

                        <p className="font-semibold dark:text-white">

                          {transfer.to_user_name}

                        </p>

                      </div>

                      <div>

                        <p className="text-slate-500">
                          Requested By
                        </p>

                        <p className="font-semibold dark:text-white">

                          {transfer.requested_by_name}

                        </p>

                      </div>

                      <div>

                        <p className="text-slate-500">
                          Requested At
                        </p>

                        <p className="font-semibold dark:text-white text-xs">

                          {new Date(
                            transfer.requested_at
                          ).toLocaleString()}

                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">

                      {transfer.status === "Requested" ? (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(
                                transfer.transfer_id,
                                "Approved"
                              )
                            }
                            className="py-3 rounded-xl bg-green-600 text-white"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                transfer.transfer_id,
                                "Rejected"
                              )
                            }
                            className="py-3 rounded-xl bg-red-600 text-white"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            deleteTransfer(
                              transfer.transfer_id
                            )
                          }
                          className="
                            col-span-2
                            py-3
                            rounded-xl
                            bg-slate-700
                            text-white
                          "
                        >
                          Remove
                        </button>
                      )}

                    </div>

                  </div>

                ))

              ) : (

                <div className="text-center py-12">

                  <FaExchangeAlt className="mx-auto text-5xl text-slate-400" />

                  <h3 className="mt-4 text-xl font-bold dark:text-white">

                    No Transfer Requests

                  </h3>

                  <p className={`${muted} mt-2`}>

                    Transfer requests will appear here.

                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Transfers;