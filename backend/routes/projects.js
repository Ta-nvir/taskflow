const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');
const { getTasksByProject, createTask } = require('../controllers/taskController');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.get('/:projectId/tasks', getTasksByProject);
router.post('/:projectId/tasks', createTask);

module.exports = router;
