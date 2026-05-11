import { Router } from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import { validate } from '../middleware/validate';
import { createPostSchema, commentSchema } from '../validators/post.validator';
import * as postsController from '../controllers/posts.controller';

const router = Router();

router.use(protect);

router.route('/')
  .get(postsController.getPosts)
  .post(upload.single('image'), validate(createPostSchema), postsController.createPost);

router.route('/:id')
  .delete(postsController.deletePost);

router.post('/:id/like', postsController.likePost);
router.post('/:id/comment', validate(commentSchema), postsController.commentOnPost);

export default router;
