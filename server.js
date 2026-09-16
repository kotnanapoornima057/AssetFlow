import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import allocationRoutes from "./routes/allocationRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import assetIntelligenceRoutes from "./routes/assetIntelligenceRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

// ============================================================
// PATH SETUP
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config();

// ============================================================
// APP
// ============================================================

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ============================================================
// STATIC UPLOADS
// IMPORTANT FOR PROFILE PHOTOS
// ============================================================

const uploadsPath = path.join(__dirname, "uploads");

app.use(
  "/uploads",
  express.static(uploadsPath)
);

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/assets", assetRoutes);

app.use("/api/users", userRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/maintenance", maintenanceRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/allocations", allocationRoutes);

app.use("/api/transfers", transferRoutes);

app.use("/api", assetIntelligenceRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/activity", activityRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/audits", auditRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/settings", settingsRoutes);

app.use("/api/activity-logs", activityLogRoutes);

// ============================================================
// HOME
// ============================================================

app.get("/", (req, res) => {
  res.send("AssetFlow Backend Running...");
});

// ============================================================
// TEST PROFILE UPLOAD FOLDER
// ============================================================

app.get("/test-uploads", (req, res) => {
  res.json({
    success: true,
    uploadsPath: uploadsPath,
    message: "Uploads folder is configured correctly",
  });
});

// ============================================================
// TEST DATABASE
// ============================================================

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database Connected",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads folder: ${uploadsPath}`);
});