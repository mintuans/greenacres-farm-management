import express from 'express';
import * as scheduleController from '../../controllers/management/schedule.controller';

const router = express.Router();

// GET /api/management/schedules - Lấy tất cả lịch trình
router.get('/', scheduleController.getAllSchedules);

// GET /api/management/schedules/by-date?date=2026-01-16 - Lấy lịch theo ngày
router.get('/by-date', scheduleController.getSchedulesByDate);

// GET /api/management/schedules/by-month?year=2026&month=1 - Lấy lịch theo tháng
router.get('/by-month', scheduleController.getSchedulesByMonth);

// GET /api/management/schedules/season/:seasonId - Lấy lịch theo mùa vụ
router.get('/season/:seasonId', scheduleController.getSchedulesBySeason);

export default router;
