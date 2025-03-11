const express = require('express');
const diaryController = require('../controllers/diaryController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// 所有日记相关路由都需要认证
router.use(authenticate);

// 获取用户的所有日记
router.get('/', diaryController.getUserDiaries);

// 获取指定日期的日记列表 - 放在/:id路由之前避免冲突
router.get('/date/:date', diaryController.getDiariesByDate);

// 创建新日记
router.post('/', diaryController.createDiary);

// 获取日记详情
router.get('/:id', diaryController.getDiary);

// 更新日记
router.put('/:id', diaryController.updateDiary);

// 删除日记
router.delete('/:id', diaryController.deleteDiary);

module.exports = router;
