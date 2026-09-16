import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getDashboardStats,
  getRecentActivities,
  getChartData,
} from "../controllers/dashboardController.js";

const router = express.Router();

// ============================================================
// DASHBOARD
// All dashboard APIs require authentication
// ============================================================

router.get(
  "/",
  authMiddleware,
  getDashboardStats
);

router.get(
  "/recent-activities",
  authMiddleware,
  getRecentActivities
);

router.get(
  "/chart-data",
  authMiddleware,
  getChartData
);

export default router;