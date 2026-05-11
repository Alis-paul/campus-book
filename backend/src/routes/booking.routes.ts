import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

router.get('/resources', bookingController.getResources);

router.use(protect);

router.get('/waitlists', bookingController.getUserWaitlists);
router.get('/', bookingController.getUserBookings);
router.delete('/waitlist/:id', bookingController.leaveWaitlist);
router.delete('/:id', bookingController.deleteBooking);
router.post('/', bookingController.createBooking);
router.post('/waitlist', bookingController.joinWaitlist);
router.post('/checkin', bookingController.checkIn);

export default router;
