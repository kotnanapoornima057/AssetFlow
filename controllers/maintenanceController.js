import pool from "../config/db.js";


// ============================================================
// GET ALL MAINTENANCE REQUESTS
// ============================================================

export const getMaintenance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.maintenance_id,
        m.asset_id,
        a.asset_name,
        a.asset_tag,
        m.user_id,
        u.full_name,
        m.issue_description,
        m.priority,
        m.maintenance_status,
        m.technician,
        m.photo_url,
        m.created_at
      FROM maintenance_requests m
      JOIN assets a
        ON m.asset_id = a.asset_id
      JOIN users u
        ON m.user_id = u.user_id
      ORDER BY m.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.error("Error getting maintenance:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// ============================================================
// ADD MAINTENANCE REQUEST
// ============================================================

export const addMaintenance = async (req, res) => {
  try {

    const {
      asset_id,
      user_id,
      issue_description,
      priority,
    } = req.body;


    if (!asset_id || !user_id || !issue_description) {

      return res.status(400).json({
        message:
          "Asset, user and issue description are required",
      });

    }


    await pool.query(
      `
      INSERT INTO maintenance_requests
      (
        asset_id,
        user_id,
        issue_description,
        priority,
        maintenance_status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        'Pending'
      )
      `,
      [
        asset_id,
        user_id,
        issue_description,
        priority || "Medium",
      ]
    );


    await pool.query(
      `
      UPDATE assets
      SET status = 'Under Maintenance'
      WHERE asset_id = $1
      `,
      [asset_id]
    );


    res.json({
      message:
        "Maintenance Request Raised Successfully",
    });

  } catch (err) {

    console.error("Error adding maintenance:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


// ============================================================
// UPDATE MAINTENANCE STATUS
// ============================================================

export const updateMaintenanceStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      maintenance_status,
      technician,
    } = req.body;


    const result = await pool.query(
      `
      SELECT asset_id
      FROM maintenance_requests
      WHERE maintenance_id = $1
      `,
      [id]
    );


    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Maintenance request not found",
      });

    }


    const assetId = result.rows[0].asset_id;


    await pool.query(
      `
      UPDATE maintenance_requests
      SET
        maintenance_status = $1,
        technician = $2
      WHERE maintenance_id = $3
      `,
      [
        maintenance_status,
        technician || null,
        id,
      ]
    );


    if (maintenance_status === "Resolved") {

      await pool.query(
        `
        UPDATE assets
        SET status = 'Available'
        WHERE asset_id = $1
        `,
        [assetId]
      );

    }


    res.json({
      message:
        "Maintenance Status Updated",
    });

  } catch (err) {

    console.error(
      "Error updating maintenance status:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// ============================================================
// DELETE MAINTENANCE REQUEST
// ============================================================

export const deleteMaintenance = async (req, res) => {
  try {

    const { id } = req.params;


    await pool.query(
      `
      DELETE FROM maintenance_requests
      WHERE maintenance_id = $1
      `,
      [id]
    );


    res.json({
      message:
        "Maintenance Request Deleted",
    });

  } catch (err) {

    console.error(
      "Error deleting maintenance:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// ============================================================
// UPLOAD MAINTENANCE PHOTO
// ============================================================

export const uploadMaintenancePhoto = async (req, res) => {
  try {

    const { id } = req.params;


    // Check whether file exists

    if (!req.file) {

      return res.status(400).json({
        message: "No file uploaded",
      });

    }


    console.log("Uploaded file:");
    console.log(req.file);


    // This matches the actual folder:
    //
    // uploads/assets/
    //

    const photoUrl =
      `/uploads/assets/${req.file.filename}`;


    // Save URL in database

    await pool.query(
      `
      UPDATE maintenance_requests
      SET photo_url = $1
      WHERE maintenance_id = $2
      `,
      [
        photoUrl,
        id,
      ]
    );


    res.json({

      message:
        "Photo uploaded successfully",

      photo_url:
        photoUrl,

    });

  } catch (err) {

    console.error(
      "Error uploading maintenance photo:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};