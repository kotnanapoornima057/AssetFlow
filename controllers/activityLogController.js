import pool from "../config/db.js";

export const getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        l.log_id,
        l.action,
        l.module,
        l.details,
        l.created_at,
        u.full_name
      FROM activity_logs l
      LEFT JOIN users u
      ON l.user_id = u.user_id
      ORDER BY l.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};