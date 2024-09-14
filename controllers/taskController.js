const pool = require('../config/db');

exports.createTask = async (req, res) => {
  const { title, project_id } = req.body;
  const userId = req.user.userId;
  try {
    // Check if the user is associated with the project
    const projectCheck = await pool.query(
      `SELECT p.* 
       FROM projects p
       JOIN user_projects up ON p.id = up.project_id
       WHERE p.id = $1 AND up.user_id = $2`,
      [project_id, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, project_id) VALUES ($1, $2) RETURNING *',
      [title, project_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT t.* 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       JOIN user_projects up ON p.id = up.project_id
       WHERE up.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT t.* 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       JOIN user_projects up ON p.id = up.project_id
       WHERE t.id = $1 AND up.user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, project_id } = req.body;
  const userId = req.user.userId;
  try {
    // Check if the user is associated with the task's current project
    const taskCheck = await pool.query(
      `SELECT t.* 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       JOIN user_projects up ON p.id = up.project_id
       WHERE t.id = $1 AND up.user_id = $2`,
      [id, userId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If project_id is being updated, check if the user is associated with the new project
    if (project_id) {
      const projectCheck = await pool.query(
        `SELECT p.* 
         FROM projects p
         JOIN user_projects up ON p.id = up.project_id
         WHERE p.id = $1 AND up.user_id = $2`,
        [project_id, userId]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Cannot move task to a project you do not have access to' });
      }
    }

    const result = await pool.query(
      'UPDATE tasks SET title = $1, project_id = $2 WHERE id = $3 RETURNING *',
      [title, project_id || taskCheck.rows[0].project_id, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    // Check if the user is associated with the task's project
    const taskCheck = await pool.query(
      `SELECT t.* 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       JOIN user_projects up ON p.id = up.project_id
       WHERE t.id = $1 AND up.user_id = $2`,
      [id, userId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
