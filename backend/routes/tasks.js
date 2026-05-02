const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAllTasks, updateTask, deleteTask, getDashboard } = require('../controllers/taskController');

router.use(authenticate);

router.get('/', getAllTasks);
router.get('/dashboard', getDashboard);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
