const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 添加额外的连接选项，禁用严格模式
  dateStrings: true, // 将日期作为字符串返回，避免时区问题
  timezone: '+08:00', // 设置时区为东八区
  // 禁用严格模式
  flags: '-STRICT_TRANS_TABLES,ALLOW_INVALID_DATES'
});

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

// 初始化数据库表
const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建日记表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS diaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT,
        mood VARCHAR(20),
        date_value DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 创建标签表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(30) NOT NULL UNIQUE
      )
    `);

    // 创建日记标签关联表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS diary_tags (
        diary_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (diary_id, tag_id),
        FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    console.log('数据库表初始化成功');
    connection.release();
  } catch (error) {
    console.error('数据库表初始化失败:', error);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initDatabase
};
