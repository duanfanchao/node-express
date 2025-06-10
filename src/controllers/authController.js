const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dayjs = require('dayjs');
const { generateToken } = require('../utils/jwt');
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
        const token = generateToken({ id: user._id, name: user.username });

        // 5. 返回 Token
        res.json({ code: 0, data: token, resultMsg: '登录成功' });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ code: 1, data: null, resultMsg: '服务器错误' });
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
            return res.status(200).json({
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
    const { username, password, startDate, endDate, pageSize = 10, pageIndex = 1 } = req.query;
    // 日期校验
    const dateFormat = 'YYYY-MM-DD HH:mm:ss';
    if (startDate && !dayjs(startDate, dateFormat).isValid()) {
        return res.status(400).json({ code: 1, data: null, resultMsg: '开始日期格式无效' });
    }

    if (endDate && !dayjs(endDate, dateFormat).isValid()) {
        return res.status(400).json({ code: 1, data: null, resultMsg: '结束日期格式无效' });
    }
    if (isNaN(pageSize)) {
        return res.status(400).json({ code: 1, data: null, resultMsg: 'pageSize必须是数字' });
    }
    if (isNaN(pageIndex)) {
        return res.status(400).json({ code: 1, data: null, resultMsg: 'pageIndex必须是数字' });
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
        // 计算跳过的文档数量
        const skip = (pageIndex - 1) * pageSize;
        const limit = parseInt(pageSize);
        // 并行执行查询：获取总条数和当前页数据
        const [total, userData] = await Promise.all([
            User.countDocuments(query), // 获取符合条件的总条数
            User.find(query)
                .skip(skip)            // 跳过前面的记录
                .limit(limit)          // 限制返回数量
        ]);
        const formattedUsers = userData.map(user => {
            return {
                id: user._id.toString(), // 将 ObjectId 转为字符串
                name: user.name,
                password: user.password,
                hashPassword: user.hashPassword,
                createdAt: dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            };
        });
        res.json({ code: 0, data: { list: formattedUsers, total }, resultMsg: '获取用户信息成功' });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// @desc    新增用户
// @route   POST /api/auth/addUser
exports.newAddUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(200).json({ code: 1, data: null, resultMsg: '用户名和密码不能为空' });
    }
    try {
        const user = await User.findOne({ username });
        if (user) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '用户已存在，请更改用户名' });
        }
        const newUser = new User({ name: username, password });
        await newUser.save();
        res.json({ code: 0, data: null, resultMsg: '新增成功' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({
                code: 1,
                data: null,
                resultMsg: '该用户名已被占用，请更换'
            });
        }
        console.error('注册失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// @desc    编辑用户
// @route   POST /api/auth/editUser
exports.editUser = async (req, res) => {
    const { id, username, password } = req.body;
    if (!id) {
        return res.status(400).json({
            code: 1,
            resultMsg: '用户ID不能为空'
        });
    }
    if (!username) {
        return res.status(200).json({
            code: 1,
            resultMsg: '用户名不能为空'
        });
    }
    if (!password) {
        return res.status(200).json({
            code: 1,
            resultMsg: '密码不能为空'
        });
    }
    try {
        // 检查用户是否存在
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '用户不存在' });
        }
        // 检查用户名是否已存在（排除当前用户）
        const userWithSameName = await User.findOne({ name: username, _id: { $ne: id } });
        if (userWithSameName) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '用户名已存在' });
        }
        // 更新用户信息
        existingUser.name = username;
        existingUser.password = password;
        await existingUser.save();
        res.status(200).json({ code: 0, data: null, resultMsg: '编辑成功' });
    } catch (error) {
        console.error('编辑用户失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// @desc    删除用户
// @route   POST /api/auth/deleteUser
exports.deleteUser = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({
            code: 1,
            resultMsg: '用户ID不能为空'
        });
    }
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(200).json({
                code: 1,
                resultMsg: '用户不存在或已被删除'
            });
        }
        res.status(200).json({
            code: 0,
            resultMsg: `用户 ${deletedUser.name} 删除成功`,
            data: {
                id: deletedUser._id,
                name: deletedUser.name
            }
        });
    } catch (error) {
        console.error('删除用户失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
}