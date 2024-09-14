// userProjects.js
const express = require('express');
const router = express.Router();
const userProjectController = require('../controllers/userProjectController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, userProjectController.assignUserToProject);
router.delete('/', authenticateToken, userProjectController.removeUserFromProject);
router.get('/user/:user_id', authenticateToken, userProjectController.getProjectsByUser);
router.get('/project/:project_id', authenticateToken, userProjectController.getUsersByProject);

module.exports = router;
