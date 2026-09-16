import pool from "../config/db.js";

const logActivity = async (
  userId,
  action,
  module,
  details
) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs
      (user_id, action, module, details)
      VALUES($1,$2,$3,$4)`,
      [
        userId,
        action,
        module,
        details,
      ]
    );
  } catch (err) {
    console.log(err.message);
  }
};

export default logActivity;