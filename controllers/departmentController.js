import pool from "../config/db.js";
export const getDepartments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.department_id,
        d.department_name,
        d.status,
        d.parent_department_id,
        p.department_name AS parent_department_name,
        d.department_head_id,
        u.full_name AS department_head_name
      FROM departments d
      LEFT JOIN departments p ON d.parent_department_id = p.department_id
      LEFT JOIN users u ON d.department_head_id = u.user_id
      ORDER BY d.department_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addDepartment = async (req, res) => {
  try {
    const { department_name, parent_department_id, department_head_id } = req.body;

    if (!department_name || !department_name.trim()) {
      return res.status(400).json({
        message: "Department name is required"
      });
    }

    await pool.query(
      "INSERT INTO departments(department_name, parent_department_id, department_head_id) VALUES($1,$2,$3)",
      [department_name, parent_department_id || null, department_head_id || null]
    );

    await pool.query(
      `INSERT INTO notifications
      (title, message, notification_type)
      VALUES ($1, $2, $3)`,
      [
        "Department Added",
        `${department_name} department created.`,
        "Department"
      ]
    );

    res.json({
      message: "Department Added Successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name, status, parent_department_id, department_head_id } = req.body;

    if (!department_name || !department_name.trim()) {
      return res.status(400).json({
        message: "Department name is required"
      });
    }

    await pool.query(
      "UPDATE departments SET department_name=$1, status=$2, parent_department_id=$3, department_head_id=$4 WHERE department_id=$5",
      [department_name, status || "Active", parent_department_id || null, department_head_id || null, id]
    );

    res.json({
      message: "Department Updated Successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM departments WHERE department_id=$1",
      [id]
    );

    res.json({
      message: "Department Deleted"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};