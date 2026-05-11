import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// Public analytics endpoints (no auth required)
router.get('/stats', analyticsController.getDashboardStats);
router.get('/activity', analyticsController.getActivityStats);

// Protected analytics endpoints (auth required)
router.get('/ai-usage', protect, analyticsController.getAiUsageStats);

export default router;
