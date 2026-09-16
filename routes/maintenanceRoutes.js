import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getMaintenance,
  addMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
  uploadMaintenancePhoto,
} from "../controllers/maintenanceController.js";

import maintenanceUpload from "../middleware/maintenanceUpload.js";

const router = express.Router();


// Get all maintenance requests
router.get(
  "/",
  authMiddleware,
  getMaintenance
);


// Create maintenance request
router.post(
  "/",
  authMiddleware,
  addMaintenance
);


// Update maintenance status
router.put(
  "/:id",
  authMiddleware,
  updateMaintenanceStatus
);


// Delete maintenance request
router.delete(
  "/:id",
  authMiddleware,
  deleteMaintenance
);


// Upload maintenance photo
router.post(
  "/:id/upload-photo",
  authMiddleware,
  maintenanceUpload.single("photo"),
  uploadMaintenancePhoto
);


export default router;