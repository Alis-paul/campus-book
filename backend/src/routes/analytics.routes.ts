import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

router.use(protect);

router.get('/stats', analyticsController.getDashboardStats);
router.get('/activity', analyticsController.getActivityStats);
router.get('/ai-usage', analyticsController.getAiUsageStats);

export default router;
