const express = require('express');
const router = express.Router();
// const { check } = require('express-validator');
const {
    loginUser,
    registerUser,
} = require('../controllers/authController');

// 注册路由
router.post('/login', loginUser);
router.post('/register', registerUser);

module.exports = router;