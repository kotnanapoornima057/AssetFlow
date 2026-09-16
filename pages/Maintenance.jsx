import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaTools,
  FaClock,
  FaCheckCircle,
  FaWrench,
  FaCamera,
  FaUpload,
  FaUser,
} from "react-icons/fa";


function Maintenance() {

  // ============================================================
  // STATE
  // ============================================================

  const [maintenance, setMaintenance] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [form, setForm] = useState({
    asset_id: "",
    raised_by: "",
    issue_description: "",
    priority: "Medium",
  });

  const [selectedPhoto, setSelectedPhoto] = useState({});
  const [photoPreview, setPhotoPreview] = useState({});

  const [loading, setLoading] = useState(false);


  // ============================================================
  // CURRENT USER
  // ============================================================

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );


  // ============================================================
  // STYLING
  // ============================================================

  const glass =
    "rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";


  // ============================================================
  // LOAD MAINTENANCE
  // ============================================================

  const loadMaintenance = async () => {
    try {

      const res = await api.get("/maintenance");

      setMaintenance(res.data || []);

    } catch (err) {

      console.log(
        "Error loading maintenance:",
        err
      );

    }
  };


  // ============================================================
  // LOAD ASSETS
  // ============================================================

  const loadAssets = async () => {
    try {

      const res = await api.get("/assets");

      setAssets(res.data || []);

    } catch (err) {

      console.log(
        "Error loading assets:",
        err
      );

    }
  };


  // ============================================================
  // LOAD USERS
  // ============================================================

  const loadUsers = async () => {
    try {

      const res = await api.get("/users");

      setUsers(res.data || []);

    } catch (err) {

      console.log(
        "Error loading users:",
        err
      );

    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadMaintenance();
    loadAssets();
    loadUsers();

  }, []);


  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  // ============================================================
  // STATISTICS
  // ============================================================

  const totalRequests = useMemo(
    () => maintenance.length,
    [maintenance]
  );


  const pendingRequests = useMemo(
    () =>
      maintenance.filter(
        (m) =>
          String(m.status || "")
            .toLowerCase() === "pending"
      ).length,
    [maintenance]
  );


  const inProgressRequests = useMemo(
    () =>
      maintenance.filter((m) => {

        const status = String(
          m.status || ""
        ).toLowerCase();

        return (
          status === "in progress" ||
          status === "technician assigned"
        );

      }).length,
    [maintenance]
  );


  const resolvedRequests = useMemo(
    () =>
      maintenance.filter(
        (m) =>
          String(m.status || "")
            .toLowerCase() === "resolved"
      ).length,
    [maintenance]
  );


  // ============================================================
  // FILTER
  // ============================================================

  const filteredMaintenance = useMemo(() => {

    return maintenance.filter((item) => {

      const statusMatch =
        statusFilter === "" ||
        String(item.status || "")
          .toLowerCase() ===
          statusFilter.toLowerCase();

      const priorityMatch =
        priorityFilter === "" ||
        String(item.priority || "")
          .toLowerCase() ===
          priorityFilter.toLowerCase();

      return (
        statusMatch &&
        priorityMatch
      );

    });

  }, [
    maintenance,
    statusFilter,
    priorityFilter,
  ]);


  // ============================================================
  // ADD MAINTENANCE REQUEST
  // ============================================================

  const addMaintenanceRequest = async () => {

    if (
      !form.asset_id ||
      !form.raised_by ||
      !form.issue_description
    ) {

      alert(
        "Please fill all required fields."
      );

      return;
    }

    try {

      setLoading(true);

      await api.post(
        "/maintenance",
        {
          asset_id: form.asset_id,
          raised_by: form.raised_by,
          issue_description:
            form.issue_description,
          priority: form.priority,
        }
      );

      setForm({
        asset_id: "",
        raised_by: "",
        issue_description: "",
        priority: "Medium",
      });

      await loadMaintenance();

      alert(
        "Maintenance request created successfully."
      );

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Error creating maintenance request."
      );

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // STATUS BADGE
  // ============================================================

  const statusBadge = (status) => {

    const value =
      String(status || "").toLowerCase();

    if (value === "pending") {

      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";

    }

    if (
      value === "technician assigned"
    ) {

      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";

    }

    if (value === "in progress") {

      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

    }

    if (value === "resolved") {

      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

    }

    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  };


  // ============================================================
  // PRIORITY BADGE
  // ============================================================

  const priorityBadge = (priority) => {

    const value =
      String(priority || "").toLowerCase();

    if (value === "high") {

      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";

    }

    if (value === "medium") {

      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";

    }

    if (value === "low") {

      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

    }

    return "bg-slate-100 text-slate-700";

  };


  // ============================================================
  // PHOTO URL
  // ============================================================

  const getPhotoUrl = (photo) => {
  if (!photo) return null;

  // Preview image
  if (photo.startsWith("blob:")) {
    return photo;
  }

  // Already complete URL
  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://")
  ) {
    return photo;
  }

  // Backend server
  const backendUrl = "http://localhost:5000";

  // Backend returns /uploads/assets/filename.jpg
  if (photo.startsWith("/")) {
    return `${backendUrl}${photo}`;
  }

  return `${backendUrl}/uploads/${photo}`;
};

  // ============================================================
  // SELECT PHOTO
  // ============================================================

  const handlePhotoSelect = (
    maintenanceId,
    file
  ) => {

    if (!file) {
      return;
    }

    setSelectedPhoto((prev) => ({
      ...prev,
      [maintenanceId]: file,
    }));


    const previewUrl =
      URL.createObjectURL(file);


    setPhotoPreview((prev) => ({
      ...prev,
      [maintenanceId]: previewUrl,
    }));

  };


  // ============================================================
  // UPLOAD PHOTO
  // ============================================================

  const uploadPhoto = async (maintenanceId) => {
  const file = selectedPhoto[maintenanceId];

  if (!file) {
    alert("Please select a photo first.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("photo", file);

    const response = await api.post(
      `/maintenance/${maintenanceId}/upload-photo`,
      formData
    );

    console.log("Photo upload response:", response.data);

    await loadMaintenance();

    setSelectedPhoto((prev) => {
      const copy = { ...prev };
      delete copy[maintenanceId];
      return copy;
    });

    setPhotoPreview((prev) => {
      const copy = { ...prev };
      delete copy[maintenanceId];
      return copy;
    });

    alert("Photo uploaded successfully.");

  } catch (err) {
    console.error("Photo upload error:", err);

    alert(
      err.response?.data?.message ||
      "Error uploading photo."
    );
  }
};


  // ============================================================
  // CHANGE STATUS
  // ============================================================

  const updateStatus = async (
    maintenanceId,
    status
  ) => {

    try {

      await api.put(
        `/maintenance/${maintenanceId}/status`,
        {
          status,
        }
      );

      await loadMaintenance();

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Error updating status."
      );

    }

  };


  // ============================================================
  // RETURN
  // ============================================================

  return (

    <div
      className="
        min-h-screen
        min-w-0
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

      {/* SIDEBAR */}

      <Sidebar />


      {/* MAIN AREA */}

      <div className="xl:ml-72 min-h-screen min-w-0">

        <Navbar />


        {/* PAGE CONTENT */}

        <main
          className="
            pt-24
            px-4
            sm:px-6
            lg:px-8
            pb-10
            max-w-[1800px]
            mx-auto
            min-w-0
          "
        >


          {/* ==================================================
              HERO
          ================================================== */}

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
              "
            />


            <div
              className="
                relative
                z-10
                flex
                flex-col
                2xl:flex-row
                justify-between
                gap-8
              "
            >

              <div className="min-w-0">

                <p
                  className="
                    uppercase
                    tracking-[0.3em]
                    text-blue-600
                    dark:text-blue-400
                    font-semibold
                    text-sm
                  "
                >
                  Enterprise Asset Management
                </p>


                <h1
                  className="
                    text-4xl
                    md:text-5xl
                    font-bold
                    text-slate-900
                    dark:text-white
                    mt-3
                  "
                >
                  Maintenance Requests
                </h1>


                <p
                  className={`
                    ${muted}
                    mt-4
                    text-lg
                    max-w-2xl
                  `}
                >
                  Raise maintenance requests, track repair
                  progress, assign technicians and manage
                  asset service history.
                </p>

              </div>


              {/* STATISTICS */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-4
                  gap-4
                  w-full
                  2xl:max-w-5xl
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
                  "
                >

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total Requests
                    </p>

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-blue-100
                        dark:bg-blue-900/30
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <FaTools className="text-blue-600" />
                    </div>

                  </div>

                  <h2 className="text-3xl font-bold text-blue-600 mt-2">
                    {totalRequests}
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
                  "
                >

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pending
                    </p>

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-orange-100
                        dark:bg-orange-900/30
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <FaClock className="text-orange-600" />
                    </div>

                  </div>

                  <h2 className="text-3xl font-bold text-orange-600 mt-2">
                    {pendingRequests}
                  </h2>

                </div>


                {/* IN PROGRESS */}

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
                  "
                >

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      In Progress
                    </p>

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-purple-100
                        dark:bg-purple-900/30
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <FaWrench className="text-purple-600" />
                    </div>

                  </div>

                  <h2 className="text-3xl font-bold text-purple-600 mt-2">
                    {inProgressRequests}
                  </h2>

                </div>


                {/* RESOLVED */}

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
                  "
                >

                  <div className="flex items-center justify-between">

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Resolved
                    </p>

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-green-100
                        dark:bg-green-900/30
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <FaCheckCircle className="text-green-600" />
                    </div>

                  </div>

                  <h2 className="text-3xl font-bold text-green-600 mt-2">
                    {resolvedRequests}
                  </h2>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              RAISE MAINTENANCE REQUEST
          ================================================== */}

          <section
            className={`
              ${glass}
              p-6
              sm:p-8
              mb-8
            `}
          >

            <div
              className="
                flex
                flex-col
                lg:flex-row
                justify-between
                items-start
                gap-5
                mb-8
              "
            >

              <div>

                <h2
                  className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Raise Maintenance Request
                </h2>

                <p className={`${muted} mt-2`}>
                  Report an issue with an enterprise asset.
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
                <FaTools />
              </div>

            </div>


            {/* FORM */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-6
              "
            >

              {/* ASSET */}

              <div>

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

                  <option value="">
                    Select Asset
                  </option>

                  {assets.map((asset) => (

                    <option
                      key={asset.asset_id}
                      value={asset.asset_id}
                    >
                      {asset.asset_name}{" "}

                      {asset.asset_tag
                        ? `(${asset.asset_tag})`
                        : ""}
                    </option>

                  ))}

                </select>

              </div>


              {/* RAISED BY */}

              <div>

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Raised By
                </label>

                <select
                  name="raised_by"
                  value={form.raised_by}
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

                  <option value="">
                    Select User
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


              {/* PRIORITY */}

              <div>

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Priority
                </label>

                <select
                  name="priority"
                  value={form.priority}
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

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

              </div>


              {/* ISSUE */}

              <div className="md:col-span-2">

                <label
                  className="
                    block
                    mb-2
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Issue Description
                </label>

                <textarea
                  name="issue_description"
                  value={form.issue_description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the issue with the asset..."
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
                    resize-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>

            </div>


            {/* BUTTON */}

            <div className="mt-8">

              <button
                onClick={addMaintenanceRequest}
                disabled={loading}
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
                  disabled:opacity-50
                  disabled:hover:scale-100
                "
              >

                <span className="flex items-center gap-2">

                  <FaTools />

                  {loading
                    ? "Creating..."
                    : "Create Maintenance Request"}

                </span>

              </button>

            </div>

          </section>


          {/* ==================================================
              MAINTENANCE HISTORY
          ================================================== */}

          <section
            className={`
              ${glass}
              overflow-hidden
            `}
          >

            {/* HEADER */}

            <div
              className="
                px-6
                sm:px-8
                py-6
                border-b
                border-slate-200
                dark:border-slate-700
              "
            >

              <div
                className="
                  flex
                  flex-col
                  lg:flex-row
                  justify-between
                  items-start
                  lg:items-center
                  gap-5
                "
              >

                <div>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Maintenance History
                  </h2>

                  <p className={`${muted} mt-2`}>
                    View and manage maintenance requests.
                  </p>

                </div>


                {/* FILTERS */}

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                    w-full
                    lg:w-auto
                  "
                >

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                    className="
                      rounded-2xl
                      border
                      border-slate-300
                      dark:border-slate-700
                      bg-white
                      dark:bg-slate-800
                      text-slate-900
                      dark:text-white
                      px-4
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >

                    <option value="">
                      All Statuses
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Technician Assigned">
                      Technician Assigned
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                  </select>


                  <select
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(
                        e.target.value
                      )
                    }
                    className="
                      rounded-2xl
                      border
                      border-slate-300
                      dark:border-slate-700
                      bg-white
                      dark:bg-slate-800
                      text-slate-900
                      dark:text-white
                      px-4
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  >

                    <option value="">
                      All Priorities
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* TABLE */}

            <div className="overflow-x-auto">

              <table
                className="
                  min-w-[1450px]
                  w-full
                "
              >

                <thead
                  className="
                    bg-slate-100
                    dark:bg-slate-800
                  "
                >

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Asset
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Raised By
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Issue
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Photo
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Priority
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                      Technician
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredMaintenance.length === 0 ? (

                    <tr>

                      <td
                        colSpan="8"
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center justify-center">

                          <div
                            className="
                              w-20
                              h-20
                              rounded-full
                              bg-slate-100
                              dark:bg-slate-800
                              flex
                              items-center
                              justify-center
                              text-3xl
                              text-slate-400
                            "
                          >
                            <FaTools />
                          </div>

                          <h3
                            className="
                              text-xl
                              font-bold
                              text-slate-900
                              dark:text-white
                              mt-4
                            "
                          >
                            No Maintenance Requests
                          </h3>

                          <p
                            className={`${muted} mt-2`}
                          >
                            Create a maintenance request
                            to see records here.
                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : (

                    filteredMaintenance.map((item) => {

                      const id =
                        item.maintenance_id ||
                        item.id;


                      const existingPhoto =
                        item.photo_url ||
                        item.photo ||
                        item.image_url;


                      const preview =
                        photoPreview[id];


                      const imageUrl =
                        preview ||
                        getPhotoUrl(
                          existingPhoto
                        );


                      return (

                        <tr
                          key={id}
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
                              px-6
                              py-5
                              text-slate-900
                              dark:text-white
                              font-medium
                            "
                          >
                            {id}
                          </td>


                          {/* ASSET */}

                          <td className="px-6 py-5">

                            <div className="flex flex-col">

                              <span
                                className="
                                  font-semibold
                                  text-slate-900
                                  dark:text-white
                                "
                              >
                                {item.asset_name ||
                                  "Unknown Asset"}
                              </span>

                              <span
                                className="
                                  text-sm
                                  text-slate-500
                                  dark:text-slate-400
                                "
                              >
                                {item.asset_tag ||
                                  "No asset tag"}
                              </span>

                            </div>

                          </td>


                          {/* RAISED BY */}

                          <td className="px-6 py-5">

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-slate-900
                                dark:text-white
                              "
                            >

                              <FaUser className="text-blue-500" />

                              {item.full_name ||
                                item.raised_by_name ||
                                "Unknown"}

                            </div>

                          </td>


                          {/* ISSUE */}

                          <td
                            className="
                              px-6
                              py-5
                              max-w-[280px]
                            "
                          >

                            <p
                              className="
                                text-slate-700
                                dark:text-slate-300
                                break-words
                              "
                            >
                              {item.issue_description ||
                                item.issue ||
                                "No description"}
                            </p>

                          </td>


                          {/* ==================================================
                              PHOTO
                          ================================================== */}

                          <td className="px-6 py-5">

                            <div
                              className="
                                flex
                                flex-col
                                items-start
                                gap-3
                              "
                            >

                              {/* IMAGE */}

                              {imageUrl ? (

                                <img
                                  src={imageUrl}
                                  alt="Maintenance"
                                  className="
                                    w-28
                                    h-20
                                    object-cover
                                    rounded-xl
                                    border
                                    border-slate-200
                                    dark:border-slate-700
                                    shadow-sm
                                  "
                                  onError={(e) => {

                                    console.log(
                                      "Image failed:",
                                      imageUrl
                                    );

                                    e.currentTarget.style.display =
                                      "none";

                                  }}
                                />

                              ) : (

                                <div
                                  className="
                                    w-28
                                    h-20
                                    rounded-xl
                                    bg-slate-100
                                    dark:bg-slate-800
                                    border
                                    border-slate-200
                                    dark:border-slate-700
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    text-slate-400
                                  "
                                >

                                  <FaCamera className="text-xl mb-1" />

                                  <span className="text-xs">
                                    No photo
                                  </span>

                                </div>

                              )}


                              {/* FILE INPUT */}

                              <label
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-3
                                  py-2
                                  rounded-xl
                                  bg-blue-50
                                  dark:bg-blue-900/30
                                  text-blue-600
                                  dark:text-blue-300
                                  font-semibold
                                  text-sm
                                  cursor-pointer
                                  hover:bg-blue-100
                                  dark:hover:bg-blue-900/50
                                  transition
                                "
                              >

                                <FaCamera />

                                {selectedPhoto[id]
                                  ? "Change"
                                  : existingPhoto
                                  ? "Change"
                                  : "Upload"}

                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                  className="hidden"
                                  onChange={(e) => {

                                    handlePhotoSelect(
                                      id,
                                      e.target.files?.[0]
                                    );

                                  }}
                                />

                              </label>


                              {/* UPLOAD BUTTON */}

                              {selectedPhoto[id] && (

                                <button
                                  onClick={() =>
                                    uploadPhoto(id)
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-3
                                    py-2
                                    rounded-xl
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    font-semibold
                                    text-sm
                                    transition
                                  "
                                >

                                  <FaUpload />

                                  Upload Photo

                                </button>

                              )}

                            </div>

                          </td>


                          {/* PRIORITY */}

                          <td className="px-6 py-5">

                            <span
                              className={`
                                inline-flex
                                items-center
                                px-4
                                py-2
                                rounded-full
                                text-xs
                                font-bold
                                ${priorityBadge(
                                  item.priority
                                )}
                              `}
                            >

                              {item.priority ||
                                "Medium"}

                            </span>

                          </td>


                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <select
                              value={
                                item.status ||
                                "Pending"
                              }
                              onChange={(e) =>
                                updateStatus(
                                  id,
                                  e.target.value
                                )
                              }
                              className={`
                                rounded-xl
                                border-none
                                px-4
                                py-2.5
                                font-semibold
                                outline-none
                                cursor-pointer
                                ${statusBadge(
                                  item.status
                                )}
                              `}
                            >

                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Technician Assigned">
                                Technician Assigned
                              </option>

                              <option value="In Progress">
                                In Progress
                              </option>

                              <option value="Resolved">
                                Resolved
                              </option>

                            </select>

                          </td>


                          {/* TECHNICIAN */}

                          <td className="px-6 py-5">

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-slate-700
                                dark:text-slate-300
                              "
                            >

                              <FaWrench className="text-slate-400" />

                              <span>

                                {item.technician_name ||
                                  item.technician ||
                                  "Not Assigned"}

                              </span>

                            </div>

                          </td>

                        </tr>

                      );

                    })

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>

    </div>

  );

}


export default Maintenance;