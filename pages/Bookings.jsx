import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";

import enUS from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";


// ============================================================
// CALENDAR LOCALIZER
// ============================================================

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () =>
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
  getDay,
  locales,
});


// ============================================================
// BOOKINGS COMPONENT
// ============================================================

function Bookings() {
  const location = useLocation();

  // ==========================================================
  // STATE
  // ==========================================================

  const [statusFilter, setStatusFilter] = useState("");

  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);

  const [viewMode, setViewMode] = useState("table");

  const [form, setForm] = useState({
    asset_id: "",
    user_id: "",
    start_time: "",
    end_time: "",
  });


  // ==========================================================
  // CURRENT USER
  // ==========================================================

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );


  // ==========================================================
  // STYLING
  // ==========================================================

  const glass =
    "rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";


  // ==========================================================
  // LOAD BOOKINGS
  // ==========================================================

  const loadBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };


  // ==========================================================
  // LOAD ASSETS
  // ==========================================================

  const loadAssets = async () => {
    try {
      const res = await api.get("/assets");
      setAssets(res.data);
    } catch (err) {
      console.log(err);
    }
  };


  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadBookings();
    loadAssets();
    loadUsers();
  }, []);


  // ==========================================================
  // STATUS FILTER FROM DASHBOARD / OTHER PAGE
  // ==========================================================

  useEffect(() => {
    if (location.state?.status) {
      setStatusFilter(location.state.status);
    }
  }, [location]);


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalBookings = useMemo(
    () => bookings.length,
    [bookings]
  );

  const upcomingBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.booking_status === "Upcoming"
      ).length,
    [bookings]
  );

  const ongoingBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.booking_status === "Ongoing"
      ).length,
    [bookings]
  );

  const completedBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.booking_status === "Completed"
      ).length,
    [bookings]
  );

  const cancelledBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.booking_status === "Cancelled"
      ).length,
    [bookings]
  );


  // ==========================================================
  // BOOKABLE ASSETS
  // ==========================================================

  const bookableAssets = assets.filter(
    (a) => a.is_bookable
  );


  // ==========================================================
  // ADD BOOKING
  // ==========================================================

  const addBooking = async () => {
    if (
      !form.asset_id ||
      !form.user_id ||
      !form.start_time ||
      !form.end_time
    ) {
      alert("All fields are required.");
      return;
    }

    if (
      new Date(form.end_time) <=
      new Date(form.start_time)
    ) {
      alert("End time must be after start time.");
      return;
    }

    try {
      await api.post("/bookings", form);

      setForm({
        asset_id: "",
        user_id: "",
        start_time: "",
        end_time: "",
      });

      await loadBookings();

      alert("Resource booked successfully.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error creating booking"
      );
    }
  };


  // ==========================================================
  // CANCEL BOOKING
  // ==========================================================

  const deleteBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) {
      return;
    }

    try {
      await api.delete(`/bookings/${id}`);

      await loadBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error cancelling booking"
      );
    }
  };


  // ==========================================================
  // RESCHEDULE BOOKING
  // ==========================================================

  const rescheduleBooking = async (booking) => {
    const newStart = prompt(
      "New start time (YYYY-MM-DDTHH:MM):",
      booking.start_time.slice(0, 16)
    );

    if (!newStart) {
      return;
    }

    const newEnd = prompt(
      "New end time (YYYY-MM-DDTHH:MM):",
      booking.end_time.slice(0, 16)
    );

    if (!newEnd) {
      return;
    }

    if (
      new Date(newEnd) <=
      new Date(newStart)
    ) {
      alert("End time must be after start time.");
      return;
    }

    try {
      await api.put(
        `/bookings/${booking.booking_id}/reschedule`,
        {
          start_time: newStart,
          end_time: newEnd,
        }
      );

      await loadBookings();

      alert("Booking rescheduled successfully.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error rescheduling booking"
      );
    }
  };


  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  const statusBadge = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

      case "Ongoing":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";

      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };


  // ==========================================================
  // FILTERED BOOKINGS
  // ==========================================================

  const filteredBookings = useMemo(() => {
    if (statusFilter === "") {
      return bookings;
    }

    return bookings.filter(
      (b) => b.booking_status === statusFilter
    );
  }, [bookings, statusFilter]);


  // ==========================================================
  // CALENDAR EVENTS
  // ==========================================================

  const calendarEvents = filteredBookings
    .filter(
      (b) => b.booking_status !== "Cancelled"
    )
    .map((b) => ({
      id: b.booking_id,

      title: `${b.asset_name} — ${b.full_name}`,

      start: new Date(b.start_time),

      end: new Date(b.end_time),

      resource: b,
    }));


  // ==========================================================
  // CALENDAR EVENT STYLE
  // ==========================================================

  const eventStyleGetter = (event) => {
    let backgroundColor = "#2563eb";

    if (
      event.resource?.booking_status ===
      "Ongoing"
    ) {
      backgroundColor = "#f97316";
    }

    if (
      event.resource?.booking_status ===
      "Completed"
    ) {
      backgroundColor = "#16a34a";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        color: "white",
        border: "none",
        padding: "4px 8px",
        fontWeight: "600",
      },
    };
  };


  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-100
        via-blue-50
        to-indigo-100
        dark:from-slate-950
        dark:via-slate-900
        dark:to-slate-950
      "
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />


      {/* ======================================================
          MAIN AREA

          Sidebar width = w-72 = 288px.
          Therefore use xl:ml-72.
      ====================================================== */}

      <div className="xl:ml-72 min-h-screen min-w-0">

        <Navbar />


        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

        <main
          className="
            pt-24
            px-4
            sm:px-6
            lg:px-8
            pb-10
            max-w-[1800px]
            mx-auto
          "
        >


          {/* ==================================================
              HERO SECTION
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

            {/* Background decoration */}

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

              {/* HERO TEXT */}

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
                  Resource Bookings
                </h1>


                <p
                  className={`
                    ${muted}
                    mt-4
                    text-lg
                    max-w-2xl
                  `}
                >
                  Schedule shared resources, manage
                  bookings, monitor reservations and
                  control resource availability from
                  one modern dashboard.
                </p>

              </div>


              {/* STATISTICS */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-3
                  2xl:grid-cols-5
                  gap-4
                  w-full
                  2xl:max-w-4xl
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

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Total
                    </p>

                    <FaCalendarCheck className="text-blue-600" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-blue-600
                      mt-2
                    "
                  >
                    {totalBookings}
                  </h2>

                </div>


                {/* UPCOMING */}

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

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Upcoming
                    </p>

                    <FaHourglassHalf className="text-indigo-500" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-indigo-600
                      mt-2
                    "
                  >
                    {upcomingBookings}
                  </h2>

                </div>


                {/* ONGOING */}

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

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Ongoing
                    </p>

                    <FaClock className="text-orange-500" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-orange-600
                      mt-2
                    "
                  >
                    {ongoingBookings}
                  </h2>

                </div>


                {/* COMPLETED */}

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

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Completed
                    </p>

                    <FaCheckCircle className="text-green-500" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-green-600
                      mt-2
                    "
                  >
                    {completedBookings}
                  </h2>

                </div>


                {/* CANCELLED */}

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

                    <p
                      className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Cancelled
                    </p>

                    <FaTimesCircle className="text-red-500" />

                  </div>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-red-600
                      mt-2
                    "
                  >
                    {cancelledBookings}
                  </h2>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              BOOKING FORM
          ================================================== */}

          <section
            className={`
              ${glass}
              p-6
              sm:p-8
              mb-8
            `}
          >

            {/* FORM HEADER */}

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
                  Create Resource Booking
                </h2>

                <p
                  className={`
                    ${muted}
                    mt-2
                  `}
                >
                  Reserve a shared resource for an employee
                  for a specific period.
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
                <FaCalendarAlt />
              </div>

            </div>


            {/* FORM FIELDS */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-6
              "
            >

              {/* RESOURCE */}

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
                  Select Resource / Asset
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
                    Select Resource/Asset
                  </option>

                  {bookableAssets.length === 0 && (
                    <option disabled>
                      No bookable resources — mark an
                      asset as "Shared/Bookable" in Assets
                    </option>
                  )}

                  {bookableAssets.map((asset) => (
                    <option
                      key={asset.asset_id}
                      value={asset.asset_id}
                    >
                      {asset.asset_name} ({asset.asset_tag})
                    </option>
                  ))}

                </select>

              </div>


              {/* USER */}

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
                  Book For
                </label>

                <select
                  name="user_id"
                  value={form.user_id}
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


              {/* START */}

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
                  Start Time
                </label>

                <input
                  type="datetime-local"
                  name="start_time"
                  value={form.start_time}
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


              {/* END */}

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
                  End Time
                </label>

                <input
                  type="datetime-local"
                  name="end_time"
                  value={form.end_time}
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


            {/* BUTTON */}

            <div className="mt-8">

              <button
                onClick={addBooking}
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
                <span className="flex items-center gap-2">
                  <FaCalendarCheck />
                  Book Resource
                </span>
              </button>

            </div>

          </section>


          {/* ==================================================
              BOOKING HISTORY HEADER
          ================================================== */}

          <section
            className={`
              ${glass}
              overflow-hidden
            `}
          >

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
                    Booking History
                  </h2>

                  <p
                    className={`
                      ${muted}
                      mt-2
                    `}
                  >
                    View, monitor and manage resource
                    reservations.
                  </p>

                </div>


                {/* CONTROLS */}

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

                  {/* TABLE / CALENDAR */}

                  <div
                    className="
                      flex
                      rounded-2xl
                      bg-slate-100
                      dark:bg-slate-800
                      p-1
                    "
                  >

                    <button
                      onClick={() =>
                        setViewMode("table")
                      }
                      className={`
                        px-5
                        py-2.5
                        rounded-xl
                        font-semibold
                        transition
                        ${
                          viewMode === "table"
                            ? "bg-blue-600 text-white shadow"
                            : "text-slate-600 dark:text-slate-300"
                        }
                      `}
                    >
                      Table View
                    </button>


                    <button
                      onClick={() =>
                        setViewMode("calendar")
                      }
                      className={`
                        px-5
                        py-2.5
                        rounded-xl
                        font-semibold
                        transition
                        ${
                          viewMode === "calendar"
                            ? "bg-blue-600 text-white shadow"
                            : "text-slate-600 dark:text-slate-300"
                        }
                      `}
                    >
                      Calendar View
                    </button>

                  </div>


                  {/* STATUS FILTER */}

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
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
                      All Bookings
                    </option>

                    <option value="Upcoming">
                      Upcoming
                    </option>

                    <option value="Ongoing">
                      Ongoing
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* ==================================================
                CALENDAR VIEW
            ================================================== */}

            {viewMode === "calendar" ? (

              <div
                className="
                  p-4
                  sm:p-6
                "
              >

                <div
                  className="
                    h-[650px]
                    bg-white
                    dark:bg-slate-900
                    rounded-2xl
                    p-3
                    overflow-hidden
                  "
                >

                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{
                      height: "100%",
                    }}
                    eventPropGetter={
                      eventStyleGetter
                    }
                    onSelectEvent={(event) => {
                      const booking =
                        event.resource;

                      alert(
                        `${booking.asset_name}\n` +
                        `Booked by: ${booking.full_name}\n` +
                        `${new Date(
                          booking.start_time
                        ).toLocaleString()} — ` +
                        `${new Date(
                          booking.end_time
                        ).toLocaleString()}\n` +
                        `Status: ${booking.booking_status}`
                      );
                    }}
                  />

                </div>

              </div>

            ) : (

              /* ==================================================
                  TABLE VIEW
              ================================================== */

              <div className="overflow-x-auto">

                <table
                  className="
                    min-w-[1100px]
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

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        ID
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        Resource
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        Booked By
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        Start
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        End
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        Status
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-center
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredBookings.length === 0 ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="
                            px-6
                            py-16
                            text-center
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              items-center
                              justify-center
                            "
                          >

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
                              <FaCalendarAlt />
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
                              No Bookings Found
                            </h3>


                            <p
                              className={`
                                ${muted}
                                mt-2
                              `}
                            >
                              Create a resource booking
                              to see records here.
                            </p>

                          </div>

                        </td>

                      </tr>

                    ) : (

                      filteredBookings.map(
                        (booking) => (

                          <tr
                            key={
                              booking.booking_id
                            }
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
                              {booking.booking_id}
                            </td>


                            {/* RESOURCE */}

                            <td className="px-6 py-5">

                              <div
                                className="
                                  flex
                                  flex-col
                                "
                              >

                                <span
                                  className="
                                    font-semibold
                                    text-slate-900
                                    dark:text-white
                                  "
                                >
                                  {booking.asset_name}
                                </span>

                                <span
                                  className="
                                    text-sm
                                    text-slate-500
                                    dark:text-slate-400
                                  "
                                >
                                  {booking.asset_tag ||
                                    "Shared Resource"}
                                </span>

                              </div>

                            </td>


                            {/* USER */}

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

                                <FaUsers
                                  className="
                                    text-blue-500
                                  "
                                />

                                {booking.full_name}

                              </div>

                            </td>


                            {/* START */}

                            <td
                              className="
                                px-6
                                py-5
                                text-slate-700
                                dark:text-slate-300
                              "
                            >
                              {new Date(
                                booking.start_time
                              ).toLocaleString()}
                            </td>


                            {/* END */}

                            <td
                              className="
                                px-6
                                py-5
                                text-slate-700
                                dark:text-slate-300
                              "
                            >
                              {new Date(
                                booking.end_time
                              ).toLocaleString()}
                            </td>


                            {/* STATUS */}

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
                                  ${statusBadge(
                                    booking.booking_status
                                  )}
                                `}
                              >
                                {booking.booking_status}
                              </span>

                            </td>


                            {/* ACTIONS */}

                            <td className="px-6 py-5">

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  justify-center
                                  gap-2
                                "
                              >

                                {booking.booking_status !==
                                  "Cancelled" && (

                                  <>

                                    <button
                                      onClick={() =>
                                        deleteBooking(
                                          booking.booking_id
                                        )
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
                                      Cancel
                                    </button>


                                    <button
                                      onClick={() =>
                                        rescheduleBooking(
                                          booking
                                        )
                                      }
                                      className="
                                        px-4
                                        py-2
                                        rounded-xl
                                        bg-slate-200
                                        hover:bg-slate-300
                                        dark:bg-slate-700
                                        dark:hover:bg-slate-600
                                        text-slate-800
                                        dark:text-white
                                        font-semibold
                                        transition
                                      "
                                    >
                                      Reschedule
                                    </button>

                                  </>

                                )}

                                {booking.booking_status ===
                                  "Cancelled" && (

                                  <span
                                    className="
                                      text-sm
                                      text-slate-400
                                    "
                                  >
                                    No actions
                                  </span>

                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </main>

      </div>

    </div>
  );
}

export default Bookings;