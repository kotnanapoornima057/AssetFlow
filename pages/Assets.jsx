import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaBox,
  FaSearch,
  FaCamera,
  FaUpload,
} from "react-icons/fa";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AssetQRCode from "../components/AssetQRCode";

import {
  confirmDelete,
  successAlert,
  errorAlert,
} from "../utils/alerts";

import { useTheme } from "../context/ThemeContext";

function Assets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [qrAsset, setQrAsset] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [form, setForm] = useState({
    asset_name: "",
    category_id: "",
    serial_number: "",
    purchase_date: "",
    purchase_cost: "",
    asset_condition: "",
    location: "",
    status: "Available",
    is_bookable: false,
  });

  useEffect(() => {
    loadAssets();
    loadCategories();
  }, []);

  useEffect(() => {
    if (location.state?.status) {
      setStatusFilter(location.state.status);
    }
  }, [location]);

  const loadAssets = async () => {
    try {
      const res = await api.get("/assets");
      setAssets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const totalValue = useMemo(() => {
    return assets.reduce(
      (sum, asset) => sum + Number(asset.purchase_cost || 0),
      0
    );
  }, [assets]);

  const glass =
    "rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e) => {
    setForm({
      ...form,
      is_bookable: e.target.checked,
    });
  };

  const startEdit = (asset) => {
    setEditingId(asset.asset_id);

    setForm({
      asset_name: asset.asset_name,
      category_id: asset.category_id,
      serial_number: asset.serial_number,
      purchase_date: asset.purchase_date?.split("T")[0] || "",
      purchase_cost: asset.purchase_cost,
      asset_condition: asset.asset_condition,
      location: asset.location,
      status: asset.status,
      is_bookable: asset.is_bookable || false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      asset_name: "",
      category_id: "",
      serial_number: "",
      purchase_date: "",
      purchase_cost: "",
      asset_condition: "",
      location: "",
      status: "Available",
      is_bookable: false,
    });
  };

  const saveAsset = async () => {
    try {
      let res;

      if (editingId) {
        await api.put(`/assets/${editingId}`, form);
        successAlert("Asset Updated Successfully");
      } else {
        res = await api.post("/assets", form);

        successAlert(
          `Asset Added Successfully!\nGenerated Asset Tag: ${res.data.asset_tag}`
        );
      }

      cancelEdit();
      loadAssets();
    } catch (err) {
      errorAlert(
        err.response?.data?.message ||
          "Error saving asset."
      );
    }
  };

  const deleteAsset = async (id) => {
    const result = await confirmDelete("Asset");

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/assets/${id}`);

      successAlert("Asset deleted successfully");

      loadAssets();
    } catch (err) {
      errorAlert(
        err.response?.data?.message ||
          "Cannot delete asset."
      );
    }
  };

  // ================= PHOTO UPLOAD =================

  const uploadImage = async (assetId, file) => {
    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);

    try {
      await api.post(
        `/assets/${assetId}/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      successAlert("Photo uploaded successfully");

      await loadAssets();
    } catch (err) {
      console.log(err);

      errorAlert(
        err.response?.data?.message ||
          "Photo upload failed."
      );
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.asset_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      asset.asset_tag
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      asset.status === statusFilter;

    const matchesCategory =
      categoryFilter === "" ||
      asset.category_name === categoryFilter;

    const matchesLocation =
      locationFilter === "" ||
      asset.location === locationFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesLocation
    );
  });

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
                  Asset Management
                </h1>

                <p
                  className={`${muted} mt-4 text-sm sm:text-base lg:text-lg max-w-2xl`}
                >
                  Register, organize and manage all enterprise assets from one
                  modern dashboard.
                </p>

              </div>

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
                    Total Assets
                  </p>

                  <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-blue-600">
                    {assets.length}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Categories
                  </p>

                  <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-indigo-600">
                    {categories.length}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Locations
                  </p>

                  <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-purple-600">
                    {
                      [...new Set(
                        assets
                          .map((a) => a.location)
                          .filter(Boolean)
                      )].length
                    }
                  </h2>
                </div>

                <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Asset Value
                  </p>

                  <h2 className="mt-2 text-xl lg:text-2xl font-bold text-green-600 break-words">
                    ₹ {totalValue.toLocaleString()}
                  </h2>
                </div>

              </div>
            </div>
          </div>

          {/* ================= REGISTER / UPDATE ASSET ================= */}

          <div className={`${glass} p-5 sm:p-8 mb-8`}>

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

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                  {editingId ? "✏️ Update Asset" : "📦 Register New Asset"}
                </h2>

                <p className={`${muted} mt-2 text-sm sm:text-base`}>
                  Fill in the asset information below.
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
                <FaBox />
              </div>

            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
              "
            >

              {/* Asset Name */}

              <div>
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Asset Name
                </label>

                <input
                  name="asset_name"
                  value={form.asset_name}
                  onChange={handleChange}
                  placeholder="Dell Latitude Laptop"
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

              {/* Category */}

              <div>
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Category
                </label>

                <select
                  name="category_id"
                  value={form.category_id}
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
                  <option value="">Select Category</option>

                  {categories.map((cat) => (
                    <option
                      key={cat.category_id}
                      value={cat.category_id}
                    >
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serial Number */}

              <div>
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Serial Number
                </label>

                <input
                  name="serial_number"
                  value={form.serial_number}
                  onChange={handleChange}
                  placeholder="SN-123456"
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

              {/* Purchase Date */}

              <div>
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Purchase Date
                </label>

                <input
                  type="date"
                  name="purchase_date"
                  value={form.purchase_date}
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

              {/* Purchase Cost */}

              <div>
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Purchase Cost
                </label>

                <input
                  type="number"
                  name="purchase_cost"
                  value={form.purchase_cost}
                  onChange={handleChange}
                  placeholder="45000"
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

              {/* Condition */}

              <div>
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Condition
                </label>

                <input
                  name="asset_condition"
                  value={form.asset_condition}
                  onChange={handleChange}
                  placeholder="Excellent"
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

              {/* Location */}

              <div>
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="IT Block"
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
                  name="status"
                  value={form.status}
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
                  <option>Available</option>
                  <option>Allocated</option>
                  <option>Booked</option>
                  <option>Maintenance</option>
                  <option>Lost</option>
                  <option>Retired</option>
                </select>
              </div>

              {/* Bookable */}

              <div className="md:col-span-2 xl:col-span-3">

                <label
                  className="
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-slate-50
                    dark:bg-slate-800
                    px-5
                    py-4
                    cursor-pointer
                  "
                >

                  <input
                    type="checkbox"
                    checked={form.is_bookable}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 accent-blue-600"
                  />

                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Shared / Bookable Resource
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Employees can reserve this asset.
                    </p>
                  </div>

                </label>

              </div>

            </div>

            {/* Buttons */}

            <div
              className="
                mt-10
                flex
                flex-col
                sm:flex-row
                gap-4
              "
            >

              <button
                onClick={saveAsset}
                className="
                  flex-1
                  sm:flex-none
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
                {editingId ? "Update Asset" : "Add Asset"}
              </button>

              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="
                    flex-1
                    sm:flex-none
                    px-8
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-gray-500
                    to-gray-700
                    text-white
                    font-bold
                    hover:scale-105
                    transition
                  "
                >
                  Cancel
                </button>
              )}

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
                  Quickly find assets using filters.
                </p>
              </div>

            </div>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-5
              "
            >

              {/* Search */}

              <div className="sm:col-span-2 xl:col-span-1">

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Search
                </label>

                <input
                  type="text"
                  placeholder="Asset Name / Asset Tag"
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
                  <option>Available</option>
                  <option>Allocated</option>
                  <option>Booked</option>
                  <option>Maintenance</option>
                  <option>Lost</option>
                  <option>Retired</option>
                </select>

              </div>

              {/* Category */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Category
                </label>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
                  <option value="">All Categories</option>

                  {categories.map((cat) => (
                    <option
                      key={cat.category_id}
                      value={cat.category_name}
                    >
                      {cat.category_name}
                    </option>
                  ))}

                </select>

              </div>

              {/* Location */}

              <div>

                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">
                  Location
                </label>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
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
                  <option value="">All Locations</option>

                  {[...new Set(
                    assets
                      .map((a) => a.location)
                      .filter(Boolean)
                  )].map((loc) => (
                    <option
                      key={loc}
                      value={loc}
                    >
                      {loc}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {(search || statusFilter || categoryFilter || locationFilter) && (
              <div className="mt-6 flex flex-wrap gap-3">

                {search && (
                  <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">
                    Search: {search}
                  </span>
                )}

                {statusFilter && (
                  <span className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm">
                    {statusFilter}
                  </span>
                )}

                {categoryFilter && (
                  <span className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm">
                    {categoryFilter}
                  </span>
                )}

                {locationFilter && (
                  <span className="px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-sm">
                    {locationFilter}
                  </span>
                )}

                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setCategoryFilter("");
                    setLocationFilter("");
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

          {/* ================= ASSETS TABLE ================= */}

          <div className={`${glass} mt-8 overflow-hidden`}>

            <div className="px-5 sm:px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Registered Assets
                </h2>

                <p className={`${muted} mt-2`}>
                  Manage enterprise assets, upload images and generate QR codes.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <span className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold">
                  {filteredAssets.length} Assets
                </span>

              </div>

            </div>

            {/* ================= DESKTOP TABLE ================= */}

            <div className="hidden xl:block overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead className="bg-slate-100 dark:bg-slate-800">

                  <tr className="text-left text-sm font-bold uppercase tracking-wide">

                    <th className="px-6 py-5">ID</th>
                    <th className="px-6 py-5">Tag</th>
                    <th className="px-6 py-5">Image</th>
                    <th className="px-6 py-5">Asset</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Location</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Bookable</th>
                    <th className="px-6 py-5 text-center">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAssets.map((asset) => (

                    <tr
                      key={asset.asset_id}
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
                        {asset.asset_id}
                      </td>

                      {/* Asset Tag */}

                      <td className="px-6 py-6">

                        <span
                          className="
                            px-3
                            py-1.5
                            rounded-xl
                            bg-blue-100
                            dark:bg-blue-900/40
                            text-blue-700
                            dark:text-blue-300
                            font-bold
                            text-sm
                          "
                        >
                          {asset.asset_tag}
                        </span>

                      </td>

                      {/* ================= IMAGE ================= */}

                      <td className="px-6 py-6">

                        <div className="flex flex-col gap-3">

                          {asset.image_url ? (

                            <img
                              src={`http://localhost:5000${asset.image_url}`}
                              alt={asset.asset_name}
                              className="
                                w-16
                                h-16
                                rounded-2xl
                                object-cover
                                border
                                border-slate-300
                                dark:border-slate-700
                                shadow
                              "
                            />

                          ) : (

                            <div
                              className="
                                w-16
                                h-16
                                rounded-2xl
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
                                text-xs
                                font-semibold
                                gap-1
                              "
                            >
                              <FaCamera className="text-lg" />
                              <span>No photo</span>
                            </div>

                          )}

                          {/* HIDDEN FILE INPUT */}

                          <input
                            id={`asset-upload-${asset.asset_id}`}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              uploadImage(
                                asset.asset_id,
                                e.target.files[0]
                              );

                              e.target.value = "";
                            }}
                          />

                          {/* CHANGE / UPLOAD BUTTON */}

                          {asset.image_url ? (

                            <div className="flex flex-col gap-2">

                              <label
                                htmlFor={`asset-upload-${asset.asset_id}`}
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  gap-2
                                  px-4
                                  py-2
                                  rounded-xl
                                  bg-blue-50
                                  dark:bg-blue-900/30
                                  text-blue-600
                                  dark:text-blue-400
                                  font-semibold
                                  cursor-pointer
                                  hover:bg-blue-100
                                  dark:hover:bg-blue-900/50
                                  transition
                                  text-sm
                                "
                              >
                                <FaCamera />
                                Change
                              </label>

                              <label
                                htmlFor={`asset-upload-${asset.asset_id}`}
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  gap-2
                                  px-4
                                  py-2
                                  rounded-xl
                                  bg-blue-600
                                  hover:bg-blue-700
                                  text-white
                                  font-semibold
                                  cursor-pointer
                                  transition
                                  text-sm
                                "
                              >
                                <FaUpload />
                                Upload Photo
                              </label>

                            </div>

                          ) : (

                            <label
                              htmlFor={`asset-upload-${asset.asset_id}`}
                              className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                px-4
                                py-2
                                rounded-xl
                                bg-blue-50
                                dark:bg-blue-900/30
                                text-blue-600
                                dark:text-blue-400
                                font-semibold
                                cursor-pointer
                                hover:bg-blue-100
                                dark:hover:bg-blue-900/50
                                transition
                                text-sm
                              "
                            >
                              <FaUpload />
                              Upload
                            </label>

                          )}

                        </div>

                      </td>

                      {/* Asset */}

                      <td className="px-6 py-6">

                        <div className="font-semibold text-slate-900 dark:text-white">
                          {asset.asset_name}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          SN: {asset.serial_number || "-"}
                        </div>

                      </td>

                      {/* Category */}

                      <td className="px-6 py-6">

                        <span
                          className="
                            px-3
                            py-1
                            rounded-xl
                            bg-violet-100
                            dark:bg-violet-900/30
                            text-violet-700
                            dark:text-violet-300
                            text-sm
                          "
                        >
                          {asset.category_name}
                        </span>

                      </td>

                      {/* Location */}

                      <td className="px-6 py-6">

                        <div className="font-medium">
                          {asset.location}
                        </div>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-6">

                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white
                          ${
                            asset.status === "Available"
                              ? "bg-green-600"
                              : asset.status === "Allocated"
                              ? "bg-blue-600"
                              : asset.status === "Booked"
                              ? "bg-yellow-500"
                              : asset.status === "Maintenance"
                              ? "bg-orange-600"
                              : asset.status === "Lost"
                              ? "bg-red-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {asset.status}
                        </span>

                      </td>

                      {/* Bookable */}

                      <td className="px-6 py-6">

                        {asset.is_bookable ? (

                          <span
                            className="
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              bg-green-100
                              dark:bg-green-900/30
                              text-green-700
                              dark:text-green-300
                              font-semibold
                              text-sm
                            "
                          >
                            Yes
                          </span>

                        ) : (

                          <span
                            className="
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              bg-slate-200
                              dark:bg-slate-700
                              text-slate-700
                              dark:text-slate-300
                              font-semibold
                              text-sm
                            "
                          >
                            No
                          </span>

                        )}

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-6">

                        <div className="flex flex-wrap justify-center gap-2">

                          <button
                            onClick={() => startEdit(asset)}
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-amber-500
                              hover:bg-amber-600
                              text-white
                              font-medium
                              transition
                            "
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/assets/${asset.asset_id}`)
                            }
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-cyan-600
                              hover:bg-cyan-700
                              text-white
                              font-medium
                              transition
                            "
                          >
                            View
                          </button>

                          <button
                            onClick={() => setQrAsset(asset)}
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-indigo-600
                              hover:bg-indigo-700
                              text-white
                              font-medium
                              transition
                            "
                          >
                            QR
                          </button>

                          <button
                            onClick={() =>
                              deleteAsset(asset.asset_id)
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
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* ================= MOBILE / TABLET ================= */}

            <div className="xl:hidden mt-6 space-y-5 px-4 pb-6">

              {filteredAssets.map((asset) => (

                <div
                  key={asset.asset_id}
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

                  {/* Header */}

                  <div className="flex items-start gap-4">

                    {asset.image_url ? (

                      <img
                        src={`http://localhost:5000${asset.image_url}`}
                        alt={asset.asset_name}
                        className="
                          w-20
                          h-20
                          rounded-2xl
                          object-cover
                          border
                          border-slate-300
                          dark:border-slate-700
                        "
                      />

                    ) : (

                      <div
                        className="
                          w-20
                          h-20
                          rounded-2xl
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
                          text-xs
                          font-semibold
                          gap-1
                        "
                      >
                        <FaCamera className="text-xl" />
                        <span>No photo</span>
                      </div>

                    )}

                    <div className="flex-1">

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {asset.asset_name}
                      </h3>

                      <p className="text-blue-600 font-semibold mt-1">
                        {asset.asset_tag}
                      </p>

                      <p className="text-sm text-slate-500 mt-2">
                        {asset.category_name}
                      </p>

                    </div>

                  </div>

                  {/* ================= MOBILE PHOTO BUTTONS ================= */}

                  <input
                    id={`asset-upload-mobile-${asset.asset_id}`}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      uploadImage(
                        asset.asset_id,
                        e.target.files[0]
                      );

                      e.target.value = "";
                    }}
                  />

                  <div className="flex flex-wrap gap-3 mt-5">

                    {asset.image_url ? (

                      <>
                        <label
                          htmlFor={`asset-upload-mobile-${asset.asset_id}`}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-blue-50
                            dark:bg-blue-900/30
                            text-blue-600
                            dark:text-blue-400
                            font-semibold
                            cursor-pointer
                            hover:bg-blue-100
                            dark:hover:bg-blue-900/50
                            transition
                          "
                        >
                          <FaCamera />
                          Change
                        </label>

                        <label
                          htmlFor={`asset-upload-mobile-${asset.asset_id}`}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            font-semibold
                            cursor-pointer
                            transition
                          "
                        >
                          <FaUpload />
                          Upload Photo
                        </label>
                      </>

                    ) : (

                      <label
                        htmlFor={`asset-upload-mobile-${asset.asset_id}`}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2
                          rounded-xl
                          bg-blue-50
                          dark:bg-blue-900/30
                          text-blue-600
                          dark:text-blue-400
                          font-semibold
                          cursor-pointer
                          hover:bg-blue-100
                          dark:hover:bg-blue-900/50
                          transition
                        "
                      >
                        <FaUpload />
                        Upload
                      </label>

                    )}

                  </div>

                  {/* Details */}

                  <div className="grid grid-cols-2 gap-4 mt-5 text-sm">

                    <div>

                      <p className="text-slate-500">
                        Location
                      </p>

                      <p className="font-semibold dark:text-white">
                        {asset.location}
                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500">
                        Serial
                      </p>

                      <p className="font-semibold dark:text-white">
                        {asset.serial_number || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-slate-500">
                        Status
                      </p>

                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold text-white
                        ${
                          asset.status === "Available"
                            ? "bg-green-600"
                            : asset.status === "Allocated"
                            ? "bg-blue-600"
                            : asset.status === "Booked"
                            ? "bg-yellow-500"
                            : asset.status === "Maintenance"
                            ? "bg-orange-600"
                            : asset.status === "Lost"
                            ? "bg-red-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {asset.status}
                      </span>

                    </div>

                    <div>

                      <p className="text-slate-500">
                        Bookable
                      </p>

                      <p className="font-semibold dark:text-white">
                        {asset.is_bookable ? "Yes" : "No"}
                      </p>

                    </div>

                  </div>

                  {/* Buttons */}

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <button
                      onClick={() => startEdit(asset)}
                      className="py-3 rounded-xl bg-amber-500 text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/assets/${asset.asset_id}`)
                      }
                      className="py-3 rounded-xl bg-cyan-600 text-white"
                    >
                      View
                    </button>

                    <button
                      onClick={() => setQrAsset(asset)}
                      className="py-3 rounded-xl bg-indigo-600 text-white"
                    >
                      QR Code
                    </button>

                    <button
                      onClick={() =>
                        deleteAsset(asset.asset_id)
                      }
                      className="py-3 rounded-xl bg-red-600 text-white"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* ================= EMPTY STATE ================= */}

          {filteredAssets.length === 0 && (

            <div className={`${glass} p-10 mt-8 text-center`}>

              <div className="flex justify-center mb-4">

                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl text-slate-500">
                  <FaBox />
                </div>

              </div>

              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                No Assets Found
              </h3>

              <p className={`${muted} mt-2`}>
                Try changing your search or filters.
              </p>

            </div>

          )}

          {/* ================= QR CODE MODAL ================= */}

          {qrAsset && (

            <AssetQRCode
              asset={qrAsset}
              onClose={() => setQrAsset(null)}
            />

          )}

        </div>

      </div>

    </div>
  );
}

export default Assets;