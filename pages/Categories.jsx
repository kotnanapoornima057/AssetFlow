import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaLayerGroup,
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaPlus,
  FaShieldAlt,
} from "react-icons/fa";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");

  const [editingId, setEditingId] = useState(null);

  const glass =
    "rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-700 shadow-xl";

  const muted =
    "text-slate-500 dark:text-slate-400";

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // =========================================================
  // FORM RESET
  // =========================================================

  const resetForm = () => {
    setCategoryName("");
    setWarrantyPeriod("");
    setEditingId(null);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const startEdit = (category) => {
    setEditingId(category.category_id);

    setCategoryName(category.category_name || "");

    setWarrantyPeriod(
      category.warranty_period !== null &&
        category.warranty_period !== undefined
        ? category.warranty_period
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // SAVE CATEGORY
  // =========================================================

  const saveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      const data = {
        category_name: categoryName.trim(),
        warranty_period:
          warrantyPeriod === ""
            ? null
            : Number(warrantyPeriod),
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, data);
      } else {
        await api.post("/categories", data);
      }

      resetForm();
      loadCategories();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Error saving category."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteCategory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/categories/${id}`);

      loadCategories();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Cannot delete this category. It may have assets linked to it."
      );
    }
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalCategories = useMemo(
    () => categories.length,
    [categories]
  );

  const categoriesWithWarranty = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.warranty_period !== null &&
          category.warranty_period !== undefined &&
          category.warranty_period !== ""
      ).length,
    [categories]
  );

  const categoriesWithoutWarranty = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.warranty_period === null ||
          category.warranty_period === undefined ||
          category.warranty_period === ""
      ).length,
    [categories]
  );

  // =========================================================
  // RETURN UI
  // =========================================================

  return (
    <div
      className="
        flex
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
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="flex-1 min-w-0 xl:ml-72">
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
            pb-12
          "
        >
          {/* =================================================
              HERO SECTION
          ================================================= */}

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
                -right-24
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
                -left-24
                w-72
                h-72
                bg-indigo-500/20
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
              {/* LEFT SIDE */}

              <div className="max-w-2xl">
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
                    sm:text-5xl
                    font-bold
                    text-slate-900
                    dark:text-white
                    mt-3
                  "
                >
                  Asset Categories
                </h1>

                <p
                  className={`
                    ${muted}
                    mt-4
                    text-base
                    sm:text-lg
                    leading-relaxed
                  `}
                >
                  Organize enterprise assets into meaningful
                  categories and manage warranty information
                  from one centralized dashboard.
                </p>
              </div>

              {/* STATISTICS */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  gap-4
                  w-full
                  2xl:max-w-3xl
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
                      Total Categories
                    </p>

                    <FaLayerGroup className="text-blue-500" />
                  </div>

                  <h2 className="text-3xl font-bold text-blue-600 mt-2">
                    {totalCategories}
                  </h2>
                </div>

                {/* WARRANTY */}

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
                      With Warranty
                    </p>

                    <FaShieldAlt className="text-green-500" />
                  </div>

                  <h2 className="text-3xl font-bold text-green-600 mt-2">
                    {categoriesWithWarranty}
                  </h2>
                </div>

                {/* WITHOUT WARRANTY */}

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
                      No Warranty
                    </p>

                    <FaBoxOpen className="text-orange-500" />
                  </div>

                  <h2 className="text-3xl font-bold text-orange-600 mt-2">
                    {categoriesWithoutWarranty}
                  </h2>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              ADD / EDIT CATEGORY FORM
          ================================================= */}

          <section className={`${glass} p-6 sm:p-8 mb-8`}>
            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-start
                sm:items-center
                justify-between
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
                  {editingId
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className={`${muted} mt-2`}>
                  {editingId
                    ? "Update the category information below."
                    : "Create a new asset category and optionally define its warranty period."}
                </p>
              </div>

              <div
                className="
                  hidden
                  sm:flex
                  items-center
                  justify-center
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-700
                  text-white
                  text-2xl
                  shadow-xl
                "
              >
                {editingId ? <FaEdit /> : <FaPlus />}
              </div>
            </div>

            <div
              className="
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-6
              "
            >
              {/* CATEGORY NAME */}

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
                  Category Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Laptop, Monitor, Furniture"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
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
                    focus:border-blue-500
                    transition
                  "
                />
              </div>

              {/* WARRANTY */}

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
                  Warranty Period
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Warranty period in months (optional)"
                  value={warrantyPeriod}
                  onChange={(e) =>
                    setWarrantyPeriod(e.target.value)
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
                    focus:border-blue-500
                    transition
                  "
                />
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={saveCategory}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-7
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
                {editingId ? (
                  <>
                    <FaEdit />
                    Update Category
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Category
                  </>
                )}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="
                    px-7
                    py-3
                    rounded-2xl
                    bg-slate-200
                    dark:bg-slate-700
                    text-slate-700
                    dark:text-slate-200
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
          </section>

          {/* =================================================
              CATEGORY LIST
          ================================================= */}

          <section className={`${glass} overflow-hidden`}>
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
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-3
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
                    Category Directory
                  </h2>

                  <p className={`${muted} mt-2`}>
                    View and manage all asset categories.
                  </p>
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    bg-blue-50
                    dark:bg-blue-900/20
                    text-blue-600
                    dark:text-blue-400
                    font-semibold
                    text-sm
                  "
                >
                  <FaLayerGroup />

                  {categories.length} Categories
                </div>
              </div>
            </div>

            {/* TABLE */}

            {categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead
                    className="
                      bg-slate-100/80
                      dark:bg-slate-800/80
                    "
                  >
                    <tr>
                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        ID
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        Category
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-left
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        Warranty
                      </th>

                      <th
                        className="
                          px-6
                          py-4
                          text-center
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category.category_id}
                        className="
                          border-b
                          border-slate-200
                          dark:border-slate-700
                          hover:bg-blue-50/50
                          dark:hover:bg-slate-800/50
                          transition
                        "
                      >
                        {/* ID */}

                        <td
                          className="
                            px-6
                            py-5
                            font-semibold
                            text-slate-700
                            dark:text-slate-300
                          "
                        >
                          #{category.category_id}
                        </td>

                        {/* NAME */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
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
                                dark:text-blue-400
                              "
                            >
                              <FaLayerGroup />
                            </div>

                            <div>
                              <p
                                className="
                                  font-semibold
                                  text-slate-900
                                  dark:text-white
                                "
                              >
                                {category.category_name}
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-slate-500
                                  dark:text-slate-400
                                  mt-1
                                "
                              >
                                Asset Category
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* WARRANTY */}

                        <td className="px-6 py-5">
                          {category.warranty_period !== null &&
                          category.warranty_period !==
                            undefined &&
                          category.warranty_period !== "" ? (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-2
                                px-4
                                py-2
                                rounded-full
                                bg-green-100
                                dark:bg-green-900/30
                                text-green-700
                                dark:text-green-400
                                text-sm
                                font-semibold
                              "
                            >
                              <FaShieldAlt />

                              {category.warranty_period}{" "}
                              months
                            </span>
                          ) : (
                            <span
                              className="
                                inline-flex
                                items-center
                                px-4
                                py-2
                                rounded-full
                                bg-slate-100
                                dark:bg-slate-800
                                text-slate-500
                                dark:text-slate-400
                                text-sm
                                font-medium
                              "
                            >
                              No Warranty
                            </span>
                          )}
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
                            <button
                              onClick={() =>
                                startEdit(category)
                              }
                              className="
                                inline-flex
                                items-center
                                gap-2
                                px-4
                                py-2
                                rounded-xl
                                bg-amber-500
                                hover:bg-amber-600
                                text-white
                                font-semibold
                                transition
                              "
                            >
                              <FaEdit />
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteCategory(
                                  category.category_id
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-2
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
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* =================================================
                 EMPTY STATE
              ================================================= */

              <div className="p-12 sm:p-16 text-center">
                <div
                  className="
                    mx-auto
                    w-24
                    h-24
                    rounded-full
                    bg-slate-100
                    dark:bg-slate-800
                    flex
                    items-center
                    justify-center
                    text-4xl
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  <FaLayerGroup />
                </div>

                <h3
                  className="
                    text-2xl
                    font-bold
                    text-slate-900
                    dark:text-white
                    mt-6
                  "
                >
                  No Categories Found
                </h3>

                <p
                  className={`
                    ${muted}
                    mt-2
                    max-w-md
                    mx-auto
                  `}
                >
                  Create your first asset category using
                  the form above.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Categories;