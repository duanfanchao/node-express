const { verifyToken } = require('../utils/jwt');

exports.authMiddleware = (req, res, next) => {
    // 从请求头获取token
    const token = req.headers['token']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ code: 401, data: null, resultMsg: '未提供token' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // 将解码后的用户信息附加到请求对象
        next();
    } catch (error) {
        // 根据错误类型返回不同的错误信息
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                code: 401,
                data: null,
                resultMsg: 'token已过期，请重新登录'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                code: 401,
                data: null,
                resultMsg: 'token无效，请重新登录'
            });
        }
        return res.status(401).json({
            code: 401,
            data: null,
            resultMsg: '认证失败，请重新登录'
        });
    }
};