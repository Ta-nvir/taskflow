const pool = require('../config/db');

// Get all projects for current user
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      [projects] = await pool.query(`
        SELECT p.*, u.name as owner_name,
          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as done_count
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        ORDER BY p.created_at DESC
      `);
    } else {
      [projects] = await pool.query(`
        SELECT p.*, u.name as owner_name,
          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as done_count
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE p.owner_id = ? OR pm.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `, [req.user.id, req.user.id]);
    }
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, u.name as owner_name FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    const project = projects[0];

    // Check access
    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      const [membership] = await pool.query(
        'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      if (membership.length === 0) return res.status(403).json({ message: 'Access denied.' });
    }

    // Get members
    const [members] = await pool.query(`
      SELECT u.id, u.name, u.email, pm.role FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [req.params.id]);

    res.json({ ...project, members });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required.' });

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
      [name, description || '', req.user.id]
    );

    // Auto-add creator as admin member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, req.user.id, 'admin']
    );

    res.status(201).json({ message: 'Project created.', id: result.insertId, name, description });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    const project = projects[0];
    if (req.user.role !== 'admin' && project.owner_id !== req.user.id)
      return res.status(403).json({ message: 'Not authorized.' });

    await pool.query(
      'UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ?',
      [name || project.name, description ?? project.description, status || project.status, req.params.id]
    );
    res.json({ message: 'Project updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    if (req.user.role !== 'admin' && projects[0].owner_id !== req.user.id)
      return res.status(403).json({ message: 'Not authorized.' });

    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });

    const userId = users[0].id;
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?',
      [req.params.id, userId, role || 'member', role || 'member']
    );
    res.json({ message: 'Member added.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Remove member
const removeMember = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.params.userId]
    );
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
