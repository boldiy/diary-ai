# 数据库结构

这个目录包含日记应用的数据库结构。

## 文件说明

- `schema.sql` - 包含完整的数据库表结构（不含数据）

## 数据库表

数据库包含以下表：

1. `users` - 用户信息表
   - 存储用户账号、密码和邮箱信息

2. `diaries` - 日记表
   - 存储用户的日记内容、心情、日期等信息

3. `tags` - 标签表
   - 存储所有标签信息

4. `diary_tags` - 日记-标签关联表
   - 存储日记和标签之间的多对多关系

## 导入数据库结构

您可以使用以下命令导入数据库结构：

```bash
# 创建数据库
mysql -u 用户名 -p -e "CREATE DATABASE diary_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入结构
mysql -u 用户名 -p diary_db < database/schema.sql
```

## 初始化数据

项目代码在首次运行时会自动创建必要的数据库表，因此也可以不使用schema.sql文件，而是直接运行应用程序进行初始化。 