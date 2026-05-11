import { Router } from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import * as usersController from '../controllers/users.controller';

const router = Router();

router.use(protect);

router.get('/', usersController.getAllUsers);
router.get('/search', usersController.searchUsers);
router.get('/:id', usersController.getUser);
router.put('/:id', upload.single('avatar'), usersController.updateUser);

// Self-service role update (for users who registered with wrong role)
router.patch('/me/role', usersController.updateMyRole);

export default router;
