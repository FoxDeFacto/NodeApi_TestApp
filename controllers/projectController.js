const pool = require('../config/db');

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.userId;
  try {
    // Create the project with owner_id
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, userId]
    );
    const projectId = result.rows[0].id;

    // Assign the project to the user
    await pool.query(
      'INSERT INTO user_projects (user_id, project_id) VALUES ($1, $2)',
      [userId, projectId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT p.* 
       FROM projects p
       JOIN user_projects up ON p.id = up.project_id
       WHERE up.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT p.* 
       FROM projects p
       JOIN user_projects up ON p.id = up.project_id
       WHERE p.id = $1 AND up.user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.userId;
  try {
    // Check if the user is the owner of the project
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update the project
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    // Check if the user is the owner of the project
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the project
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    // Remove entries from user_projects
    await pool.query('DELETE FROM user_projects WHERE project_id = $1', [id]);

    res.status(202).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
