const express = require('express');
const cors = require('cors');
const { testConnection, initDatabase } = require('./config/db');
require('dotenv').config();

// 导入路由
const authRoutes = require('./routes/authRoutes');
const diaryRoutes = require('./routes/diaryRoutes');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 配置路由
app.use('/api/auth', authRoutes);
app.use('/api/diaries', diaryRoutes);

// 根路由
app.get('/', (req, res) => {
    res.json({ message: '欢迎使用日记应用API' });
});

// 初始化数据库并启动服务器
const start = async () => {
    try {
        // 测试数据库连接
        await testConnection();

        // 初始化数据库表
        await initDatabase();

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
};

start();
