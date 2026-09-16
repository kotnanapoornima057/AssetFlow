import pool from "../config/db.js";

export const globalSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json({
        assets: [],
        users: [],
        departments: [],
        categories: [],
      });
    }

    const keyword = `%${query}%`;

    // Assets
    const assets = await pool.query(
      `
      SELECT
        asset_id,
        asset_tag,
        asset_name,
        location,
        status
      FROM assets
      WHERE
        asset_name ILIKE $1
        OR asset_tag ILIKE $1
      ORDER BY asset_name
      LIMIT 5
      `,
      [keyword]
    );

    // Users
    const users = await pool.query(
      `
      SELECT
        user_id,
        full_name,
        role
      FROM users
      WHERE
        full_name ILIKE $1
      ORDER BY full_name
      LIMIT 5
      `,
      [keyword]
    );

    // Departments
    const departments = await pool.query(
      `
      SELECT
        department_id,
        department_name
      FROM departments
      WHERE
        department_name ILIKE $1
      ORDER BY department_name
      LIMIT 5
      `,
      [keyword]
    );

    // Categories
    const categories = await pool.query(
      `
      SELECT
        category_id,
        category_name
      FROM asset_categories
      WHERE
        category_name ILIKE $1
      ORDER BY category_name
      LIMIT 5
      `,
      [keyword]
    );

    res.json({
      assets: assets.rows,
      users: users.rows,
      departments: departments.rows,
      categories: categories.rows,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};