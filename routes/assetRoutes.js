import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAssets,
  addAsset,
  deleteAsset,
  updateAsset,
  getAssetHistory,
  uploadAssetImage,
  getAssetDetails,
  getAssetTimeline,
  getAssetIntelligence
} from "../controllers/assetController.js";
import upload from "../middleware/upload.js";
const router = express.Router();

router.get("/", authMiddleware, getAssets);
router.post("/", authMiddleware, addAsset);
router.get("/:id/details", getAssetDetails);
router.put("/:id", authMiddleware, updateAsset);
router.get("/:id/timeline", authMiddleware, getAssetTimeline);
router.delete("/:id", authMiddleware, deleteAsset);
router.get("/:id/history", authMiddleware, getAssetHistory);
router.get("/intelligence", getAssetIntelligence);
router.post("/:id/upload-image", authMiddleware, upload.single("image"), uploadAssetImage);
export default router;