import pool from "../config/db.js";

export const getNotifications = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT *
       FROM notifications
       ORDER BY created_at DESC`
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export const markAsRead = async (req, res) => {
  try {

    await pool.query(
      "UPDATE notifications SET is_read=TRUE"
    );

    res.json({
      message: "Notifications Updated"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export const getLatestNotifications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM notifications
      ORDER BY notification_id DESC
      LIMIT 8
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE is_read = false
    `);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE notification_id = $1
      `,
      [id]
    );

    res.json({
      message: "Notification marked as read",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};