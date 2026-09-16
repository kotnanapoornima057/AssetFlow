import express from "express";

import {
  login,
  register,
  changePassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;