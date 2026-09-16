import express from "express";
import {
  getAudits,
  addAudit,
  getAuditItems,
  updateAuditItem,
  getDiscrepancies,
  closeAudit,
} from "../controllers/auditController.js";

const router = express.Router();

router.get("/", getAudits);
router.post("/", addAudit);
router.get("/:id/items", getAuditItems);
router.put("/items/:itemId", updateAuditItem);
router.get("/:id/discrepancies", getDiscrepancies);
router.put("/:id/close", closeAudit);

export default router;