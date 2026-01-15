import express from 'express';
import * as dashboardController from '../../controllers/management/dashboard.controller';

const router = express.Router();

// GET /api/management/dashboard/stats - Lấy thống kê tổng quan
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/management/dashboard/cash-flow - Lấy lịch sử dòng tiền
router.get('/cash-flow', dashboardController.getCashFlowHistory);

// GET /api/management/dashboard/low-stock - Lấy vật tư sắp hết
router.get('/low-stock', dashboardController.getLowStockItems);

// GET /api/management/dashboard/top-workers - Lấy nhân viên có số dư cao nhất
router.get('/top-workers', dashboardController.getTopWorkers);

export default router;
