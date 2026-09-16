import pool from "../config/db.js";

// Get all bookings (joined with asset name and user name)
export const getBookings = async (req, res) => {
  try {
    // Auto-refresh statuses before returning the list
    await pool.query(`
      UPDATE resource_bookings
      SET booking_status = 'Ongoing'
      WHERE booking_status = 'Upcoming'
      AND start_time <= NOW()
      AND end_time > NOW()
    `);

    await pool.query(`
      UPDATE resource_bookings
      SET booking_status = 'Completed'
      WHERE booking_status IN ('Upcoming', 'Ongoing')
      AND end_time <= NOW()
    `);

    const result = await pool.query(`
      SELECT
        b.booking_id,
        b.asset_id,
        a.asset_name,
        b.user_id,
        u.full_name,
        b.start_time,
        b.end_time,
        b.booking_status
      FROM resource_bookings b
      JOIN assets a ON b.asset_id = a.asset_id
      JOIN users u ON b.user_id = u.user_id
      ORDER BY b.start_time DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a booking (with overlap validation)
export const addBooking = async (req, res) => {
  try {
    const { asset_id, user_id, start_time, end_time } = req.body;

    if (!asset_id || !user_id || !start_time || !end_time) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    // Check for overlapping bookings on the same asset
    const overlapCheck = await pool.query(
      `SELECT * FROM resource_bookings
       WHERE asset_id = $1
       AND booking_status != 'Cancelled'
       AND start_time < $3
       AND end_time > $2`,
      [asset_id, start_time, end_time]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({
        message: "This resource is already booked during that time slot"
      });
    }

    await pool.query(
      `INSERT INTO resource_bookings
       (asset_id, user_id, start_time, end_time, booking_status)
       VALUES ($1, $2, $3, $4, 'Upcoming')`,
      [asset_id, user_id, start_time, end_time]
    );

    res.json({ message: "Booking Created Successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel/delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM resource_bookings WHERE booking_id=$1",
      [id]
    );

    res.json({ message: "Booking Cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check for bookings starting within the next hour and create reminder notifications
export const checkBookingReminders = async (req, res) => {
  try {
    const upcoming = await pool.query(`
      SELECT
        b.booking_id,
        b.user_id,
        a.asset_name,
        b.start_time
      FROM resource_bookings b
      JOIN assets a ON b.asset_id = a.asset_id
      WHERE b.booking_status = 'Upcoming'
      AND b.reminder_sent = FALSE
      AND b.start_time > NOW()
      AND b.start_time <= NOW() + INTERVAL '1 hour'
    `);

    for (const booking of upcoming.rows) {
      await pool.query(
        `INSERT INTO notifications (title, message, notification_type)
         VALUES ($1, $2, $3)`,
        [
          "Booking Reminder",
          `Your booking for ${booking.asset_name} starts soon at ${new Date(booking.start_time).toLocaleString()}.`,
          "Booking",
        ]
      );

      await pool.query(
        "UPDATE resource_bookings SET reminder_sent = TRUE WHERE booking_id = $1",
        [booking.booking_id]
      );
    }

    res.json({ message: `Checked reminders, ${upcoming.rows.length} notification(s) created.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Automatically update booking statuses based on current time
export const refreshBookingStatuses = async (req, res) => {
  try {
    // Mark bookings as Ongoing if current time is between start and end
    await pool.query(`
      UPDATE resource_bookings
      SET booking_status = 'Ongoing'
      WHERE booking_status = 'Upcoming'
      AND start_time <= NOW()
      AND end_time > NOW()
    `);

    // Mark bookings as Completed if end_time has passed
    await pool.query(`
      UPDATE resource_bookings
      SET booking_status = 'Completed'
      WHERE booking_status IN ('Upcoming', 'Ongoing')
      AND end_time <= NOW()
    `);

    res.json({ message: "Booking statuses refreshed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    const booking = await pool.query(
      "SELECT asset_id FROM resource_bookings WHERE booking_id=$1",
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const assetId = booking.rows[0].asset_id;

    const overlapCheck = await pool.query(
      `SELECT * FROM resource_bookings
       WHERE asset_id=$1 AND booking_id != $2
       AND booking_status != 'Cancelled'
       AND start_time < $4 AND end_time > $3`,
      [assetId, id, start_time, end_time]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({
        message: "New time slot conflicts with an existing booking"
      });
    }

    await pool.query(
      `UPDATE resource_bookings
       SET start_time=$1, end_time=$2, booking_status='Upcoming', reminder_sent=FALSE
       WHERE booking_id=$3`,
      [start_time, end_time, id]
    );

    res.json({ message: "Booking Rescheduled Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};