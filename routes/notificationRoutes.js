import express from "express";

import {
  getNotifications,
  markAsRead,
  getLatestNotifications,
  getUnreadCount,
  markNotificationRead,
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All Notifications
router.get("/", authMiddleware, getNotifications);

// Old API (mark all as read)
router.put("/read", authMiddleware, markAsRead);

// Latest 8 Notifications
router.get("/latest", authMiddleware, getLatestNotifications);

// Unread Count
router.get("/unread-count", authMiddleware, getUnreadCount);

// Mark Single Notification
router.put("/read/:id", authMiddleware, markNotificationRead);

export default router;