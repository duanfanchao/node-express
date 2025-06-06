const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    用户登录
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    // 1. 检查用户名和密码
    if (!username || !password) {
        return res.status(400).json({ code: 1, data: null, resultMsg: '用户名和密码不能为空' });
    }

    try {
        // 2. 查询用户
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '用户名或密码错误' });
        }

        // 3. 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '用户名或密码错误' });
        }

        // 4. 生成 JWT Token
        const token = jwt.sign(
            { id: user._id, name: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 5. 返回 Token
        res.json({ code: 0, data: token, resultMsg: '登录成功' });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// @desc    用户注册
// @route   POST /api/auth/login
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;
    // 1. 检查用户名和密码
    if (!username || !password) {
        return res.status(400).json({ code: 1, data: null, resultMsg: '用户名和密码不能为空' });
    }

    try {
        // 2. 查询用户
        const user = await User.findOne({ username });
        if (user) {
            return res.status(409).json({ code: 1, data: null, resultMsg: '用户已存在，请更改用户名' });
        }

        // 创建新用户
        const newUser = new User({ name: username, password });
        await newUser.save();
        
        res.json({ code: 0, data: null, resultMsg: '注册成功' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                code: 1,
                data: null,
                resultMsg: '该用户名已被占用，请更换'
            });
        }
        console.error('注册失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
}