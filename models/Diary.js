const { pool } = require('../config/db');

class Diary {
    // 创建日记
    static async create(diaryData) {
        const { user_id, title, content, mood, date_value, tags = [] } = diaryData;

        // 处理日期格式
        let formattedDate = date_value;
        if (date_value) {
            console.log('模型层 - 原始日期值:', date_value, '类型:', typeof date_value);
            try {
                // 确保日期是YYYY-MM-DD格式的字符串
                // 这里不使用new Date()是为了避免时区问题
                if (typeof date_value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date_value)) {
                    formattedDate = date_value;
                } else {
                    // 如果不是标准格式，尝试转换
                    const dateObj = new Date(date_value);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toISOString().split('T')[0];
                    } else {
                        console.error('无效的日期格式:', date_value);
                        throw new Error('无效的日期格式');
                    }
                }
                console.log('模型层 - 处理后的日期值:', formattedDate);
            } catch (error) {
                console.error('日期处理错误:', error);
                throw error;
            }
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            let diaryId;

            // 插入日记
            try {
                const [diaryResult] = await connection.query(
                    'INSERT INTO diaries (user_id, title, content, mood, date_value) VALUES (?, ?, ?, ?, ?)',
                    [user_id, title, content, mood, formattedDate]
                );
                diaryId = diaryResult.insertId;
                console.log('日记插入成功，ID:', diaryId, '日期值:', formattedDate);
            } catch (sqlError) {
                console.error('SQL错误 - 插入日记:', sqlError);
                console.error('SQL参数:', [user_id, title, content, mood, formattedDate]);
                throw sqlError;
            }

            // 处理标签
            if (tags.length > 0) {
                for (const tagName of tags) {
                    // 检查标签是否已存在，不存在则创建
                    let tagId;
                    const [existingTags] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);

                    if (existingTags.length > 0) {
                        tagId = existingTags[0].id;
                    } else {
                        const [tagResult] = await connection.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
                        tagId = tagResult.insertId;
                    }

                    // 关联日记和标签
                    await connection.query('INSERT INTO diary_tags (diary_id, tag_id) VALUES (?, ?)', [diaryId, tagId]);
                }
            }

            await connection.commit();
            return diaryId;
        } catch (error) {
            await connection.rollback();
            console.error('创建日记错误:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // 更新日记
    static async update(id, diaryData) {
        const { title, content, mood, date_value, tags = [] } = diaryData;

        // 处理日期格式
        let formattedDate = date_value;
        if (date_value) {
            console.log('模型层更新 - 原始日期值:', date_value, '类型:', typeof date_value);
            try {
                // 确保日期是YYYY-MM-DD格式的字符串
                // 这里不使用new Date()是为了避免时区问题
                if (typeof date_value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date_value)) {
                    formattedDate = date_value;
                } else {
                    // 如果不是标准格式，尝试转换
                    const dateObj = new Date(date_value);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toISOString().split('T')[0];
                    } else {
                        console.error('无效的日期格式:', date_value);
                        throw new Error('无效的日期格式');
                    }
                }
                console.log('模型层更新 - 处理后的日期值:', formattedDate);
            } catch (error) {
                console.error('日期处理错误:', error);
                throw error;
            }
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 更新日记内容
            try {
                const [updateResult] = await connection.query(
                    'UPDATE diaries SET title = ?, content = ?, mood = ?, date_value = ? WHERE id = ?',
                    [title, content, mood, formattedDate, id]
                );
                console.log('日记更新结果:', updateResult, '日期值:', formattedDate);
                if (updateResult.affectedRows === 0) {
                    console.error('没有记录被更新');
                }
            } catch (sqlError) {
                console.error('SQL错误 - 更新日记:', sqlError);
                console.error('SQL参数:', [title, content, mood, formattedDate, id]);
                throw sqlError;
            }

            // 如果有提供新的标签，更新标签
            if (tags.length > 0) {
                // 删除旧的标签关联
                await connection.query('DELETE FROM diary_tags WHERE diary_id = ?', [id]);

                // 添加新标签
                for (const tagName of tags) {
                    // 检查标签是否已存在，不存在则创建
                    let tagId;
                    const [existingTags] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);

                    if (existingTags.length > 0) {
                        tagId = existingTags[0].id;
                    } else {
                        const [tagResult] = await connection.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
                        tagId = tagResult.insertId;
                    }

                    // 关联日记和标签
                    await connection.query('INSERT INTO diary_tags (diary_id, tag_id) VALUES (?, ?)', [id, tagId]);
                }
            }

            await connection.commit();

            return true;
        } catch (error) {
            await connection.rollback();
            console.error('更新日记错误:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // 删除日记
    static async delete(id) {
        try {
            // 触发外键级联删除相关的diary_tags记录
            const [result] = await pool.query('DELETE FROM diaries WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('删除日记错误:', error);
            throw error;
        }
    }

    // 根据ID获取日记详情，包含标签
    static async findById(id) {
        try {
            // 获取日记基本信息
            const [diaries] = await pool.query(
                `SELECT d.*, u.username 
         FROM diaries d
         JOIN users u ON d.user_id = u.id
         WHERE d.id = ?`,
                [id]
            );

            if (diaries.length === 0) {
                return null;
            }

            const diary = diaries[0];

            // 获取日记标签
            const [tags] = await pool.query(
                `SELECT t.name
         FROM tags t
         JOIN diary_tags dt ON t.id = dt.tag_id
         WHERE dt.diary_id = ?`,
                [id]
            );

            diary.tags = tags.map(tag => tag.name);

            return diary;
        } catch (error) {
            console.error('获取日记详情错误:', error);
            throw error;
        }
    }

    // 获取用户的日记列表
    static async findByUserId(userId) {
        try {
            // 获取用户的所有日记
            const [diaries] = await pool.query(
                `SELECT d.* 
         FROM diaries d
         WHERE d.user_id = ?
         ORDER BY d.date_value DESC`,
                [userId]
            );

            // 为每个日记获取标签
            const diariesWithTags = await Promise.all(diaries.map(async (diary) => {
                const [tags] = await pool.query(
                    `SELECT t.name
           FROM tags t
           JOIN diary_tags dt ON t.id = dt.tag_id
           WHERE dt.diary_id = ?`,
                    [diary.id]
                );

                return {
                    ...diary,
                    tags: tags.map(tag => tag.name)
                };
            }));

            return diariesWithTags;
        } catch (error) {
            console.error('获取用户日记列表错误:', error);
            throw error;
        }
    }

    // 根据日期获取用户的日记列表
    static async findByDate(userId, date) {
        try {
            console.log('按日期查询日记 - 用户ID:', userId, '日期:', date);

            // 验证日期格式
            let formattedDate = date;
            if (date && typeof date === 'string') {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    // 尝试转换日期格式
                    const dateObj = new Date(date);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toISOString().split('T')[0];
                    } else {
                        throw new Error('无效的日期格式');
                    }
                }
            }

            console.log('格式化后的日期:', formattedDate);

            // 获取指定日期的日记
            const [diaries] = await pool.query(
                `SELECT d.* 
                FROM diaries d
                WHERE d.user_id = ? AND d.date_value = ?
                ORDER BY d.created_at DESC`,
                [userId, formattedDate]
            );

            // 为每个日记获取标签
            const diariesWithTags = await Promise.all(diaries.map(async (diary) => {
                const [tags] = await pool.query(
                    `SELECT t.name
                    FROM tags t
                    JOIN diary_tags dt ON t.id = dt.tag_id
                    WHERE dt.diary_id = ?`,
                    [diary.id]
                );

                return {
                    ...diary,
                    tags: tags.map(tag => tag.name)
                };
            }));

            return diariesWithTags;
        } catch (error) {
            console.error('根据日期获取日记列表错误:', error);
            throw error;
        }
    }
}

module.exports = Diary;
