import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

router.get('/stats', analyticsController.getDashboardStats);
router.get('/activity', analyticsController.getActivityStats);

router.use(protect);

router.get('/ai-usage', analyticsController.getAiUsageStats);

export default router;
