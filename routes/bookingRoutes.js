import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getBookings,
  addBooking,
  deleteBooking,
  checkBookingReminders,
   rescheduleBooking
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/check-reminders", authMiddleware, checkBookingReminders);
router.get("/", getBookings);
router.post("/", addBooking);
router.delete("/:id", deleteBooking);
router.put("/:id/reschedule", authMiddleware, rescheduleBooking);

export default router;