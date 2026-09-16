import pool from "../config/db.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

/* =====================================================
   GET ALL USERS
===================================================== */

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.profile_photo,
        u.department_id,
        d.department_name
      FROM users u
      LEFT JOIN departments d
        ON u.department_id = d.department_id
      ORDER BY u.user_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET USERS ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =====================================================
   GET CURRENT LOGGED-IN USER
===================================================== */

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.profile_photo,
        u.department_id,
        d.department_name
      FROM users u
      LEFT JOIN departments d
        ON u.department_id = d.department_id
      WHERE u.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =====================================================
   ADD USER
===================================================== */

export const addUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      department_id,
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password,
        role,
        department_id
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        full_name,
        email,
        hashed,
        role,
        department_id || null,
      ]
    );

    res.json({
      message: "User Added Successfully",
    });
  } catch (err) {
    console.error("ADD USER ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =====================================================
   DELETE USER
===================================================== */

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM users WHERE user_id = $1",
      [id]
    );

    res.json({
      message: "User Deleted",
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =====================================================
   UPDATE USER
===================================================== */

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      email,
      role,
      status,
      department_id,
    } = req.body;

    await pool.query(
      `
      UPDATE users
      SET
        full_name = $1,
        email = $2,
        role = $3,
        status = $4,
        department_id = $5
      WHERE user_id = $6
      `,
      [
        full_name,
        email,
        role,
        status,
        department_id || null,
        id,
      ]
    );

    res.json({
      message: "User Updated Successfully",
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =====================================================
   CHANGE PASSWORD
===================================================== */

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      oldPassword,
      newPassword,
    } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const valid = await bcrypt.compare(
      oldPassword,
      user.rows[0].password
    );

    if (!valid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE user_id = $2
      `,
      [
        hashedPassword,
        userId,
      ]
    );

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


/* =====================================================
   UPLOAD PROFILE PHOTO
===================================================== */

export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    /* ---------------------------------------------
       GET CURRENT PHOTO
    --------------------------------------------- */

    const current = await pool.query(
      `
      SELECT profile_photo
      FROM users
      WHERE user_id = $1
      `,
      [userId]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const oldPhoto = current.rows[0].profile_photo;

    /* ---------------------------------------------
       UPDATE DATABASE
    --------------------------------------------- */

    await pool.query(
      `
      UPDATE users
      SET profile_photo = $1
      WHERE user_id = $2
      `,
      [
        req.file.filename,
        userId,
      ]
    );

    /* ---------------------------------------------
       DELETE OLD PHOTO
       ONLY AFTER DATABASE UPDATE
    --------------------------------------------- */

    if (oldPhoto) {
      const oldPath = path.join(
        process.cwd(),
        "uploads",
        "profiles",
        oldPhoto
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    /* ---------------------------------------------
       RETURN UPDATED USER
    --------------------------------------------- */

    const updatedUser = await pool.query(
      `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.profile_photo,
        u.department_id,
        d.department_name
      FROM users u
      LEFT JOIN departments d
        ON u.department_id = d.department_id
      WHERE u.user_id = $1
      `,
      [userId]
    );

    res.json({
      message: "Profile photo uploaded successfully",
      photo: req.file.filename,
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.error("PROFILE PHOTO ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};