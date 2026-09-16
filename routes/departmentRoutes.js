import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment
} from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", authMiddleware, getDepartments);
router.post("/", authMiddleware, addDepartment);
router.put("/:id", authMiddleware, updateDepartment);
router.delete("/:id", authMiddleware, deleteDepartment);

export default router;