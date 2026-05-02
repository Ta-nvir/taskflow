const pool = require('../config/db');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role))
      return res.status(400).json({ message: 'Invalid role.' });
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser };
