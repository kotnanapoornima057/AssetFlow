import pool from "../config/db.js";

export const getActivities = async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT
        a.log_id,
        u.full_name,
        a.action,
        a.description,
        a.created_at
    FROM activity_logs a
    LEFT JOIN users u
    ON a.user_id = u.user_id
    ORDER BY a.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};