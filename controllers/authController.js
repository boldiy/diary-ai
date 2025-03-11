const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// 用户注册
exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 检查用户名是否已存在
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: '用户名已存在' });
        }

        // 创建用户
        const userId = await User.create({
            username,
            password,
            email
        });

        // 获取创建的用户数据（不包含密码）
        const user = await User.findById(userId);

        res.status(201).json({
            message: '注册成功',
            user
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 查找用户
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isPasswordValid = await User.validatePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 返回用户信息和token（不包含密码）
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            message: '登录成功',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
    try {
        // req.user 由认证中间件设置
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};
