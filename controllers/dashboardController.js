import pool from "../config/db.js";

// ============================================================
// GET DASHBOARD STATS
// ============================================================

export const getDashboardStats = async (req, res) => {
  try {
    // Make sure authentication middleware worked
    if (!req.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const assets = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM assets
    `);

    const availableAssets = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM assets
      WHERE status = 'Available'
    `);

    const allocatedAssets = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM assets
      WHERE status = 'Allocated'
    `);

    const departments = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM departments
    `);

    const users = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM users
    `);

    const pendingMaintenance = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM maintenance_requests
      WHERE maintenance_status = 'Pending'
    `);

    // Maintenance requests raised today
    const maintenanceToday = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM maintenance_requests
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // Upcoming bookings
    const bookings = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM resource_bookings
      WHERE booking_status = 'Upcoming'
    `);

    // Overdue allocations
    const overdueCount = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM asset_allocations
      WHERE returned = FALSE
      AND return_date < CURRENT_DATE
    `);

    // Detailed overdue allocations
    const overdueDetails = await pool.query(`
      SELECT
        al.allocation_id,
        a.asset_name,
        a.asset_tag,
        u.full_name,
        al.return_date
      FROM asset_allocations al

      JOIN assets a
        ON al.asset_id = a.asset_id

      JOIN users u
        ON al.user_id = u.user_id

      WHERE al.returned = FALSE
      AND al.return_date < CURRENT_DATE

      ORDER BY al.return_date ASC
    `);

    // Upcoming returns within next 7 days
    const upcomingReturns = await pool.query(`
      SELECT
        al.allocation_id,
        a.asset_name,
        a.asset_tag,
        u.full_name,
        al.expected_return
      FROM asset_allocations al

      JOIN assets a
        ON al.asset_id = a.asset_id

      JOIN users u
        ON al.user_id = u.user_id

      WHERE al.allocation_status = 'Allocated'
      AND al.expected_return >= CURRENT_DATE
      AND al.expected_return <= CURRENT_DATE + INTERVAL '7 days'

      ORDER BY al.expected_return ASC
    `);

    // Pending transfer requests
    const pendingTransfers = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM transfer_requests
      WHERE status = 'Requested'
    `);

    return res.status(200).json({
      success: true,

      totalAssets: assets.rows[0].count,

      availableAssets:
        availableAssets.rows[0].count,

      allocatedAssets:
        allocatedAssets.rows[0].count,

      totalDepartments:
        departments.rows[0].count,

      totalUsers:
        users.rows[0].count,

      pendingMaintenance:
        pendingMaintenance.rows[0].count,

      maintenanceToday:
        maintenanceToday.rows[0].count,

      upcomingBookings:
        bookings.rows[0].count,

      overdueAssets:
        overdueCount.rows[0].count,

      overdueDetails:
        overdueDetails.rows,

      upcomingReturns:
        upcomingReturns.rows,

      pendingTransfers:
        pendingTransfers.rows[0].count,
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET RECENT ACTIVITIES
// ============================================================

export const getRecentActivities = async (
  req,
  res
) => {
  try {
    if (!req.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await pool.query(`
      SELECT
        action,
        description,
        created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 8
    `);

    return res.status(200).json({
      success: true,
      activities: result.rows,
    });
  } catch (error) {
    console.error(
      "Recent activities error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET CHART DATA
// ============================================================

export const getChartData = async (
  req,
  res
) => {
  try {
    if (!req.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // --------------------------------------------------------
    // Asset status
    // --------------------------------------------------------

    const statusResult = await pool.query(`
      SELECT
        status,
        COUNT(*)::int AS count

      FROM assets

      GROUP BY status

      ORDER BY status
    `);

    // --------------------------------------------------------
    // Assets by category
    // --------------------------------------------------------

    const categoryResult = await pool.query(`
      SELECT
        c.category_name,
        COUNT(a.asset_id)::int AS count

      FROM asset_categories c

      LEFT JOIN assets a
        ON c.category_id = a.category_id

      GROUP BY c.category_name

      ORDER BY c.category_name
    `);

    // --------------------------------------------------------
    // Maintenance requests by month
    // --------------------------------------------------------

    const maintenanceResult = await pool.query(`
      SELECT
        TO_CHAR(
          DATE_TRUNC('month', created_at),
          'Mon'
        ) AS month,

        COUNT(*)::int AS count

      FROM maintenance_requests

      GROUP BY DATE_TRUNC(
        'month',
        created_at
      )

      ORDER BY DATE_TRUNC(
        'month',
        created_at
      )
    `);

    return res.status(200).json({
      success: true,

      statusData:
        statusResult.rows,

      categoryData:
        categoryResult.rows,

      maintenanceData:
        maintenanceResult.rows,
    });
  } catch (error) {
    console.error(
      "Chart data error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};