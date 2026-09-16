import pool from "../config/db.js";
import logActivity from "../utils/logActivity.js";

/* =========================================================
   GET ALL ALLOCATIONS
========================================================= */

export const getAllocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        al.allocation_id,
        al.asset_id,
        a.asset_name,
        a.asset_tag,
        al.user_id,
        u.full_name,
        al.allocated_date,
        al.expected_return,
        al.returned_date,
        al.allocation_status,
        al.condition_notes
      FROM asset_allocations al
      JOIN assets a
        ON al.asset_id = a.asset_id
      JOIN users u
        ON al.user_id = u.user_id
      ORDER BY al.allocation_id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("Get Allocations Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   ALLOCATE ASSET
========================================================= */

export const allocateAsset = async (req, res) => {
  try {
    const {
      asset_id,
      user_id,
      expected_return,
    } = req.body;

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!asset_id || !user_id) {
      return res.status(400).json({
        message: "Asset and user are required",
      });
    }

    /* -----------------------------------------------------
       GET ASSET
    ----------------------------------------------------- */

    const assetCheck = await pool.query(
      `
      SELECT
        asset_id,
        asset_name,
        asset_tag,
        status
      FROM assets
      WHERE asset_id = $1
      `,
      [asset_id]
    );

    if (assetCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const asset = assetCheck.rows[0];

    /* -----------------------------------------------------
       CHECK ASSET STATUS
    ----------------------------------------------------- */

    if (asset.status !== "Available") {
      return res.status(400).json({
        message: `Asset is currently '${asset.status}', not Available`,
      });
    }

    /* -----------------------------------------------------
       GET USER
    ----------------------------------------------------- */

    const userCheck = await pool.query(
      `
      SELECT
        user_id,
        full_name
      FROM users
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userCheck.rows[0];

    /* -----------------------------------------------------
       CREATE ALLOCATION
    ----------------------------------------------------- */

    const allocation = await pool.query(
      `
      INSERT INTO asset_allocations
      (
        asset_id,
        user_id,
        allocated_date,
        expected_return,
        allocation_status
      )
      VALUES
      (
        $1,
        $2,
        CURRENT_DATE,
        $3,
        'Allocated'
      )
      RETURNING allocation_id
      `,
      [
        asset_id,
        user_id,
        expected_return || null,
      ]
    );

    /* -----------------------------------------------------
       UPDATE ASSET STATUS
    ----------------------------------------------------- */

    await pool.query(
      `
      UPDATE assets
      SET status = 'Allocated'
      WHERE asset_id = $1
      `,
      [asset_id]
    );

    /* -----------------------------------------------------
       ACTIVITY LOG
    ----------------------------------------------------- */

    try {
      await logActivity(
        req.user.user_id,
        "Allocated Asset",
        "Assets",
        `Allocated asset ${asset.asset_name} (${asset.asset_tag}) to ${user.full_name}`
      );
    } catch (activityError) {
      console.error(
        "Allocation Activity Log Error:",
        activityError.message
      );
    }

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
        ($1, $2, $3)
        `,
        [
          "Asset Allocated",
          `${asset.asset_name} (${asset.asset_tag}) has been allocated to ${user.full_name}.`,
          "Asset",
        ]
      );
    } catch (notificationError) {
      console.error(
        "Allocation Notification Error:",
        notificationError.message
      );
    }

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    res.status(201).json({
      message: "Asset Allocated Successfully",
      allocation_id: allocation.rows[0].allocation_id,
    });

  } catch (err) {
    console.error("Allocate Asset Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   RETURN ASSET
========================================================= */

export const returnAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const { condition_notes } = req.body;

    /* -----------------------------------------------------
       GET ALLOCATION
    ----------------------------------------------------- */

    const allocation = await pool.query(
      `
      SELECT
        al.allocation_id,
        al.asset_id,
        al.user_id,
        a.asset_name,
        a.asset_tag,
        u.full_name
      FROM asset_allocations al
      JOIN assets a
        ON al.asset_id = a.asset_id
      JOIN users u
        ON al.user_id = u.user_id
      WHERE al.allocation_id = $1
      `,
      [id]
    );

    if (allocation.rows.length === 0) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    const record = allocation.rows[0];

    /* -----------------------------------------------------
       UPDATE ALLOCATION
    ----------------------------------------------------- */

    await pool.query(
      `
      UPDATE asset_allocations
      SET
        returned_date = CURRENT_DATE,
        allocation_status = 'Returned',
        condition_notes = $1
      WHERE allocation_id = $2
      `,
      [
        condition_notes || null,
        id,
      ]
    );

    /* -----------------------------------------------------
       UPDATE ASSET STATUS
    ----------------------------------------------------- */

    await pool.query(
      `
      UPDATE assets
      SET status = 'Available'
      WHERE asset_id = $1
      `,
      [record.asset_id]
    );

    /* -----------------------------------------------------
       ACTIVITY LOG
    ----------------------------------------------------- */

    try {
      await logActivity(
        req.user.user_id,
        "Returned Asset",
        "Assets",
        `Returned asset ${record.asset_name} (${record.asset_tag}) from ${record.full_name}`
      );
    } catch (activityError) {
      console.error(
        "Return Activity Log Error:",
        activityError.message
      );
    }

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
        ($1, $2, $3)
        `,
        [
          "Asset Returned",
          `${record.asset_name} (${record.asset_tag}) has been returned by ${record.full_name}.`,
          "Asset",
        ]
      );
    } catch (notificationError) {
      console.error(
        "Return Notification Error:",
        notificationError.message
      );
    }

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    res.json({
      message: "Asset Returned Successfully",
    });

  } catch (err) {
    console.error("Return Asset Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   DELETE ALLOCATION
========================================================= */

export const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    /* -----------------------------------------------------
       GET ALLOCATION BEFORE DELETE
    ----------------------------------------------------- */

    const allocation = await pool.query(
      `
      SELECT
        al.asset_id,
        a.asset_name,
        a.asset_tag,
        u.full_name
      FROM asset_allocations al
      JOIN assets a
        ON al.asset_id = a.asset_id
      JOIN users u
        ON al.user_id = u.user_id
      WHERE al.allocation_id = $1
      `,
      [id]
    );

    if (allocation.rows.length === 0) {
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    const record = allocation.rows[0];

    /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

    await pool.query(
      `
      DELETE FROM asset_allocations
      WHERE allocation_id = $1
      `,
      [id]
    );

    /* -----------------------------------------------------
       ACTIVITY LOG
    ----------------------------------------------------- */

    try {
      await logActivity(
        req.user.user_id,
        "Deleted Allocation",
        "Assets",
        `Deleted allocation of ${record.asset_name} (${record.asset_tag}) for ${record.full_name}`
      );
    } catch (activityError) {
      console.error(
        "Delete Allocation Activity Log Error:",
        activityError.message
      );
    }

    res.json({
      message: "Allocation Record Deleted",
    });

  } catch (err) {
    console.error("Delete Allocation Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   GET MY ALLOCATIONS
========================================================= */

export const getMyAllocations = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        al.allocation_id,
        al.asset_id,
        a.asset_name,
        a.asset_tag,
        al.user_id,
        u.full_name,
        al.allocated_date,
        al.expected_return,
        al.returned_date,
        al.allocation_status
      FROM asset_allocations al
      JOIN assets a
        ON al.asset_id = a.asset_id
      JOIN users u
        ON al.user_id = u.user_id
      WHERE al.user_id = $1
      ORDER BY al.allocation_id DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Get My Allocations Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   GET DEPARTMENT ALLOCATIONS
========================================================= */

export const getDepartmentAllocations = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const result = await pool.query(
      `
      SELECT
        al.allocation_id,
        al.asset_id,
        a.asset_name,
        a.asset_tag,
        al.user_id,
        u.full_name,
        u.department_id,
        al.allocated_date,
        al.expected_return,
        al.returned_date,
        al.allocation_status
      FROM asset_allocations al
      JOIN assets a
        ON al.asset_id = a.asset_id
      JOIN users u
        ON al.user_id = u.user_id
      WHERE u.department_id = $1
      ORDER BY al.allocation_id DESC
      `,
      [departmentId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(
      "Get Department Allocations Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =========================================================
   GET OVERDUE ALLOCATIONS
========================================================= */

export const getOverdueAllocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        al.allocation_id,
        al.asset_id,
        a.asset_name,
        a.asset_tag,
        a.serial_number,
        u.user_id,
        u.full_name,
        al.allocated_date,
        al.expected_return,
        al.returned_date,
        al.allocation_status,
        CURRENT_DATE - al.expected_return::date AS overdue_days
      FROM asset_allocations al
      JOIN assets a
        ON al.asset_id = a.asset_id
      JOIN users u
        ON al.user_id = u.user_id
      WHERE
        al.expected_return IS NOT NULL
        AND al.expected_return::date < CURRENT_DATE
        AND al.returned_date IS NULL
      ORDER BY al.expected_return ASC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(
      "Get Overdue Allocations Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};