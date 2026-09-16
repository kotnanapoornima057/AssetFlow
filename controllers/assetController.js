import pool from "../config/db.js";
import logActivity from "../utils/logActivity.js";

/* =========================================================
   GET ALL ASSETS
========================================================= */

export const getAssets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.asset_id,
        a.asset_tag,
        a.category_id,
        a.asset_name,
        c.category_name,
        a.serial_number,
        a.purchase_date,
        a.purchase_cost,
        a.asset_condition,
        a.location,
        a.status,
        a.image_url,
        a.is_bookable
      FROM assets a
      LEFT JOIN asset_categories c
        ON a.category_id = c.category_id
      ORDER BY a.asset_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Get Assets Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   ADD ASSET
========================================================= */

export const addAsset = async (req, res) => {
  try {
    const {
      asset_name,
      category_id,
      serial_number,
      purchase_date,
      purchase_cost,
      asset_condition,
      location,
      status,
      is_bookable,
    } = req.body;

    /* -----------------------------------------------------
       GENERATE NEXT ASSET TAG

       Only consider tags in the format AF-0001, AF-0002...
       Ignore old/manual tags such as AST001.
    ----------------------------------------------------- */

    const latest = await pool.query(`
      SELECT asset_tag
      FROM assets
      WHERE asset_tag ~ '^AF-[0-9]+$'
      ORDER BY
        CAST(SUBSTRING(asset_tag FROM 4) AS INTEGER) DESC
      LIMIT 1
    `);

    let assetTag = "AF-0001";

    if (latest.rows.length > 0) {
      const lastTag = latest.rows[0].asset_tag;

      const number = parseInt(
        lastTag.replace("AF-", ""),
        10
      );

      assetTag = `AF-${String(number + 1).padStart(4, "0")}`;
    }

    /* -----------------------------------------------------
       INSERT ASSET
    ----------------------------------------------------- */

    const result = await pool.query(
      `
      INSERT INTO assets
      (
        asset_tag,
        asset_name,
        category_id,
        serial_number,
        purchase_date,
        purchase_cost,
        asset_condition,
        location,
        status,
        is_bookable
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING asset_id, asset_tag
      `,
      [
        assetTag,
        asset_name,
        category_id || null,
        serial_number || null,
        purchase_date || null,
        purchase_cost || 0,
        asset_condition || null,
        location || null,
        status || "Available",
        Boolean(is_bookable),
      ]
    );

    /* -----------------------------------------------------
       NOTIFICATION
    ----------------------------------------------------- */

    try {
      await pool.query(
        `
        INSERT INTO notifications
        (
          title,
          message,
          notification_type
        )
        VALUES
        ($1,$2,$3)
        `,
        [
          "New Asset Added",
          `${asset_name} has been added with tag ${assetTag}.`,
          "Asset",
        ]
      );
    } catch (notificationError) {
      console.error(
        "Notification Error:",
        notificationError.message
      );
    }

    /* -----------------------------------------------------
       ACTIVITY LOG
    ----------------------------------------------------- */

    try {
      await logActivity(
        req.user.user_id,
        "Added Asset",
        "Assets",
        `Created asset ${asset_name} (${assetTag})`
      );
    } catch (activityError) {
      console.error(
        "Activity Log Error:",
        activityError.message
      );
    }

    res.status(201).json({
      message: "Asset Added Successfully",
      asset_tag: result.rows[0].asset_tag,
      asset_id: result.rows[0].asset_id,
    });

  } catch (err) {
    console.error("Add Asset Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   DELETE ASSET
========================================================= */

export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    /* -----------------------------------------------------
       GET ASSET BEFORE DELETE
    ----------------------------------------------------- */

    const asset = await pool.query(
      `
      SELECT
        asset_tag,
        asset_name
      FROM assets
      WHERE asset_id = $1
      `,
      [id]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const {
      asset_tag,
      asset_name,
    } = asset.rows[0];

    /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

    await pool.query(
      `
      DELETE FROM assets
      WHERE asset_id = $1
      `,
      [id]
    );

    /* -----------------------------------------------------
       ACTIVITY LOG
    ----------------------------------------------------- */

    try {
      await logActivity(
        req.user.user_id,
        "Deleted Asset",
        "Assets",
        `Deleted asset ${asset_name} (${asset_tag})`
      );
    } catch (activityError) {
      console.error(
        "Activity Log Error:",
        activityError.message
      );
    }

    res.json({
      message: "Asset Deleted",
    });

  } catch (err) {
    console.error("Delete Asset Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   UPDATE ASSET
========================================================= */

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      asset_name,
      category_id,
      serial_number,
      purchase_date,
      purchase_cost,
      asset_condition,
      location,
      status,
      is_bookable,
    } = req.body;

    /* -----------------------------------------------------
       GET CURRENT ASSET
    ----------------------------------------------------- */

    const asset = await pool.query(
      `
      SELECT
        asset_tag,
        asset_name
      FROM assets
      WHERE asset_id = $1
      `,
      [id]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const assetTag = asset.rows[0].asset_tag;

    /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

    await pool.query(
      `
      UPDATE assets
      SET
        asset_name = $1,
        category_id = $2,
        serial_number = $3,
        purchase_date = $4,
        purchase_cost = $5,
        asset_condition = $6,
        location = $7,
        status = $8,
        is_bookable = $9
      WHERE asset_id = $10
      `,
      [
        asset_name,
        category_id || null,
        serial_number || null,
        purchase_date || null,
        purchase_cost || 0,
        asset_condition || null,
        location || null,
        status || "Available",
        Boolean(is_bookable),
        id,
      ]
    );

    /* -----------------------------------------------------
       ACTIVITY LOG
    ----------------------------------------------------- */

    try {
      await logActivity(
        req.user.user_id,
        "Updated Asset",
        "Assets",
        `Updated asset ${asset_name} (${assetTag})`
      );
    } catch (activityError) {
      console.error(
        "Activity Log Error:",
        activityError.message
      );
    }

    res.json({
      message: "Asset Updated Successfully",
    });

  } catch (err) {
    console.error("Update Asset Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   GET ASSET HISTORY
========================================================= */

export const getAssetHistory = async (req, res) => {
  try {
    const { id } = req.params;

    /* -----------------------------------------------------
       ASSET DETAILS
    ----------------------------------------------------- */

    const asset = await pool.query(
      `
      SELECT
        a.*,
        c.category_name
      FROM assets a
      LEFT JOIN asset_categories c
        ON a.category_id = c.category_id
      WHERE a.asset_id = $1
      `,
      [id]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    /* -----------------------------------------------------
       ALLOCATION HISTORY
    ----------------------------------------------------- */

    const allocations = await pool.query(
      `
      SELECT
        al.allocation_id,
        u.full_name,
        al.allocated_date,
        al.expected_return,
        al.returned_date,
        al.allocation_status
      FROM asset_allocations al
      JOIN users u
        ON al.user_id = u.user_id
      WHERE al.asset_id = $1
      ORDER BY al.allocation_id DESC
      `,
      [id]
    );

    /* -----------------------------------------------------
       MAINTENANCE HISTORY
    ----------------------------------------------------- */

    const maintenance = await pool.query(
      `
      SELECT
        maintenance_id,
        issue_description,
        priority,
        maintenance_status,
        technician,
        created_at
      FROM maintenance_requests
      WHERE asset_id = $1
      ORDER BY maintenance_id DESC
      `,
      [id]
    );

    /* -----------------------------------------------------
       TRANSFER HISTORY
    ----------------------------------------------------- */

    const transfers = await pool.query(
      `
      SELECT
        t.transfer_id,
        fu.full_name AS from_user,
        tu.full_name AS to_user,
        t.request_date,
        t.transfer_status,
        t.approval_date
      FROM asset_transfers t
      LEFT JOIN users fu
        ON t.from_user_id = fu.user_id
      LEFT JOIN users tu
        ON t.to_user_id = tu.user_id
      WHERE t.asset_id = $1
      ORDER BY t.request_date DESC
      `,
      [id]
    );

    res.json({
      asset: asset.rows[0],
      allocations: allocations.rows,
      maintenance: maintenance.rows,
      transfers: transfers.rows,
    });

  } catch (err) {
    console.error("Asset History Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   UPLOAD ASSET IMAGE
========================================================= */

export const uploadAssetImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    /* -----------------------------------------------------
       GET ASSET
    ----------------------------------------------------- */

    const asset = await pool.query(
      `
      SELECT
        asset_name,
        asset_tag
      FROM assets
      WHERE asset_id = $1
      `,
      [id]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const imageUrl =
      `/uploads/assets/${req.file.filename}`;

    /* -----------------------------------------------------
       UPDATE IMAGE URL
    ----------------------------------------------------- */

    await pool.query(
      `
      UPDATE assets
      SET image_url = $1
      WHERE asset_id = $2
      `,
      [imageUrl, id]
    );

    /* -----------------------------------------------------
       ACTIVITY LOG
    ----------------------------------------------------- */

    try {
      await logActivity(
        req.user.user_id,
        "Uploaded Asset Image",
        "Assets",
        `Uploaded image for ${asset.rows[0].asset_name} (${asset.rows[0].asset_tag})`
      );
    } catch (activityError) {
      console.error(
        "Activity Log Error:",
        activityError.message
      );
    }

    res.json({
      message: "Image uploaded successfully",
      image_url: imageUrl,
    });

  } catch (err) {
    console.error("Upload Asset Image Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   GET ASSET DETAILS
========================================================= */

export const getAssetDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        a.*,
        c.category_name
      FROM assets a
      LEFT JOIN asset_categories c
        ON a.category_id = c.category_id
      WHERE a.asset_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Get Asset Details Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   GET ASSET TIMELINE
========================================================= */

export const getAssetTimeline = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        purchase_date AS time,
        'Asset Purchased' AS title,
        asset_name || ' purchased' AS description
      FROM assets
      WHERE asset_id = $1

      UNION ALL

      SELECT
        allocated_date AS time,
        'Allocated' AS title,
        'Assigned to ' || u.full_name AS description
      FROM asset_allocations a
      JOIN users u
        ON a.user_id = u.user_id
      WHERE a.asset_id = $1

      UNION ALL

      SELECT
        created_at AS time,
        'Maintenance Raised' AS title,
        issue_description AS description
      FROM maintenance_requests
      WHERE asset_id = $1

      UNION ALL

      SELECT
        requested_at AS time,
        'Transfer Requested' AS title,
        'Transfer requested' AS description
      FROM transfer_requests
      WHERE asset_id = $1

      ORDER BY time
      `,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Timeline Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAssetIntelligence = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.asset_id,
        a.asset_tag,
        a.asset_name,
        a.purchase_cost,
        a.purchase_date,
        a.warranty_expiry,
        a.status,
        a.asset_condition,

        COUNT(DISTINCT m.maintenance_id) AS maintenance_count,

        COUNT(DISTINCT al.allocation_id) AS allocation_count,

        COALESCE(
          SUM(
            CASE
              WHEN m.maintenance_status != 'Completed'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS open_maintenance_count

      FROM assets a

      LEFT JOIN maintenance_requests m
        ON a.asset_id = m.asset_id

      LEFT JOIN asset_allocations al
        ON a.asset_id = al.asset_id

      GROUP BY
        a.asset_id

      ORDER BY
        a.asset_id
    `);

    const assets = result.rows.map(asset => {

      let riskScore = 0;

      /* Warranty risk */

      if (asset.warranty_expiry) {

        const today = new Date();
        const warranty = new Date(asset.warranty_expiry);

        const difference =
          warranty - today;

        const days =
          Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
          );

        if (days < 0) {
          riskScore += 30;
        }
        else if (days <= 30) {
          riskScore += 25;
        }
        else if (days <= 90) {
          riskScore += 15;
        }
      }

      /* Maintenance risk */

      const maintenanceCount =
        Number(asset.maintenance_count);

      if (maintenanceCount >= 5) {
        riskScore += 30;
      }
      else if (maintenanceCount >= 3) {
        riskScore += 20;
      }
      else if (maintenanceCount >= 1) {
        riskScore += 10;
      }

      /* Condition risk */

      if (
        asset.asset_condition === "Poor"
      ) {
        riskScore += 25;
      }
      else if (
        asset.asset_condition === "Fair"
      ) {
        riskScore += 15;
      }

      /* Open maintenance */

      if (
        Number(asset.open_maintenance_count) > 0
      ) {
        riskScore += 15;
      }

      /* Maximum 100 */

      riskScore =
        Math.min(riskScore, 100);

      let riskLevel = "Low";

      if (riskScore >= 70) {
        riskLevel = "High";
      }
      else if (riskScore >= 40) {
        riskLevel = "Medium";
      }

      return {
        ...asset,
        risk_score: riskScore,
        risk_level: riskLevel
      };
    });

    res.json(assets);

  } catch (err) {

    console.error(
      "Asset Intelligence Error:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};