const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Registration and Login
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', authenticateToken, userController.logoutUser);

// Other user routes
router.get('/', authenticateToken, userController.getUsers);
router.get('/:id', authenticateToken, userController.getUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
