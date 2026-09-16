import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllocations,
  allocateAsset,
  returnAsset,
  deleteAllocation,
  getMyAllocations,
  getDepartmentAllocations,
  getOverdueAllocations
} from "../controllers/allocationController.js";

const router = express.Router();

router.get("/", authMiddleware, getAllocations);
router.post("/", authMiddleware, allocateAsset);
router.put("/:id/return", authMiddleware, returnAsset);
router.delete("/:id", authMiddleware, deleteAllocation);
router.get("/my/:userId", authMiddleware, getMyAllocations);
router.get("/department/:departmentId", authMiddleware, getDepartmentAllocations);
router.get("/overdue", authMiddleware, getOverdueAllocations);

export default router;