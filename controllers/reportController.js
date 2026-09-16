import pool from "../config/db.js";

export const getReport = async (req, res) => {
  try {
    // ==========================
    // Summary
    // ==========================

    const totalAssets = await pool.query(
      "SELECT COUNT(*) FROM assets"
    );

    const availableAssets = await pool.query(
      "SELECT COUNT(*) FROM assets WHERE status='Available'"
    );

    const allocatedAssets = await pool.query(
      "SELECT COUNT(*) FROM assets WHERE status='Allocated'"
    );

    const maintenanceAssets = await pool.query(
      "SELECT COUNT(*) FROM maintenance_requests"
    );

    const bookings = await pool.query(
      "SELECT COUNT(*) FROM resource_bookings"
    );

    // ==========================
    // Assets by Category
    // ==========================

    const categoryWise = await pool.query(`
      SELECT
        c.category_name,
        COUNT(a.asset_id) AS total
      FROM asset_categories c
      LEFT JOIN assets a
      ON a.category_id = c.category_id
      GROUP BY c.category_name
      ORDER BY c.category_name
    `);

    // ==========================
    // Assets by Status
    // ==========================

    const statusWise = await pool.query(`
      SELECT
        status,
        COUNT(*) AS total
      FROM assets
      GROUP BY status
      ORDER BY status
    `);

    // ==========================
    // Department Allocation
    // ==========================

    const departmentWise = await pool.query(`
      SELECT
        d.department_name,
        COUNT(al.allocation_id) AS total_allocations
      FROM departments d
      LEFT JOIN users u
      ON u.department_id = d.department_id
      LEFT JOIN asset_allocations al
      ON al.user_id = u.user_id
      AND al.allocation_status = 'Allocated'
      GROUP BY d.department_name
      ORDER BY d.department_name
    `);

    // ==========================
    // Maintenance by Category
    // ==========================

    const maintenanceByCategory = await pool.query(`
      SELECT
        c.category_name,
        COUNT(m.maintenance_id) AS total_requests
      FROM asset_categories c
      LEFT JOIN assets a
      ON a.category_id = c.category_id
      LEFT JOIN maintenance_requests m
      ON m.asset_id = a.asset_id
      GROUP BY c.category_name
      ORDER BY c.category_name
    `);

    // ==========================
    // Assets Nearing Retirement
    // ==========================

    const nearingRetirement = await pool.query(`
      SELECT
        asset_tag,
        asset_name,
        purchase_date,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date)) AS age_years
      FROM assets
      WHERE purchase_date IS NOT NULL
      AND purchase_date <= CURRENT_DATE - INTERVAL '3 years'
      ORDER BY purchase_date ASC
    `);

    // ==========================
    // Booking Heatmap
    // ==========================

    const bookingHeatmap = await pool.query(`
      SELECT
        EXTRACT(HOUR FROM start_time) AS hour,
        COUNT(*) AS total
      FROM resource_bookings
      WHERE booking_status <> 'Cancelled'
      GROUP BY EXTRACT(HOUR FROM start_time)
      ORDER BY hour
    `);

    // ==========================
    // Response
    // ==========================

    res.json({
      totalAssets: Number(totalAssets.rows[0].count),

      availableAssets: Number(
        availableAssets.rows[0].count
      ),

      allocatedAssets: Number(
        allocatedAssets.rows[0].count
      ),

      maintenanceAssets: Number(
        maintenanceAssets.rows[0].count
      ),

      bookings: Number(
        bookings.rows[0].count
      ),

      categoryWise: categoryWise.rows.map((r) => ({
        ...r,
        total: Number(r.total),
      })),

      statusWise: statusWise.rows.map((r) => ({
        ...r,
        total: Number(r.total),
      })),

      departmentWise: departmentWise.rows.map((r) => ({
        ...r,
        total_allocations: Number(r.total_allocations),
      })),

      maintenanceByCategory: maintenanceByCategory.rows.map((r) => ({
        ...r,
        total_requests: Number(r.total_requests),
      })),

      nearingRetirement: nearingRetirement.rows.map((r) => ({
        ...r,
        age_years: Number(r.age_years),
      })),

      bookingHeatmap: bookingHeatmap.rows.map((r) => ({
        hour: Number(r.hour),
        total: Number(r.total),
      })),
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};