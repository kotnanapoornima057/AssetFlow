import express from "express";

import {
  getAssetIntelligence
} from "../controllers/assetIntelligenceController.js";

const router = express.Router();

router.get(
  "/asset-intelligence",
  getAssetIntelligence
);

export default router;