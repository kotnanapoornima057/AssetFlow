import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaExchangeAlt,
  FaBoxOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    asset_id: "",
    user_id: "",
    expected_return: "",
  });

  const [conflict, setConflict] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  /* =========================
     COMMON STYLES
  ========================= */

  const glass =
    "rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  /* =========================
     LOAD DATA
  ========================= */

  const loadAllocations = async () => {
    try {
      const res = await api.get("/allocations");
      setAllocations(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAssets = async () => {
    try {
      const res = await api.get("/assets");
      setAssets(res.data);
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
    loadAllocations();
    loadAssets();
    loadUsers();
  }, []);

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setConflict(null);
  };

  /* =========================
     STATISTICS
  ========================= */

  const totalAllocations = useMemo(
    () => allocations.length,
    [allocations]
  );

  const totalAllocated = useMemo(
    () =>
      allocations.filter(
        (a) => a.allocation_status === "Allocated"
      ).length,
    [allocations]
  );

  const totalReturned = useMemo(
    () =>
      allocations.filter(
        (a) => a.allocation_status === "Returned"
      ).length,
    [allocations]
  );

  const pendingReturns = useMemo(
    () =>
      allocations.filter(
        (a) =>
          a.allocation_status === "Allocated" &&
          a.expected_return
      ).length,
    [allocations]
  );

  /* =========================
     ALLOCATE ASSET
  ========================= */

  const allocateAsset = async () => {
    if (!form.asset_id || !form.user_id) {
      alert("Asset and User are required.");
      return;
    }

    setConflict(null);

    try {
      await api.post("/allocations", form);

      setForm({
        asset_id: "",
        user_id: "",
        expected_return: "",
      });

      await loadAllocations();
      await loadAssets();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Error allocating asset";

      if (message.includes("not Available")) {
        const asset = assets.find(
          (a) => a.asset_id === Number(form.asset_id)
        );

        const holder = allocations.find(
          (a) =>
            a.asset_id === Number(form.asset_id) &&
            a.allocation_status === "Allocated"
        );

        setConflict({
          message: `${asset?.asset_name || "This asset"} is currently allocated to ${
            holder?.full_name || "another employee"
          }.`,
        });
      } else {
        alert(message);
      }
    }
  };

  /* =========================
     REQUEST TRANSFER
  ========================= */

  const requestTransfer = async () => {
    try {
      await api.post("/transfers", {
        asset_id: form.asset_id,
        to_user_id: form.user_id,
        requested_by: currentUser?.user_id,
      });

      alert("Transfer request raised successfully.");

      setConflict(null);

      setForm({
        asset_id: "",
        user_id: "",
        expected_return: "",
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Transfer request failed."
      );
    }
  };

  /* =========================
     RETURN ASSET
  ========================= */

  const returnAsset = async (id) => {
    const notes = prompt("Enter condition notes:");

    if (notes === null) return;

    try {
      await api.put(`/allocations/${id}/return`, {
        condition_notes: notes,
      });

      await loadAllocations();
      await loadAssets();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Return failed."
      );
    }
  };

  /* =========================
     DELETE ALLOCATION
  ========================= */

  const deleteAllocation = async (id) => {
    if (!window.confirm("Delete allocation record?")) {
      return;
    }

    try {
      await api.delete(`/allocations/${id}`);

      await loadAllocations();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Delete failed."
      );
    }
  };

  /* =========================
     STATUS BADGE
  ========================= */

  const badgeColor = (status) => {
    switch (status) {
      case "Allocated":
        return "bg-blue-600";

      case "Returned":
        return "bg-green-600";

      default:
        return "bg-slate-500";
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        overflow-x-hidden
        bg-gradient-to-br
        from-slate-100
        via-blue-50
        to-indigo-100
        dark:from-slate-950
        dark:via-slate-900
        dark:to-slate-950
      "
    >

      {/* =========================
          SIDEBAR
      ========================= */}

      <Sidebar />

      {/* =========================
          MAIN AREA
      ========================= */}

      <div
        className="
          flex-1
          min-w-0
          w-full
          xl:ml-72
        "
      >

        <Navbar />

        <main
          className="
            w-full
            max-w-[1800px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            pt-24
            pb-10
          "
        >

          {/* =====================================================
              HERO SECTION
          ===================================================== */}

          <section
            className={`
              ${glass}
              relative
              overflow-hidden
              p-6
              sm:p-8
              lg:p-10
              mb-8
            `}
          >

            {/* Decorative Background */}

            <div
              className="
                absolute
                -top-24
                -right-20
                w-72
                h-72
                bg-blue-500/20
                rounded-full
                blur-3xl
                pointer-events-none
              "
            />

            <div
              className="
                absolute
                -bottom-24
                -left-20
                w-72
                h-72
                bg-cyan-500/20
                rounded-full
                blur-3xl
                pointer-events-none
              "
            />

            {/* HERO CONTENT */}

            <div
              className="
                relative
                z-10
                grid
                grid-cols-1
                2xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]
                gap-8
                items-start
              "
            >

              {/* =========================
                  LEFT SIDE
              ========================= */}

              <div className="min-w-0">

                <p
                  className="
                    uppercase
                    tracking-[0.25em]
                    sm:tracking-[0.3em]
                    text-blue-600
                    dark:text-blue-400
                    font-semibold
                    text-xs
                    sm:text-sm
                  "
                >
                  Enterprise Asset Management
                </p>

                <h1
                  className="
                    text-3xl
                    sm:text-4xl
                    lg:text-5xl
                    font-bold
                    text-slate-900
                    dark:text-white
                    mt-3
                    break-words
                  "
                >
                  Asset Allocation
                </h1>

                <p
                  className={`
                    ${muted}
                    mt-4
                    text-base
                    sm:text-lg
                    leading-7
                    max-w-2xl
                  `}
                >
                  Allocate enterprise assets, monitor active
                  allocations, manage returns and transfer
                  requests from one modern dashboard.
                </p>

              </div>

              {/* =========================
                  STATISTICS
              ========================= */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-4
                  gap-4
                  sm:gap-5
                  min-w-0
                  w-full
                "
              >

                {/* TOTAL */}

                <div
                  className="
                    bg-white/50
                    dark:bg-slate-800/50
                    backdrop-blur-xl
                    rounded-2xl
                    p-5
                    border
                    border-white/30
                    dark:border-slate-700
                    min-w-0
                  "
                >

                  <p
                    className="
                      text-sm
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Total Allocations
                  </p>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-blue-600
                      mt-2
                    "
                  >
                    {totalAllocations}
                  </h2>

                </div>

                {/* ACTIVE */}

                <div
                  className="
                    bg-white/50
                    dark:bg-slate-800/50
                    backdrop-blur-xl
                    rounded-2xl
                    p-5
                    border
                    border-white/30
                    dark:border-slate-700
                    min-w-0
                  "
                >

                  <div className="flex items-center justify-between gap-2">

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Active
                    </p>

                    <FaExchangeAlt className="text-green-500 shrink-0" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-green-600
                      mt-2
                    "
                  >
                    {totalAllocated}
                  </h2>

                </div>

                {/* RETURNED */}

                <div
                  className="
                    bg-white/50
                    dark:bg-slate-800/50
                    backdrop-blur-xl
                    rounded-2xl
                    p-5
                    border
                    border-white/30
                    dark:border-slate-700
                    min-w-0
                  "
                >

                  <div className="flex items-center justify-between gap-2">

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Returned
                    </p>

                    <FaBoxOpen className="text-indigo-500 shrink-0" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-indigo-600
                      mt-2
                    "
                  >
                    {totalReturned}
                  </h2>

                </div>

                {/* PENDING */}

                <div
                  className="
                    bg-white/50
                    dark:bg-slate-800/50
                    backdrop-blur-xl
                    rounded-2xl
                    p-5
                    border
                    border-white/30
                    dark:border-slate-700
                    min-w-0
                  "
                >

                  <div className="flex items-center justify-between gap-2">

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Pending Returns
                    </p>

                    <FaExclamationTriangle className="text-orange-500 shrink-0" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-orange-600
                      mt-2
                    "
                  >
                    {pendingReturns}
                  </h2>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              ALLOCATION FORM
          ===================================================== */}

          <section
            className={`${glass} p-5 sm:p-6 lg:p-8 mb-8`}
          >

            {/* FORM HEADER */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-5
                mb-8
              "
            >

              <div className="min-w-0">

                <h2
                  className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Allocate Asset
                </h2>

                <p
                  className={`${muted} mt-2`}
                >
                  Assign an available asset to an employee.
                </p>

              </div>

              {/* ICON */}

              <div
                className="
                  hidden
                  sm:flex
                  shrink-0
                  items-center
                  justify-center
                  w-16
                  h-16
                  lg:w-20
                  lg:h-20
                  rounded-3xl
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-700
                  text-white
                  text-3xl
                  lg:text-4xl
                  shadow-xl
                "
              >
                <FaExchangeAlt />
              </div>

            </div>

            {/* FORM GRID */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-5
                lg:gap-6
              "
            >

              {/* ASSET */}

              <div className="min-w-0">

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Select Asset
                </label>

                <select
                  name="asset_id"
                  value={form.asset_id}
                  onChange={handleChange}
                  className="
                    w-full
                    min-w-0
                    rounded-2xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-800
                    text-slate-900
                    dark:text-white
                    px-4
                    sm:px-5
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                >

                  <option value="">
                    Select Asset
                  </option>

                  {assets.map((asset) => (

                    <option
                      key={asset.asset_id}
                      value={asset.asset_id}
                    >
                      {asset.asset_name} ({asset.asset_tag}) -{" "}
                      {asset.status}
                    </option>

                  ))}

                </select>

              </div>

              {/* EMPLOYEE */}

              <div className="min-w-0">

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Allocate To
                </label>

                <select
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  className="
                    w-full
                    min-w-0
                    rounded-2xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-800
                    text-slate-900
                    dark:text-white
                    px-4
                    sm:px-5
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                >

                  <option value="">
                    Select Employee
                  </option>

                  {users.map((user) => (

                    <option
                      key={user.user_id}
                      value={user.user_id}
                    >
                      {user.full_name}
                    </option>

                  ))}

                </select>

              </div>

              {/* EXPECTED RETURN */}

              <div className="min-w-0">

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Expected Return
                </label>

                <input
                  type="date"
                  name="expected_return"
                  value={form.expected_return}
                  onChange={handleChange}
                  className="
                    w-full
                    min-w-0
                    rounded-2xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-800
                    text-slate-900
                    dark:text-white
                    px-4
                    sm:px-5
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>

            </div>

            {/* ALLOCATE BUTTON */}

            <div className="mt-7 flex flex-wrap gap-4">

              <button
                onClick={allocateAsset}
                className="
                  w-full
                  sm:w-auto
                  px-8
                  py-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-700
                  text-white
                  font-bold
                  shadow-lg
                  hover:shadow-xl
                  hover:scale-[1.02]
                  transition
                "
              >
                Allocate Asset
              </button>

            </div>

            {/* =================================================
                CONFLICT CARD
            ================================================= */}

            {conflict && (

              <div
                className="
                  mt-8
                  rounded-3xl
                  border
                  border-yellow-300
                  dark:border-yellow-700
                  bg-yellow-50
                  dark:bg-yellow-900/20
                  p-5
                  sm:p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    items-start
                    gap-4
                  "
                >

                  <div
                    className="
                      text-3xl
                      text-yellow-500
                      shrink-0
                    "
                  >
                    <FaExclamationTriangle />
                  </div>

                  <div className="flex-1 min-w-0">

                    <h3
                      className="
                        text-xl
                        font-bold
                        text-yellow-700
                        dark:text-yellow-300
                      "
                    >
                      Allocation Conflict
                    </h3>

                    <p
                      className="
                        mt-2
                        text-yellow-700
                        dark:text-yellow-200
                        break-words
                      "
                    >
                      {conflict.message}
                    </p>

                    <button
                      onClick={requestTransfer}
                      className="
                        mt-5
                        w-full
                        sm:w-auto
                        px-6
                        py-3
                        rounded-xl
                        bg-gradient-to-r
                        from-orange-500
                        to-red-500
                        text-white
                        font-semibold
                        hover:scale-[1.02]
                        transition
                      "
                    >
                      Request Transfer
                    </button>

                  </div>

                </div>

              </div>

            )}

          </section>

          {/* =====================================================
              ALLOCATION HISTORY
          ===================================================== */}

          <section
            className={`${glass} overflow-hidden`}
          >

            {/* TABLE HEADER */}

            <div
              className="
                px-5
                sm:px-6
                lg:px-8
                py-5
                sm:py-6
                border-b
                border-slate-200
                dark:border-slate-700
              "
            >

              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Allocation History
              </h2>

              <p
                className={`${muted} mt-2`}
              >
                View, return and manage allocated assets.
              </p>

            </div>

            {/* TABLE WRAPPER */}

            <div className="w-full overflow-x-auto">

              <table
                className="
                  min-w-[1100px]
                  w-full
                  border-collapse
                "
              >

                <thead
                  className="
                    bg-slate-100
                    dark:bg-slate-800
                  "
                >

                  <tr>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      ID
                    </th>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      Asset
                    </th>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      Employee
                    </th>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      Allocated
                    </th>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      Expected Return
                    </th>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      Returned
                    </th>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left whitespace-nowrap">
                      Condition
                    </th>

                    <th className="px-5 py-4 text-center whitespace-nowrap">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {allocations.map((allocation) => (

                    <tr
                      key={allocation.allocation_id}
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

                      <td
                        className="
                          px-5
                          py-5
                          text-slate-900
                          dark:text-white
                          whitespace-nowrap
                        "
                      >
                        {allocation.allocation_id}
                      </td>

                      {/* ASSET */}

                      <td className="px-5 py-5">

                        <div className="flex flex-col">

                          <span
                            className="
                              font-semibold
                              text-slate-900
                              dark:text-white
                              whitespace-nowrap
                            "
                          >
                            {allocation.asset_name}
                          </span>

                          <span
                            className="
                              text-sm
                              text-slate-500
                              dark:text-slate-400
                              whitespace-nowrap
                            "
                          >
                            {allocation.asset_tag}
                          </span>

                        </div>

                      </td>

                      {/* EMPLOYEE */}

                      <td
                        className="
                          px-5
                          py-5
                          text-slate-900
                          dark:text-white
                          whitespace-nowrap
                        "
                      >
                        {allocation.full_name}
                      </td>

                      {/* ALLOCATED DATE */}

                      <td
                        className="
                          px-5
                          py-5
                          text-slate-900
                          dark:text-white
                          whitespace-nowrap
                        "
                      >
                        {allocation.allocated_date
                          ? new Date(
                              allocation.allocated_date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* EXPECTED RETURN */}

                      <td
                        className="
                          px-5
                          py-5
                          text-slate-900
                          dark:text-white
                          whitespace-nowrap
                        "
                      >
                        {allocation.expected_return
                          ? new Date(
                              allocation.expected_return
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* RETURNED DATE */}

                      <td
                        className="
                          px-5
                          py-5
                          text-slate-900
                          dark:text-white
                          whitespace-nowrap
                        "
                      >
                        {allocation.returned_date
                          ? new Date(
                              allocation.returned_date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <span
                          className={`
                            inline-flex
                            items-center
                            px-4
                            py-2
                            rounded-full
                            text-xs
                            font-bold
                            text-white
                            whitespace-nowrap
                            ${badgeColor(
                              allocation.allocation_status
                            )}
                          `}
                        >
                          {allocation.allocation_status}
                        </span>

                      </td>

                      {/* CONDITION */}

                      <td
                        className="
                          px-5
                          py-5
                          text-slate-900
                          dark:text-white
                          max-w-[250px]
                        "
                      >
                        <span className="block truncate">
                          {allocation.condition_notes || "-"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-5">

                        <div
                          className="
                            flex
                            flex-wrap
                            justify-center
                            gap-2
                          "
                        >

                          {allocation.allocation_status ===
                            "Allocated" && (

                            <button
                              onClick={() =>
                                returnAsset(
                                  allocation.allocation_id
                                )
                              }
                              className="
                                px-4
                                py-2
                                rounded-xl
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                transition
                                whitespace-nowrap
                              "
                            >
                              Return
                            </button>

                          )}

                          <button
                            onClick={() =>
                              deleteAllocation(
                                allocation.allocation_id
                              )
                            }
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-red-600
                              hover:bg-red-700
                              text-white
                              transition
                              whitespace-nowrap
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

          </section>

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {allocations.length === 0 && (

            <section
              className={`${glass} mt-8 p-8 sm:p-12 text-center`}
            >

              <div className="flex justify-center mb-6">

                <div
                  className="
                    w-20
                    h-20
                    sm:w-24
                    sm:h-24
                    rounded-full
                    bg-slate-200
                    dark:bg-slate-800
                    flex
                    items-center
                    justify-center
                    text-3xl
                    sm:text-4xl
                    text-slate-500
                    dark:text-slate-300
                  "
                >
                  <FaBoxOpen />
                </div>

              </div>

              <h2
                className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                No Allocations Found
              </h2>

              <p
                className={`${muted} mt-3 text-base sm:text-lg`}
              >
                Allocate an asset to an employee to see
                records here.
              </p>

            </section>

          )}

        </main>

      </div>

    </div>
  );
}

export default Allocations;