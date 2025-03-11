const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    // 根据用户名查找用户
    static async findByUsername(username) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('查找用户错误:', error);
            throw error;
        }
    }

    // 根据ID查找用户
    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('查找用户错误:', error);
            throw error;
        }
    }

    // 创建新用户
    static async create(userData) {
        const { username, password, email } = userData;

        try {
            // 对密码进行加密
            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await pool.query(
                'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                [username, hashedPassword, email]
            );

            return result.insertId;
        } catch (error) {
            console.error('创建用户错误:', error);
            throw error;
        }
    }

    // 验证用户密码
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;
