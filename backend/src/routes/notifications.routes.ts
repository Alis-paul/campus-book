import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as notificationsController from '../controllers/notifications.controller';

const router = Router();

router.use(protect);

router.get('/', notificationsController.getNotifications);
router.put('/:id/read', notificationsController.markAsRead);

export default router;
