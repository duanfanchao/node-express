const express = require('express');
const router = express.Router();
// const { check } = require('express-validator');
const {
    loginUser,
    registerUser,
    getUserInfo,
} = require('../controllers/authController');

// 注册路由
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/userInfo', getUserInfo);

module.exports = router;