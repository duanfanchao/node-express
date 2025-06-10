const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
// const { check } = require('express-validator');
const {
    loginUser,
    registerUser,
    getUserInfo,
    newAddUser,
    editUser,
    deleteUser,
} = require('../controllers/authController');

// 注册路由
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/userInfo', authMiddleware, getUserInfo);
router.post('/addUser', authMiddleware, newAddUser);
router.post('/editUser', authMiddleware, editUser);
router.post('/deleteUser', authMiddleware, deleteUser);

module.exports = router;