const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, projectController.createProject);
router.get('/', authenticateToken, projectController.getProjects);
router.get('/:id', authenticateToken, projectController.getProject);
router.put('/:id', authenticateToken, projectController.updateProject);
router.delete('/:id', authenticateToken, projectController.deleteProject);

module.exports = router;
