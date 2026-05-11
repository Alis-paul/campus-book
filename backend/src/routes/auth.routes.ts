import { Router } from 'express';
import { validate } from '../middleware/validate';
import { apiLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.use(apiLimiter);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', validate(refreshSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
