import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";

import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaTag,
  FaBuilding,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaArrowLeft,
  FaPrint,
  FaChartLine,
  FaImage,
  FaLayerGroup,
  FaHistory,
} from "react-icons/fa";

function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [timeline, setTimeline] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD ASSET DETAILS
  ========================================================= */

  const loadAsset = useCallback(async () => {
    try {
      const res = await api.get(`/assets/${id}/details`);

      console.log("Asset Details API response:", res.data);

      setAsset(res.data);
    } catch (err) {
      console.error("Asset Details Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load asset details."
      );
    }
  }, [id]);

  /* =========================================================
     LOAD ASSET TIMELINE
  ========================================================= */

  const loadTimeline = useCallback(async () => {
    try {
      const res = await api.get(`/assets/${id}/timeline`);

      console.log("Asset Timeline API response:", res.data);

      setTimeline(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Asset Timeline Error:", err);

      setTimeline([]);
    }
  }, [id]);

  /* =========================================================
     LOAD EVERYTHING
  ========================================================= */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      loadAsset(),
      loadTimeline(),
    ]);

    setLoading(false);
  }, [loadAsset, loadTimeline]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     DOWNLOAD QR CODE
  ========================================================= */

  const downloadQR = async () => {
    if (!asset) return;

    try {
      const assetUrl =
        `${window.location.origin}/assets/${asset.asset_id}`;

      const qrImage = await QRCode.toDataURL(assetUrl);

      const link = document.createElement("a");

      link.href = qrImage;
      link.download = `${asset.asset_tag}.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (err) {
      console.error("QR Code Error:", err);
    }
  };

  /* =========================================================
     STATUS COLORS
  ========================================================= */

  const badgeColor = {
    Available: "bg-green-500",
    Allocated: "bg-blue-500",
    Booked: "bg-yellow-500",
    Maintenance: "bg-orange-500",
    "Under Maintenance": "bg-orange-500",
    Lost: "bg-red-500",
    Retired: "bg-gray-500",
  };

  /* =========================================================
     TOTAL ACTIVITIES
  ========================================================= */

  const totalActivities = useMemo(
    () => timeline.length,
    [timeline]
  );

  /* =========================================================
     THEME CLASSES
  ========================================================= */

  const glass =
    "rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl transition-all duration-300";

  const card =
    "rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all duration-300";

  const heading =
    "text-slate-800 dark:text-white";

  const subtitle =
    "text-slate-500 dark:text-slate-300";

  const primary =
    "text-blue-600 dark:text-blue-400";

  const success =
    "text-emerald-600 dark:text-emerald-400";

  const purple =
    "text-purple-600 dark:text-purple-400";

  const indigo =
    "text-indigo-600 dark:text-indigo-400";

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar />

        <div className="flex-1 md:ml-72">
          <Navbar />

          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">

              <div className="w-20 h-20 rounded-full border-8 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-6"></div>

              <h2 className={`text-2xl font-bold ${heading}`}>
                Loading Asset...
              </h2>

              <p className={subtitle}>
                Please wait while we fetch asset details.
              </p>

            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (error || !asset) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar />

        <div className="flex-1 md:ml-72">
          <Navbar />

          <div className="flex items-center justify-center min-h-[80vh] p-6">
            <div
              className={`${glass} max-w-lg w-full p-10 text-center`}
            >
              <div className="text-6xl mb-6">
                ⚠️
              </div>

              <h2
                className={`text-3xl font-bold ${heading}`}
              >
                Unable to Load Asset
              </h2>

              <p className={`mt-4 ${subtitle}`}>
                {error || "Asset not found."}
              </p>

              <div className="flex justify-center gap-4 mt-8">

                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold hover:scale-105 transition"
                >
                  <FaArrowLeft className="inline mr-2" />
                  Back
                </button>

                <button
                  onClick={loadData}
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:scale-105 transition"
                >
                  Try Again
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">

      <Sidebar />

      <div className="flex-1 md:ml-72">

        <Navbar />

        <div className="max-w-[1800px] mx-auto p-6 md:p-8">

          {/* =================================================
              HERO SECTION
          ================================================= */}

          <div className={`${glass} p-8 md:p-10 mb-8`}>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

              <div>

                <p className="uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 font-semibold">
                  Enterprise Asset Management
                </p>

                <h1
                  className={`text-4xl md:text-5xl font-bold mt-3 ${heading}`}
                >
                  {asset.asset_name}
                </h1>

                <p className={`mt-4 text-lg ${subtitle}`}>
                  Complete asset information, statistics and activity history.
                </p>

              </div>

              <div className="flex gap-4">

                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white shadow-lg hover:scale-105 transition flex items-center gap-3"
                >
                  <FaArrowLeft />
                  Back
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg hover:scale-105 transition flex items-center gap-3"
                >
                  <FaPrint />
                  Print
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              TOP SECTION
          ================================================= */}

          <div className="grid lg:grid-cols-3 gap-8">

            {/* =================================================
                LEFT ASSET CARD
            ================================================= */}

            <div className="lg:col-span-1">

              <div className={`${glass} overflow-hidden`}>

                <div className="relative">

                  {asset.image_url ? (
                    <img
                      src={`http://localhost:5000${asset.image_url}`}
                      alt={asset.asset_name}
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-96 bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center">

                      <FaImage className="text-6xl text-slate-400 dark:text-slate-500 mb-4" />

                      <p className={subtitle}>
                        No Image Available
                      </p>

                    </div>
                  )}

                  <div className="absolute top-5 right-5">

                    <span
                      className={`px-5 py-2 rounded-full text-white font-semibold shadow-lg ${
                        badgeColor[asset.status] ||
                        "bg-gray-500"
                      }`}
                    >
                      {asset.status}
                    </span>

                  </div>

                </div>

                <div className="p-8 text-center">

                  <h2
                    className={`text-3xl font-bold ${heading}`}
                  >
                    {asset.asset_name}
                  </h2>

                  <p
                    className={`font-semibold text-lg mt-2 ${primary}`}
                  >
                    {asset.asset_tag}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-8">

                    {/* Category */}

                    <div className={`${card} p-5`}>

                      <FaLayerGroup className="mx-auto text-3xl text-blue-600 dark:text-blue-400 mb-3" />

                      <p className={`text-sm ${subtitle}`}>
                        Category
                      </p>

                      <h3
                        className={`font-bold mt-2 ${heading}`}
                      >
                        {asset.category_name || "Not Assigned"}
                      </h3>

                    </div>

                    {/* Timeline */}

                    <div className={`${card} p-5`}>

                      <FaChartLine className="mx-auto text-3xl text-green-600 dark:text-green-400 mb-3" />

                      <p className={`text-sm ${subtitle}`}>
                        Timeline
                      </p>

                      <h3
                        className={`font-bold mt-2 ${heading}`}
                      >
                        {totalActivities}
                      </h3>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="lg:col-span-2">

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Purchase Cost */}

                <div className={`${glass} p-6`}>

                  <p className={`text-sm ${subtitle}`}>
                    Purchase Cost
                  </p>

                  <h2
                    className={`text-3xl font-bold mt-2 ${success}`}
                  >
                    ₹{" "}
                    {Number(
                      asset.purchase_cost || 0
                    ).toLocaleString("en-IN")}
                  </h2>

                </div>

                {/* Status */}

                <div className={`${glass} p-6`}>

                  <p className={`text-sm ${subtitle}`}>
                    Status
                  </p>

                  <h2
                    className={`text-xl md:text-2xl lg:text-3xl font-bold mt-2 break-words leading-tight ${primary}`}
                  >
                    {asset.status || "-"}
                  </h2>

                </div>

                {/* Bookable */}

                <div className={`${glass} p-6`}>

                  <p className={`text-sm ${subtitle}`}>
                    Bookable
                  </p>

                  <h2
                    className={`text-3xl font-bold mt-2 ${purple}`}
                  >
                    {asset.is_bookable ? "YES" : "NO"}
                  </h2>

                </div>

                {/* Activities */}

                <div className={`${glass} p-6`}>

                  <p className={`text-sm ${subtitle}`}>
                    Activities
                  </p>

                  <h2
                    className={`text-3xl font-bold mt-2 ${indigo}`}
                  >
                    {totalActivities}
                  </h2>

                </div>

              </div>

              {/* =================================================
                  ASSET INFORMATION
              ================================================= */}

              <div className={`${glass} p-8 mt-8`}>

                <h2
                  className={`text-3xl font-bold mb-8 ${heading}`}
                >
                  Asset Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* Department */}

                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700">

                    <FaBuilding className="text-purple-600 text-2xl mt-1 flex-shrink-0" />

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        Department
                      </p>

                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {asset.department_name || "Not Assigned"}
                      </h3>

                    </div>

                  </div>

                  {/* Condition */}

                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700">

                    <FaClipboardCheck className="text-green-600 text-2xl mt-1 flex-shrink-0" />

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        Condition
                      </p>

                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {asset.asset_condition || "-"}
                      </h3>

                    </div>

                  </div>

                  {/* Purchase Date */}

                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700">

                    <FaCalendarAlt className="text-pink-600 text-2xl mt-1 flex-shrink-0" />

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        Purchase Date
                      </p>

                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {asset.purchase_date
                          ? new Date(
                              asset.purchase_date
                            ).toLocaleDateString("en-IN")
                          : "-"}
                      </h3>

                    </div>

                  </div>

                  {/* Purchase Cost */}

                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700">

                    <FaMoneyBillWave className="text-green-600 text-2xl mt-1 flex-shrink-0" />

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        Purchase Cost
                      </p>

                      <h3 className="font-bold text-lg text-green-600">
                        ₹{" "}
                        {Number(
                          asset.purchase_cost || 0
                        ).toLocaleString("en-IN")}
                      </h3>

                    </div>

                  </div>

                  {/* Location */}

                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700">

                    <FaMapMarkerAlt className="text-red-500 text-2xl mt-1 flex-shrink-0" />

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        Location
                      </p>

                      <h3 className="font-bold text-lg text-slate-800 dark:text-white break-words">
                        {asset.location || "-"}
                      </h3>

                    </div>

                  </div>

                  {/* Serial Number */}

                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700">

                    <FaTag className="text-indigo-600 text-2xl mt-1 flex-shrink-0" />

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        Serial Number
                      </p>

                      <h3 className="font-bold text-lg text-slate-800 dark:text-white break-words">
                        {asset.serial_number || "-"}
                      </h3>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ASSET TIMELINE
              ONLY ONE TIMELINE SECTION
          ================================================= */}

          <div className={`${glass} p-8 mt-8`}>

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2
                  className={`text-3xl font-bold ${heading}`}
                >
                  Asset Timeline
                </h2>

                <p className={`mt-2 ${subtitle}`}>
                  Complete history of this asset.
                </p>

              </div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl">

                <FaHistory />

              </div>

            </div>

            {timeline.length === 0 ? (

              <div className="text-center py-16">

                <FaHistory className="mx-auto text-6xl text-slate-300 dark:text-slate-600 mb-6" />

                <h3
                  className={`text-2xl font-bold ${heading}`}
                >
                  No Activity Yet
                </h3>

                <p className={`mt-2 ${subtitle}`}>
                  No timeline entries found for this asset.
                </p>

              </div>

            ) : (

              <div className="relative">

                {/* Timeline vertical line */}

                <div className="absolute left-5 top-0 bottom-0 w-1 bg-blue-300 dark:bg-blue-700 rounded-full"></div>

                {timeline.map((item, index) => (

                  <div
                    key={`${item.title}-${item.time}-${index}`}
                    className="relative flex gap-6 mb-10 last:mb-0"
                  >

                    {/* Timeline dot */}

                    <div className="relative z-10 flex-shrink-0">

                      <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-white dark:border-slate-800 shadow-lg"></div>

                    </div>

                    {/* Timeline content */}

                    <div
                      className="
                        flex-1
                        rounded-2xl
                        bg-white
                        dark:bg-slate-800
                        border
                        border-slate-200
                        dark:border-slate-700
                        shadow-lg
                        hover:shadow-2xl
                        transition-all
                        duration-300
                        p-6
                      "
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {item.title || "Activity"}
                        </h3>

                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.time
                            ? new Date(
                                item.time
                              ).toLocaleString("en-IN")
                            : "-"}
                        </span>

                      </div>

                      <p className="mt-4 leading-7 text-slate-700 dark:text-slate-300">
                        {item.description || "No description available."}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className={`${glass} p-8 mt-8 mb-10`}>

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2
                  className={`text-3xl font-bold ${heading}`}
                >
                  Quick Actions
                </h2>

                <p className={`mt-2 ${subtitle}`}>
                  Perform useful operations for this asset.
                </p>

              </div>

            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

              {/* Back */}

              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 text-white p-6 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >

                <h3 className="text-xl font-bold">
                  ← Back
                </h3>

                <p className="mt-2 text-sm text-slate-200">
                  Return to Assets
                </p>

              </button>

              {/* Print */}

              <button
                onClick={() => window.print()}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >

                <h3 className="text-xl font-bold">
                  🖨 Print
                </h3>

                <p className="mt-2 text-sm text-blue-100">
                  Print this asset report
                </p>

              </button>

              {/* Refresh */}

              <button
                onClick={loadData}
                className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >

                <h3 className="text-xl font-bold">
                  🔄 Refresh
                </h3>

                <p className="mt-2 text-sm text-green-100">
                  Reload asset information
                </p>

              </button>

              {/* QR Code */}

              <button
                onClick={downloadQR}
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >

                <h3 className="text-xl font-bold">
                  📱 QR Code
                </h3>

                <p className="mt-2 text-sm text-purple-100">
                  Download QR Code
                </p>

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AssetDetails;