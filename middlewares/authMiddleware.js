const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// 验证 JWT 令牌的中间件
const authenticate = async (req, res, next) => {
    try {
        // 从请求头中获取令牌
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '未提供认证令牌' });
        }

        const token = authHeader.split(' ')[1];

        // 验证令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 从数据库中查找用户
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: '认证失败：用户不存在' });
        }

        // 将用户信息添加到请求对象
        req.user = {
            id: user.id,
            username: user.username
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: '认证令牌已过期' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: '无效的认证令牌' });
        }

        console.error('认证中间件错误:', error);
        return res.status(500).json({ message: '服务器错误' });
    }
};

module.exports = {
    authenticate
};
