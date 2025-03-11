const Diary = require('../models/Diary');

// 创建日记
exports.createDiary = async (req, res) => {
    try {
        const { title, content, mood, date_value, tags } = req.body;

        console.log('创建日记 - 请求体:', req.body);
        console.log('创建日记 - 日期值:', date_value, '类型:', typeof date_value);

        // 验证必需字段
        if (!title) {
            return res.status(400).json({ message: '日记标题不能为空' });
        }

        // 处理日期格式
        let formattedDateValue = date_value;
        if (date_value) {
            try {
                // 确保日期格式正确
                const dateObj = new Date(date_value);
                if (!isNaN(dateObj.getTime())) {
                    // 转换为MySQL日期格式 YYYY-MM-DD
                    formattedDateValue = dateObj.toISOString().split('T')[0];
                    console.log('处理后的日期值:', formattedDateValue);
                } else {
                    console.log('无效的日期值');
                    return res.status(400).json({ message: '日期格式无效' });
                }
            } catch (error) {
                console.error('日期处理错误:', error);
                return res.status(400).json({ message: '日期格式无效' });
            }
        }

        // 创建日记记录
        const diaryId = await Diary.create({
            user_id: req.user.id, // 从认证中间件获取的用户ID
            title,
            content,
            mood,
            date_value: formattedDateValue,
            tags
        });

        // 获取创建的日记详情
        const diary = await Diary.findById(diaryId);

        res.status(201).json({
            message: '日记创建成功',
            diary
        });
    } catch (error) {
        console.error('创建日记错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 更新日记
exports.updateDiary = async (req, res) => {
    try {
        console.log('更新日记 - 原始请求体:', req.body);
        const { id } = req.params;
        const { title, content, mood, date_value, tags } = req.body;

        console.log('更新日记 - 日期值:', date_value, '类型:', typeof date_value);

        // 验证必需字段
        if (!title) {
            return res.status(400).json({ message: '日记标题不能为空' });
        }

        // 处理日期格式
        let formattedDateValue = date_value;
        if (date_value) {
            try {
                // 确保日期格式正确
                const dateObj = new Date(date_value);
                if (!isNaN(dateObj.getTime())) {
                    // 转换为MySQL日期格式 YYYY-MM-DD
                    formattedDateValue = dateObj.toISOString().split('T')[0];
                    console.log('处理后的日期值:', formattedDateValue);
                } else {
                    console.log('无效的日期值');
                    return res.status(400).json({ message: '日期格式无效' });
                }
            } catch (error) {
                console.error('日期处理错误:', error);
                return res.status(400).json({ message: '日期格式无效' });
            }
        }

        // 检查日记是否存在并属于当前用户
        const existingDiary = await Diary.findById(id);
        if (!existingDiary) {
            return res.status(404).json({ message: '日记不存在' });
        }

        if (existingDiary.user_id !== req.user.id) {
            return res.status(403).json({ message: '无权修改此日记' });
        }

        // 更新日记
        await Diary.update(id, {
            title,
            content,
            mood,
            date_value: formattedDateValue,
            tags
        });

        // 获取更新后的日记详情
        const updatedDiary = await Diary.findById(id);

        res.status(200).json({
            message: '日记更新成功',
            diary: updatedDiary
        });
    } catch (error) {
        console.error('更新日记错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 删除日记
exports.deleteDiary = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查日记是否存在并属于当前用户
        const existingDiary = await Diary.findById(id);
        if (!existingDiary) {
            return res.status(404).json({ message: '日记不存在' });
        }

        if (existingDiary.user_id !== req.user.id) {
            return res.status(403).json({ message: '无权删除此日记' });
        }

        // 删除日记
        await Diary.delete(id);

        res.status(200).json({ message: '日记删除成功' });
    } catch (error) {
        console.error('删除日记错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取日记详情
exports.getDiary = async (req, res) => {
    try {
        const { id } = req.params;

        // 获取日记详情
        const diary = await Diary.findById(id);
        if (!diary) {
            return res.status(404).json({ message: '日记不存在' });
        }

        // 检查权限，只有日记所有者可以查看
        if (diary.user_id !== req.user.id) {
            return res.status(403).json({ message: '无权查看此日记' });
        }

        res.status(200).json({ diary });
    } catch (error) {
        console.error('获取日记详情错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取用户的日记列表
exports.getUserDiaries = async (req, res) => {
    try {
        // 获取用户日记列表
        const diaries = await Diary.findByUserId(req.user.id);

        res.status(200).json({
            count: diaries.length,
            diaries
        });
    } catch (error) {
        console.error('获取用户日记列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 根据日期获取日记列表
exports.getDiariesByDate = async (req, res) => {
    try {
        const { date } = req.params;

        console.log('根据日期获取日记 - 日期参数:', date);

        // 验证日期格式
        if (!date) {
            return res.status(400).json({ message: '日期参数不能为空' });
        }

        try {
            // 尝试使用标准日期格式验证
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                const dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) {
                    return res.status(400).json({ message: '无效的日期格式，请使用YYYY-MM-DD格式' });
                }
            }
        } catch (error) {
            return res.status(400).json({ message: '无效的日期格式，请使用YYYY-MM-DD格式' });
        }

        // 获取指定日期的日记列表
        const diaries = await Diary.findByDate(req.user.id, date);

        res.status(200).json({
            date,
            count: diaries.length,
            diaries
        });
    } catch (error) {
        console.error('根据日期获取日记列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};
