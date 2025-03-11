# 日记应用API服务

这是一个基于Node.js和Express的RESTful API服务，为日记应用提供后端支持。它使用MySQL数据库存储用户和日记数据，并提供了用户认证和日记管理的功能。

## 特性

- 用户认证（注册、登录）
- JWT令牌验证
- 日记管理（创建、读取、更新、删除）
- 标签管理
- RESTful API设计

## 技术栈

- Node.js
- Express.js
- MySQL
- JWT认证
- bcrypt密码加密

## 环境要求

- Node.js (>= 12.x)
- MySQL (>= 5.7)

## 安装

1. 克隆仓库：

```bash
git clone <仓库URL>
cd diary-vue-app-api
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

创建一个`.env`文件在项目根目录，包含以下配置：

```
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=diary_db
DB_PORT=3306

# JWT配置
JWT_SECRET=你的密钥
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
```

4. 创建数据库：

在MySQL中创建名为`diary_db`的数据库：

```sql
CREATE DATABASE diary_db;
```

5. 启动服务：

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API端点

### 认证

- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/me` - 获取当前用户信息 (需要认证)

### 日记

- GET `/api/diaries` - 获取用户的所有日记 (需要认证)
- POST `/api/diaries` - 创建新日记 (需要认证)
- GET `/api/diaries/:id` - 获取指定日记详情 (需要认证)
- PUT `/api/diaries/:id` - 更新指定日记 (需要认证)
- DELETE `/api/diaries/:id` - 删除指定日记 (需要认证)

## 请求示例

### 注册用户

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user1",
  "password": "password123",
  "email": "user1@example.com"
}
```

### 登录

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "password123"
}
```

### 创建日记

```
POST /api/diaries
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "我的第一篇日记",
  "content": "今天天气很好...",
  "mood": "开心",
  "date_value": "2023-05-20",
  "tags": ["天气", "心情"]
}
```

## 许可证

MIT 