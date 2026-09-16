import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTransfers,
  requestTransfer,
  updateTransferStatus,
  deleteTransfer
} from "../controllers/transferController.js";

const router = express.Router();

router.get("/", authMiddleware, getTransfers);
router.post("/", authMiddleware, requestTransfer);
router.put("/:id", authMiddleware, updateTransferStatus);
router.delete("/:id", authMiddleware, deleteTransfer);

export default router;