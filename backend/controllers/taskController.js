const pool = require('../config/db');

// Get tasks by project
const getTasksByProject = async (req, res) => {
  try {
    const [tasks] = await pool.query(`
      SELECT t.*, u.name as assigned_to_name, c.name as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.project_id = ?
      ORDER BY t.created_at DESC
    `, [req.params.projectId]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all tasks (admin: all, member: assigned or created)
const getAllTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      [tasks] = await pool.query(`
        SELECT t.*, u.name as assigned_to_name, c.name as created_by_name, p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        JOIN users c ON t.created_by = c.id
        JOIN projects p ON t.project_id = p.id
        ORDER BY t.created_at DESC
      `);
    } else {
      [tasks] = await pool.query(`
        SELECT t.*, u.name as assigned_to_name, c.name as created_by_name, p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        JOIN users c ON t.created_by = c.id
        JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_to = ? OR t.created_by = ?
        ORDER BY t.created_at DESC
      `, [req.user.id, req.user.id]);
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, assigned_to, due_date, project_id } = req.body;
    const projectId = req.params.projectId || project_id;

    if (!title) return res.status(400).json({ message: 'Task title is required.' });

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, priority, assigned_to, due_date, project_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', priority || 'medium', assigned_to || null, due_date || null, projectId, req.user.id]
    );
    res.status(201).json({ message: 'Task created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (tasks.length === 0) return res.status(404).json({ message: 'Task not found.' });

    const task = tasks[0];

    // Members can only update status of assigned tasks
    if (req.user.role !== 'admin' && task.created_by !== req.user.id && task.assigned_to !== req.user.id)
      return res.status(403).json({ message: 'Not authorized.' });

    await pool.query(
      'UPDATE tasks SET title=?, description=?, status=?, priority=?, assigned_to=?, due_date=? WHERE id=?',
      [
        title || task.title,
        description ?? task.description,
        status || task.status,
        priority || task.priority,
        assigned_to !== undefined ? assigned_to : task.assigned_to,
        due_date !== undefined ? due_date : task.due_date,
        req.params.id
      ]
    );
    res.json({ message: 'Task updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (tasks.length === 0) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role !== 'admin' && tasks[0].created_by !== req.user.id)
      return res.status(403).json({ message: 'Not authorized.' });

    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Dashboard stats
const getDashboard = async (req, res) => {
  try {
    let stats = {};
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const projectFilter = isAdmin ? '' : 'WHERE p.owner_id = ? OR pm.user_id = ?';
    const taskFilter = isAdmin ? '' : 'WHERE t.assigned_to = ? OR t.created_by = ?';
    const params = isAdmin ? [] : [userId, userId];

    const [projects] = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as total FROM projects p LEFT JOIN project_members pm ON p.id = pm.project_id ${projectFilter}`,
      params
    );

    const [taskStats] = await pool.query(
      `SELECT status, COUNT(*) as count FROM tasks t ${taskFilter} GROUP BY status`,
      params
    );

    const [overdueTasks] = await pool.query(
      `SELECT t.*, p.name as project_name, u.name as assigned_to_name
       FROM tasks t JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.due_date < CURDATE() AND t.status != 'done'
       ${isAdmin ? '' : 'AND (t.assigned_to = ? OR t.created_by = ?)'}
       ORDER BY t.due_date ASC LIMIT 10`,
      isAdmin ? [] : [userId, userId]
    );

    const [recentTasks] = await pool.query(
      `SELECT t.*, p.name as project_name, u.name as assigned_to_name
       FROM tasks t JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       ${isAdmin ? '' : 'WHERE t.assigned_to = ? OR t.created_by = ?'}
       ORDER BY t.created_at DESC LIMIT 5`,
      isAdmin ? [] : [userId, userId]
    );

    const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
    taskStats.forEach(s => { statusMap[s.status] = s.count; });

    stats = {
      totalProjects: projects[0].total,
      tasksByStatus: statusMap,
      overdueTasks,
      recentTasks
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getTasksByProject, getAllTasks, createTask, updateTask, deleteTask, getDashboard };
