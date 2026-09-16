import pool from "../config/db.js";

export const getTransfers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.transfer_id,
        t.asset_id,
        a.asset_name,
        a.asset_tag,
        t.from_user_id,
        fu.full_name AS from_user_name,
        t.to_user_id,
        tu.full_name AS to_user_name,
        t.requested_by,
        ru.full_name AS requested_by_name,
        t.status,
        t.requested_at,
        t.approved_at
      FROM transfer_requests t
      JOIN assets a ON t.asset_id = a.asset_id
      LEFT JOIN users fu ON t.from_user_id = fu.user_id
      JOIN users tu ON t.to_user_id = tu.user_id
      JOIN users ru ON t.requested_by = ru.user_id
      ORDER BY t.requested_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const requestTransfer = async (req, res) => {
  try {
    const { asset_id, to_user_id, requested_by } = req.body;

    if (!asset_id || !to_user_id || !requested_by) {
      return res.status(400).json({
        message: "Asset, target user, and requester are required"
      });
    }

    const current = await pool.query(
      `SELECT user_id FROM asset_allocations
       WHERE asset_id=$1 AND allocation_status='Allocated'
       ORDER BY allocation_id DESC LIMIT 1`,
      [asset_id]
    );

    const fromUserId = current.rows.length > 0 ? current.rows[0].user_id : null;

    await pool.query(
      `INSERT INTO transfer_requests
       (asset_id, from_user_id, to_user_id, requested_by, status)
       VALUES ($1, $2, $3, $4, 'Requested')`,
      [asset_id, fromUserId, to_user_id, requested_by]
    );

    res.json({ message: "Transfer Request Raised Successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by } = req.body;

    const transfer = await pool.query(
      "SELECT * FROM transfer_requests WHERE transfer_id=$1",
      [id]
    );

    if (transfer.rows.length === 0) {
      return res.status(404).json({ message: "Transfer request not found" });
    }

    const t = transfer.rows[0];

    // If a Department Head is approving, restrict to their own department
    if (req.user.role === "Department Head") {
      const approver = await pool.query(
        "SELECT department_id FROM users WHERE user_id=$1",
        [req.user.id]
      );

      const toUserDept = await pool.query(
        "SELECT department_id FROM users WHERE user_id=$1",
        [t.to_user_id]
      );

      const approverDept = approver.rows[0]?.department_id;
      const targetDept = toUserDept.rows[0]?.department_id;

      if (!approverDept || approverDept !== targetDept) {
        return res.status(403).json({
          message: "You can only approve transfers within your own department"
        });
      }
    }

    await pool.query(
      `UPDATE transfer_requests
       SET status=$1, approved_at=CURRENT_TIMESTAMP, approved_by=$2
       WHERE transfer_id=$3`,
      [status, approved_by || null, id]
    );

    if (status === "Approved") {
      if (t.from_user_id) {
        await pool.query(
          `UPDATE asset_allocations
           SET returned_date=CURRENT_DATE, allocation_status='Returned'
           WHERE asset_id=$1 AND user_id=$2 AND allocation_status='Allocated'`,
          [t.asset_id, t.from_user_id]
        );
      }

      await pool.query(
        `INSERT INTO asset_allocations
         (asset_id, user_id, allocated_date, allocation_status)
         VALUES ($1, $2, CURRENT_DATE, 'Allocated')`,
        [t.asset_id, t.to_user_id]
      );

      await pool.query(
        "UPDATE assets SET status='Allocated' WHERE asset_id=$1",
        [t.asset_id]
      );
    }

    res.json({ message: `Transfer ${status}` });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM transfer_requests WHERE transfer_id=$1",
      [id]
    );

    res.json({ message: "Transfer Request Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};