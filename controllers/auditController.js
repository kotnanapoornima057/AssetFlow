import pool from "../config/db.js";

// Get all audit cycles
export const getAudits = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.audit_id,
        a.audit_name,
        d.department_name,
        a.start_date,
        a.end_date,
        a.auditor_name,
        au.full_name AS auditor_full_name,
        a.status,
        a.closed_at
      FROM asset_audits a
      LEFT JOIN departments d ON a.department_id = d.department_id
      LEFT JOIN users au ON a.auditor_id = au.user_id
      ORDER BY audit_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create audit cycle + auto-populate audit items with all assets in scope
export const addAudit = async (req, res) => {
  try {
    const {
      audit_name,
      department_id,
      start_date,
      end_date,
      auditor_name,
      auditor_id,
    } = req.body;

    const audit = await pool.query(
      `INSERT INTO asset_audits
       (audit_name, department_id, start_date, end_date, auditor_name, auditor_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,'Open')
       RETURNING audit_id`,
      [audit_name, department_id, start_date, end_date, auditor_name, auditor_id || null]
    );

    const auditId = audit.rows[0].audit_id;

    // Auto-add all assets (optionally scoped by department via allocations)
    const assets = await pool.query("SELECT asset_id FROM assets");

    for (const a of assets.rows) {
      await pool.query(
        `INSERT INTO audit_items (audit_id, asset_id, verification_status)
         VALUES ($1, $2, 'Pending')`,
        [auditId, a.asset_id]
      );
    }

    res.json({ message: "Audit Cycle Created", audit_id: auditId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get audit items (assets to verify) for a specific audit cycle
export const getAuditItems = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        ai.audit_item_id,
        ai.asset_id,
        a.asset_tag,
        a.asset_name,
        ai.verification_status,
        ai.remarks
       FROM audit_items ai
       JOIN assets a ON ai.asset_id = a.asset_id
       WHERE ai.audit_id = $1
       ORDER BY ai.audit_item_id`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auditor marks a single asset: Verified / Missing / Damaged
export const updateAuditItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { verification_status, remarks } = req.body;

    await pool.query(
      `UPDATE audit_items
       SET verification_status=$1, remarks=$2
       WHERE audit_item_id=$3`,
      [verification_status, remarks || null, itemId]
    );

    res.json({ message: "Item Updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Discrepancy report: only flagged items (Missing / Damaged) for a cycle
export const getDiscrepancies = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        ai.audit_item_id,
        a.asset_tag,
        a.asset_name,
        ai.verification_status,
        ai.remarks
       FROM audit_items ai
       JOIN assets a ON ai.asset_id = a.asset_id
       WHERE ai.audit_id = $1
       AND ai.verification_status IN ('Missing','Damaged')`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Close audit cycle — lock it and update asset statuses for confirmed-missing items
export const closeAudit = async (req, res) => {
  try {
    const { id } = req.params;

    // Mark missing assets as 'Lost'
    const missingItems = await pool.query(
      `SELECT asset_id FROM audit_items
       WHERE audit_id=$1 AND verification_status='Missing'`,
      [id]
    );

    for (const item of missingItems.rows) {
      await pool.query(
        "UPDATE assets SET status='Lost' WHERE asset_id=$1",
        [item.asset_id]
      );
    }

    // Mark damaged assets as 'Under Maintenance'
    const damagedItems = await pool.query(
      `SELECT asset_id FROM audit_items
       WHERE audit_id=$1 AND verification_status='Damaged'`,
      [id]
    );

    for (const item of damagedItems.rows) {
      await pool.query(
        "UPDATE assets SET status='Under Maintenance' WHERE asset_id=$1",
        [item.asset_id]
      );
    }

    await pool.query(
      `UPDATE asset_audits
       SET status='Closed', closed_at=CURRENT_TIMESTAMP
       WHERE audit_id=$1`,
      [id]
    );

    res.json({ message: "Audit Cycle Closed Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};