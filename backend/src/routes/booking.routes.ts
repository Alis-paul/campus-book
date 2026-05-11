import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

// All booking routes require authentication
router.use(protect);

// Both faculty and students can read resources, their own bookings, and waitlists
router.get('/resources', bookingController.getResources);
router.get('/waitlists', bookingController.getUserWaitlists);
router.get('/', bookingController.getUserBookings);

// Check-in can be done by any authenticated user (faculty OR student scanning QR)
router.post('/checkin', bookingController.checkIn);

// Faculty/Admin Only Actions
router.post('/', restrictTo('faculty', 'admin'), bookingController.createBooking);
router.post('/waitlist', restrictTo('faculty', 'admin'), bookingController.joinWaitlist);
router.delete('/waitlist/:id', restrictTo('faculty', 'admin'), bookingController.leaveWaitlist);
router.delete('/:id', restrictTo('faculty', 'admin'), bookingController.deleteBooking);

export default router;
