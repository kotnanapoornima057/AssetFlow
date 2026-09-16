import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// ============================================================
// REGISTER
// ============================================================

export const register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      department_id,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      `SELECT user_id
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users
       (
         full_name,
         email,
         password,
         role,
         department_id,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         user_id,
         full_name,
         email,
         role,
         department_id,
         status,
         profile_photo`,
      [
        full_name,
        email,
        hashedPassword,
        role || "Employee",
        department_id || null,
        "Active",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=================================");
    console.log("LOGIN REQUEST");
    console.log("Email received:", email);
    console.log("Password received:", password ? "YES" : "NO");
    console.log("=================================");

    // Validate input
    if (!email || !password) {
      console.log("LOGIN FAILED: Email or password missing");

      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const result = await pool.query(
      `SELECT
        user_id,
        full_name,
        email,
        password,
        role,
        department_id,
        status,
        profile_photo
       FROM users
       WHERE email = $1`,
      [email]
    );

    // TEMPORARY DEBUGGING
    console.log("LOGIN EMAIL:", email);
    console.log("USER FOUND:", result.rows.length);

    // User not found
    if (result.rows.length === 0) {
      console.log("LOGIN FAILED: User not found");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    // TEMPORARY DEBUGGING
    console.log("USER:", {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    // TEMPORARY DEBUGGING
    console.log("PASSWORD MATCH:", passwordMatch);

    if (!passwordMatch) {
      console.log("LOGIN FAILED: Password does not match");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check user status
    if (
      user.status &&
      user.status.toLowerCase() !== "active"
    ) {
      console.log(
        "LOGIN FAILED: User is not active. Status:",
        user.status
      );

      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Never send password to frontend
    const userData = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      status: user.status,
      profile_photo: user.profile_photo || null,
    };

    console.log("LOGIN SUCCESS");
    console.log("User ID:", user.user_id);
    console.log("Role:", user.role);
    console.log("Token created successfully");
    console.log("=================================");

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ============================================================
// CHANGE PASSWORD
// ============================================================

export const changePassword = async (req, res) => {
  try {
    /*
     * Your database primary key is user_id.
     *
     * We support both user_id and id here so this works
     * with either form of authentication middleware.
     */

    const userId =
      req.user?.user_id ||
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters long.",
      });
    }

    // Find user
    const result = await pool.query(
      `SELECT password
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    // Check current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Update password
    await pool.query(
      `UPDATE users
       SET password = $1
       WHERE user_id = $2`,
      [hashedPassword, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while changing password.",
    });
  }
};