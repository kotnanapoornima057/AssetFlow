import pool from "../config/db.js";

// Get System Settings
export const getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM system_settings LIMIT 1"
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update System Settings
export const updateSettings = async (req, res) => {
  try {
    const {
      company_name,
      company_email,
      phone,
      address,
      timezone,
      currency,
      asset_prefix,
      asset_start_number,
      audit_frequency,
      maintenance_alert_days,
    } = req.body;

    await pool.query(
      `
      UPDATE system_settings
      SET
        company_name=$1,
        company_email=$2,
        phone=$3,
        address=$4,
        timezone=$5,
        currency=$6,
        asset_prefix=$7,
        asset_start_number=$8,
        audit_frequency=$9,
        maintenance_alert_days=$10,
        updated_at=CURRENT_TIMESTAMP
      WHERE setting_id=1
      `,
      [
        company_name,
        company_email,
        phone,
        address,
        timezone,
        currency,
        asset_prefix,
        asset_start_number,
        audit_frequency,
        maintenance_alert_days,
      ]
    );

    res.json({
      message: "Settings Updated Successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};