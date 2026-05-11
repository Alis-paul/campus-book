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

export default router;
