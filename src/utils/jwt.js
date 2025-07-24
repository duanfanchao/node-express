const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

// 生成Token（1分钟过期）
exports.generateToken = (payload, expiresIn = '5s') => {
    return jwt.sign(payload, secret, { expiresIn });
};

// 验证Token
exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        // 直接抛出原始错误，保留error.name
        throw error;
    }
};