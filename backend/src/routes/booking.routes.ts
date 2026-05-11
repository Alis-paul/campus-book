import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

router.use(protect);

router.get('/resources', bookingController.getResources);
router.get('/waitlists', bookingController.getUserWaitlists);
router.get('/', bookingController.getUserBookings);

// Faculty/Admin Only Actions
router.post('/', restrictTo('faculty', 'FACULTY', 'admin'), bookingController.createBooking);
router.post('/waitlist', restrictTo('faculty', 'FACULTY', 'admin'), bookingController.joinWaitlist);
router.post('/checkin', bookingController.checkIn); // Already has internal role check for students
router.delete('/waitlist/:id', restrictTo('faculty', 'FACULTY', 'admin'), bookingController.leaveWaitlist);
router.delete('/:id', restrictTo('faculty', 'FACULTY', 'admin'), bookingController.deleteBooking);

export default router;
