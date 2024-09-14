// userProjectController.js
const pool = require('../config/db');

exports.assignUserToProject = async (req, res) => {
  const { user_id, project_id } = req.body;
  const userId = req.user.userId; // Authenticated user's ID
  try {
    // Check if the authenticated user is the owner of the project
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [project_id, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if the user to be assigned exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Assign the user to the project
    const result = await pool.query(
      'INSERT INTO user_projects (user_id, project_id) VALUES ($1, $2) RETURNING *',
      [user_id, project_id]
    );
    res.status(201).json({ message: 'User assigned to project successfully' });
  } catch (error) {
    // Handle duplicate assignments
    if (error.code === '23505') {
      return res.status(400).json({ error: 'User is already assigned to this project' });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getProjectsByUser = async (req, res) => {
  const { user_id } = req.params;
  const authUserId = req.user.userId;

  // Allow users to view their own projects or admins (if roles are implemented)
  if (parseInt(user_id) !== authUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      `SELECT p.* 
       FROM projects p
       JOIN user_projects up ON p.id = up.project_id
       WHERE up.user_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUsersByProject = async (req, res) => {
  const { project_id } = req.params;
  const userId = req.user.userId;

  // Check if the authenticated user is the owner of the project
  const projectCheck = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
    [project_id, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      `SELECT u.* 
       FROM users u
       JOIN user_projects up ON u.id = up.user_id
       WHERE up.project_id = $1`,
      [project_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeUserFromProject = async (req, res) => {
  const { user_id, project_id } = req.body;
  const userId = req.user.userId;

  // Check if the authenticated user is the owner of the project
  const projectCheck = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
    [project_id, userId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM user_projects WHERE user_id = $1 AND project_id = $2',
      [user_id, project_id]
    );
    res.json({ message: 'User removed from project successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

