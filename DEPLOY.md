# 日记应用部署指南

## 数据库导入

备份文件 `diary_db_backup.sql` 包含了完整的数据库结构和数据。您可以按照以下步骤将其导入到服务器上：

### 方法一：使用命令行导入

1. 将 `diary_db_backup.sql` 文件上传到服务器

2. 在服务器上创建数据库（如果尚未创建）：
   ```sql
   CREATE DATABASE diary_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. 导入数据库：
   ```bash
   mysql -u 用户名 -p密码 < diary_db_backup.sql
   ```
   或者
   ```bash
   mysql -u 用户名 -p
   ```
   输入密码后执行：
   ```sql
   source /path/to/diary_db_backup.sql;
   ```

### 方法二：使用图形界面工具导入

如果您使用图形界面工具（如 phpMyAdmin）：

1. 创建名为 `diary_db` 的数据库
2. 选择该数据库，点击"导入"选项卡
3. 选择 `diary_db_backup.sql` 文件并执行导入

## 部署API服务器

1. 将代码上传到服务器

2. 安装依赖：
   ```bash
   npm install
   ```

3. 创建 `.env` 文件并配置：
   ```
   # 数据库配置
   DB_HOST=localhost
   DB_USER=您的数据库用户名
   DB_PASSWORD=您的数据库密码
   DB_NAME=diary_db
   DB_PORT=3306

   # JWT配置
   JWT_SECRET=您的JWT密钥（建议使用复杂的随机字符串）
   JWT_EXPIRES_IN=7d

   # 服务器配置
   PORT=3000
   ```

4. 启动服务器：
   ```bash
   # 使用PM2等进程管理工具在生产环境运行
   pm2 start index.js --name diary-api
   
   # 或者直接使用Node运行
   node index.js
   ```

## 数据库表结构

备份包含以下表：

1. `users` - 用户信息表
2. `diaries` - 日记表
3. `tags` - 标签表
4. `diary_tags` - 日记-标签关联表

## API接口

主要API接口包括：

### 认证
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/me` - 获取当前用户信息

### 日记
- GET `/api/diaries` - 获取所有日记
- POST `/api/diaries` - 创建新日记
- GET `/api/diaries/date/:date` - 根据日期获取日记列表
- GET `/api/diaries/:id` - 获取指定日记详情
- PUT `/api/diaries/:id` - 更新指定日记
- DELETE `/api/diaries/:id` - 删除指定日记 