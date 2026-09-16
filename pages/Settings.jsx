import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

import {
  FaCog,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaMoneyBillWave,
  FaTag,
  FaHashtag,
  FaChartLine,
  FaTools,
  FaSave,
  FaInfoCircle,
} from "react-icons/fa";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    company_name: "AssetFlow ERP",
    admin_email: "admin@assetflow.com",
    company_phone: "9876543210",
    company_city: "Visakhapatnam",

    timezone: "Asia/Kolkata",
    currency: "INR",

    asset_prefix: "AF",
    asset_start_number: 1,

    report_frequency: "Quarterly",
    maintenance_reminder_days: 30,
  });

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/settings");

      if (res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (err) {
      console.error(err);

      /*
       * If settings are not available yet,
       * keep the default values.
       */
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  const saveSettings = async () => {
    try {
      setSaving(true);

      await api.put("/settings", {
        company_name: settings.company_name,
        admin_email: settings.admin_email,
        company_phone: settings.company_phone,
        company_city: settings.company_city,

        timezone: settings.timezone,
        currency: settings.currency,

        asset_prefix: settings.asset_prefix,
        asset_start_number: Number(settings.asset_start_number),

        report_frequency: settings.report_frequency,
        maintenance_reminder_days: Number(
          settings.maintenance_reminder_days
        ),
      });

      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // COMMON STYLES
  // =========================================================

  const glassCard = `
    bg-white/70
    dark:bg-slate-900/70
    backdrop-blur-xl
    border
    border-white/70
    dark:border-slate-700/70
    shadow-[0_20px_60px_rgba(15,23,42,0.08)]
  `;

  const inputStyle = `
    w-full
    rounded-xl
    border
    border-slate-200
    dark:border-slate-700
    bg-white/70
    dark:bg-slate-800/70
    backdrop-blur
    px-4
    py-3
    text-sm
    text-slate-800
    dark:text-white
    outline-none
    transition
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-500/20
  `;

  const labelStyle = `
    block
    text-sm
    font-semibold
    text-slate-700
    dark:text-slate-300
    mb-2
  `;

  const muted = "text-slate-500 dark:text-slate-400";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
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
        <Sidebar />

        <div className="md:ml-[320px] min-h-screen">
          <Navbar />

          <main className="pt-28 px-6 lg:px-10">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    border-4
                    border-blue-200
                    border-t-blue-600
                    animate-spin
                    mx-auto
                  "
                />

                <p
                  className="
                    mt-4
                    text-sm
                    font-medium
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Loading settings...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

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
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="md:ml-[320px] min-h-screen">
        {/* NAVBAR */}
        <Navbar />

        {/* PAGE */}
        <main
          className="
            pt-24
            px-5
            sm:px-7
            lg:px-10
            pb-10
            w-full
            max-w-[2000px]
            mx-auto
          "
        >
          {/* ================================================= */}
          {/* PAGE HEADER */}
          {/* ================================================= */}

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
              <p
                className="
                  text-xs
                  sm:text-sm
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-blue-600
                  dark:text-blue-400
                "
              >
                System Configuration
              </p>

              <h1
                className="
                  mt-2
                  text-3xl
                  sm:text-4xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                System Settings
              </h1>

              <p
                className={`
                  ${muted}
                  mt-2
                  text-sm
                  sm:text-base
                  max-w-2xl
                `}
              >
                Configure your AssetFlow organization,
                regional preferences, asset numbering and
                operational settings.
              </p>
            </div>

            {/* SETTINGS ICON */}
            <div
              className="
                hidden
                lg:flex
                w-16
                h-16
                rounded-2xl
                bg-gradient-to-br
                from-blue-600
                to-purple-600
                items-center
                justify-center
                text-white
                shadow-xl
                shadow-blue-500/20
              "
            >
              <FaCog className="text-2xl" />
            </div>
          </div>

          {/* ================================================= */}
          {/* MAIN SETTINGS CARD */}
          {/* ================================================= */}

          <section
            className={`
              ${glassCard}
              rounded-3xl
              overflow-hidden
            `}
          >
            {/* ================================================= */}
            {/* GRADIENT HEADER */}
            {/* ================================================= */}

            <div
              className="
                relative
                overflow-hidden
                px-6
                sm:px-8
                py-7
                bg-gradient-to-r
                from-blue-600
                via-indigo-600
                to-purple-600
              "
            >
              {/* Decorative circle */}
              <div
                className="
                  absolute
                  -top-20
                  right-10
                  w-56
                  h-56
                  rounded-full
                  bg-white/10
                  blur-2xl
                "
              />

              <div
                className="
                  absolute
                  -bottom-24
                  left-1/3
                  w-64
                  h-64
                  rounded-full
                  bg-cyan-300/10
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-white/15
                    backdrop-blur-md
                    border
                    border-white/20
                    flex
                    items-center
                    justify-center
                    text-white
                  "
                >
                  <FaCog />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-white
                    "
                  >
                    AssetFlow Configuration
                  </h2>

                  <p
                    className="
                      text-sm
                      text-blue-100
                      mt-1
                    "
                  >
                    Manage your organization's system preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* SETTINGS CONTENT */}
            {/* ================================================= */}

            <div className="p-5 sm:p-7 lg:p-8">
              {/* ================================================= */}
              {/* ORGANIZATION */}
              {/* ================================================= */}

              <div className="mb-8">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-5
                  "
                >
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-blue-100
                      dark:bg-blue-900/30
                      flex
                      items-center
                      justify-center
                      text-blue-600
                    "
                  >
                    <FaBuilding />
                  </div>

                  <div>
                    <h3
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Organization
                    </h3>

                    <p
                      className={`
                        text-xs
                        ${muted}
                        mt-0.5
                      `}
                    >
                      Basic company information
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
                  {/* COMPANY NAME */}
                  <div>
                    <label className={labelStyle}>
                      Company Name
                    </label>

                    <div className="relative">
                      <FaBuilding
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-blue-500
                        "
                      />

                      <input
                        type="text"
                        name="company_name"
                        value={settings.company_name}
                        onChange={handleChange}
                        className={`${inputStyle} pl-11`}
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  {/* ADMIN EMAIL */}
                  <div>
                    <label className={labelStyle}>
                      Administrator Email
                    </label>

                    <div className="relative">
                      <FaEnvelope
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-emerald-500
                        "
                      />

                      <input
                        type="email"
                        name="admin_email"
                        value={settings.admin_email}
                        onChange={handleChange}
                        className={`${inputStyle} pl-11`}
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className={labelStyle}>
                      Contact Number
                    </label>

                    <div className="relative">
                      <FaPhone
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-purple-500
                        "
                      />

                      <input
                        type="text"
                        name="company_phone"
                        value={settings.company_phone}
                        onChange={handleChange}
                        className={`${inputStyle} pl-11`}
                        placeholder="Contact number"
                      />
                    </div>
                  </div>

                  {/* CITY */}
                  <div>
                    <label className={labelStyle}>
                      Location
                    </label>

                    <div className="relative">
                      <FaMapMarkerAlt
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-orange-500
                        "
                      />

                      <input
                        type="text"
                        name="company_city"
                        value={settings.company_city}
                        onChange={handleChange}
                        className={`${inputStyle} pl-11`}
                        placeholder="City"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <div
                className="
                  border-t
                  border-slate-200/80
                  dark:border-slate-700/70
                  mb-8
                "
              />

              {/* ================================================= */}
              {/* REGIONAL SETTINGS */}
              {/* ================================================= */}

              <div className="mb-8">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-5
                  "
                >
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-purple-100
                      dark:bg-purple-900/30
                      flex
                      items-center
                      justify-center
                      text-purple-600
                    "
                  >
                    <FaGlobe />
                  </div>

                  <div>
                    <h3
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Regional Preferences
                    </h3>

                    <p
                      className={`
                        text-xs
                        ${muted}
                        mt-0.5
                      `}
                    >
                      Timezone and currency preferences
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
                  {/* TIMEZONE */}
                  <div>
                    <label className={labelStyle}>
                      Timezone
                    </label>

                    <select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleChange}
                      className={inputStyle}
                    >
                      <option value="Asia/Kolkata">
                        Asia/Kolkata
                      </option>

                      <option value="Asia/Dubai">
                        Asia/Dubai
                      </option>

                      <option value="Asia/Singapore">
                        Asia/Singapore
                      </option>

                      <option value="Europe/London">
                        Europe/London
                      </option>

                      <option value="America/New_York">
                        America/New_York
                      </option>

                      <option value="America/Los_Angeles">
                        America/Los_Angeles
                      </option>
                    </select>
                  </div>

                  {/* CURRENCY */}
                  <div>
                    <label className={labelStyle}>
                      Currency
                    </label>

                    <select
                      name="currency"
                      value={settings.currency}
                      onChange={handleChange}
                      className={inputStyle}
                    >
                      <option value="INR">
                        INR — Indian Rupee
                      </option>

                      <option value="USD">
                        USD — US Dollar
                      </option>

                      <option value="EUR">
                        EUR — Euro
                      </option>

                      <option value="GBP">
                        GBP — British Pound
                      </option>

                      <option value="AED">
                        AED — UAE Dirham
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <div
                className="
                  border-t
                  border-slate-200/80
                  dark:border-slate-700/70
                  mb-8
                "
              />

              {/* ================================================= */}
              {/* ASSET CONFIGURATION */}
              {/* ================================================= */}

              <div className="mb-8">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-5
                  "
                >
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-orange-100
                      dark:bg-orange-900/30
                      flex
                      items-center
                      justify-center
                      text-orange-600
                    "
                  >
                    <FaTag />
                  </div>

                  <div>
                    <h3
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Asset Configuration
                    </h3>

                    <p
                      className={`
                        text-xs
                        ${muted}
                        mt-0.5
                      `}
                    >
                      Configure automatic asset identification
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
                  {/* PREFIX */}
                  <div>
                    <label className={labelStyle}>
                      Asset Tag Prefix
                    </label>

                    <div className="relative">
                      <FaTag
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-orange-500
                        "
                      />

                      <input
                        type="text"
                        name="asset_prefix"
                        value={settings.asset_prefix}
                        onChange={handleChange}
                        className={`${inputStyle} pl-11`}
                        placeholder="AF"
                        maxLength={10}
                      />
                    </div>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-2
                      "
                    >
                      Example: AF-0001
                    </p>
                  </div>

                  {/* START NUMBER */}
                  <div>
                    <label className={labelStyle}>
                      Starting Number
                    </label>

                    <div className="relative">
                      <FaHashtag
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-blue-500
                        "
                      />

                      <input
                        type="number"
                        name="asset_start_number"
                        value={settings.asset_start_number}
                        onChange={handleChange}
                        className={`${inputStyle} pl-11`}
                        min="1"
                      />
                    </div>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-2
                      "
                    >
                      Used when generating new asset tags.
                    </p>
                  </div>
                </div>

                {/* PREVIEW */}
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-blue-100
                    dark:border-blue-900/40
                    bg-blue-50/60
                    dark:bg-blue-900/20
                    backdrop-blur
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <FaInfoCircle className="text-blue-500" />

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          text-blue-600
                          dark:text-blue-400
                          uppercase
                          tracking-wide
                        "
                      >
                        Asset Tag Preview
                      </p>

                      <p
                        className="
                          mt-1
                          text-xl
                          font-extrabold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        {settings.asset_prefix || "AF"}-
                        {String(
                          settings.asset_start_number || 1
                        ).padStart(4, "0")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <div
                className="
                  border-t
                  border-slate-200/80
                  dark:border-slate-700/70
                  mb-8
                "
              />

              {/* ================================================= */}
              {/* REPORTING & MAINTENANCE */}
              {/* ================================================= */}

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-5
                  "
                >
                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-emerald-100
                      dark:bg-emerald-900/30
                      flex
                      items-center
                      justify-center
                      text-emerald-600
                    "
                  >
                    <FaChartLine />
                  </div>

                  <div>
                    <h3
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Reporting & Maintenance
                    </h3>

                    <p
                      className={`
                        text-xs
                        ${muted}
                        mt-0.5
                      `}
                    >
                      Configure reports and maintenance reminders
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
                  {/* REPORT FREQUENCY */}
                  <div>
                    <label className={labelStyle}>
                      Report Frequency
                    </label>

                    <select
                      name="report_frequency"
                      value={settings.report_frequency}
                      onChange={handleChange}
                      className={inputStyle}
                    >
                      <option value="Daily">
                        Daily
                      </option>

                      <option value="Weekly">
                        Weekly
                      </option>

                      <option value="Monthly">
                        Monthly
                      </option>

                      <option value="Quarterly">
                        Quarterly
                      </option>

                      <option value="Yearly">
                        Yearly
                      </option>
                    </select>
                  </div>

                  {/* MAINTENANCE */}
                  <div>
                    <label className={labelStyle}>
                      Maintenance Reminder
                    </label>

                    <div className="relative">
                      <FaTools
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-orange-500
                        "
                      />

                      <input
                        type="number"
                        name="maintenance_reminder_days"
                        value={
                          settings.maintenance_reminder_days
                        }
                        onChange={handleChange}
                        className={`${inputStyle} pl-11`}
                        min="1"
                      />
                    </div>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-2
                      "
                    >
                      Days before maintenance due date.
                    </p>
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* SAVE AREA */}
              {/* ================================================= */}

              <div
                className="
                  mt-9
                  pt-7
                  border-t
                  border-slate-200/80
                  dark:border-slate-700/70
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
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
                      text-blue-600
                    "
                  >
                    <FaInfoCircle />
                  </div>

                  <div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-800
                        dark:text-white
                      "
                    >
                      Changes apply to AssetFlow
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-0.5
                      "
                    >
                      Save your settings to apply the changes.
                    </p>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-6
                    py-3
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    hover:from-blue-700
                    hover:to-indigo-700
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-blue-500/20
                    hover:shadow-xl
                    transition-all
                  "
                >
                  {saving ? (
                    <>
                      <span
                        className="
                          w-4
                          h-4
                          rounded-full
                          border-2
                          border-white/40
                          border-t-white
                          animate-spin
                        "
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />

                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Settings;