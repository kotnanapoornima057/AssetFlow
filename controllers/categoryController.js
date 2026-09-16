import pool from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM asset_categories ORDER BY category_id"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { category_name, warranty_period_months } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        message: "Category name is required"
      });
    }

    await pool.query(
      "INSERT INTO categories(category_name, warranty_period_months) VALUES($1,$2)",
      [category_name, warranty_period_months || null]
    );

    res.json({
      message: "Category Added"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM asset_categories WHERE category_id=$1",
      [id]
    );

    res.json({
      message: "Category Deleted"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, warranty_period_months } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        message: "Category name is required"
      });
    }

    await pool.query(
      "UPDATE categories SET category_name=$1, warranty_period_months=$2 WHERE category_id=$3",
      [category_name, warranty_period_months || null, id]
    );

    res.json({
      message: "Category Updated Successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};