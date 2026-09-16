import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  getUsers,
  getCurrentUser,
  addUser,
  deleteUser,
  updateUser,
  changePassword,
  uploadProfilePhoto,
} from "../controllers/userController.js";

const router = express.Router();


/* =====================================================
   GET ALL USERS
===================================================== */

router.get("/", getUsers);


/* =====================================================
   GET CURRENT LOGGED-IN USER
===================================================== */

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);


/* =====================================================
   PROFILE PHOTO
===================================================== */

router.put(
  "/profile-photo",
  authMiddleware,
  upload.single("photo"),
  uploadProfilePhoto
);


/* =====================================================
   ADD USER
===================================================== */

router.post(
  "/",
  addUser
);


/* =====================================================
   CHANGE PASSWORD
   IMPORTANT: BEFORE /:id
===================================================== */

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);


/* =====================================================
   UPDATE USER
===================================================== */

router.put(
  "/:id",
  updateUser
);


/* =====================================================
   DELETE USER
===================================================== */

router.delete(
  "/:id",
  deleteUser
);


export default router;