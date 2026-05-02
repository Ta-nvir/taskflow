const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');

router.use(authenticate);

router.get('/', adminOnly, getAllUsers);
router.put('/:id/role', adminOnly, updateUserRole);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
