const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

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

// @desc    获取用户信息
// @route   GET /api/auth/userinfo
exports.getUserInfo = async (req, res) => {
    const { username, password, startDate, endDate } = req.query;
    // 日期校验
    const dateFormat = 'YYYY-MM-DD HH:mm:ss';
    if (startDate && !dayjs(startDate, dateFormat).isValid()) {
        return res.status(400).json({ code: 1, data: null, resultMsg: '开始日期格式无效' });
    }

    if (endDate && !dayjs(endDate, dateFormat).isValid()) {
        return res.status(400).json({ code: 1, data: null, resultMsg: '结束日期格式无效' });
    }

    try {
        // 参数
        let query = {};
        // 只有传了字段才加入查询条件
        if (username) query.name = username;
        if (password) query.password = password;
        if (startDate) {
            query.createdAt = { $gte: dayjs(startDate).startOf('day').toDate() };
        }
        if (endDate) {
            query.createdAt = { ...query.createdAt, $lte: dayjs(endDate).endOf('day').toDate() };
        }

        const userData = await User.find(query);
        const formattedUsers = userData.map(user => {
            return {
                id: user._id.toString(), // 将 ObjectId 转为字符串
                name: user.name,
                password: user.password,
                hashPassword: user.hashPassword,
                createdAt: dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            };
        });
        res.json({ code: 0, data: { list: formattedUsers, total: formattedUsers.length }, resultMsg: '获取用户信息成功' });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }

}